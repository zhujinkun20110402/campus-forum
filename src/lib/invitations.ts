import "server-only"

import { randomInt } from "node:crypto"
import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export const INVITE_UNLOCK_DAYS = 3
export const MEMBER_INVITE_COUNT = 3
export const MAX_ADMIN_INVITE_BATCH = 25

const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
const INVITE_RACE_ERROR = "INVITE_ALREADY_CONSUMED"

export type InviteRegistrationFailure =
  | "INVALID_INVITE"
  | "NAME_TAKEN"
  | "EMAIL_TAKEN"
  | "RETRY_REQUIRED"

export interface InviteGrantState {
  eligible: boolean
  granted: boolean
  unlockAt: Date
}

function generateInviteCode() {
  const characters = Array.from({ length: 12 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)])
  return `CF-${characters.slice(0, 4).join("")}-${characters.slice(4, 8).join("")}-${characters.slice(8).join("")}`
}

function generateInviteBatch(count: number) {
  return Array.from({ length: count }, generateInviteCode)
}

export function normalizeInviteCode(value: string) {
  const compact = value.trim().toUpperCase().replace(/[^A-Z2-9]/g, "")
  if (compact.length === 14 && compact.startsWith("CF")) {
    return `CF-${compact.slice(2, 6)}-${compact.slice(6, 10)}-${compact.slice(10, 14)}`
  }
  return value.trim().toUpperCase()
}

export function getInviteUnlockAt(createdAt: Date) {
  return new Date(createdAt.getTime() + INVITE_UNLOCK_DAYS * 24 * 60 * 60 * 1000)
}

export async function createUserWithInvite(input: {
  name: string
  email: string
  passwordHash: string
  inviteCode: string
}): Promise<{ ok: true; userId: string } | { ok: false; reason: InviteRegistrationFailure }> {
  const normalizedCode = normalizeInviteCode(input.inviteCode)

  try {
    return await prisma.$transaction(
      async (tx) => {
        const invite = await tx.inviteCode.findUnique({
          where: { code: normalizedCode },
          select: { id: true, usedAt: true },
        })

        if (!invite || invite.usedAt) return { ok: false as const, reason: "INVALID_INVITE" as const }

        const [existingByName, existingByEmail] = await Promise.all([
          tx.user.findFirst({ where: { name: input.name }, select: { id: true } }),
          tx.user.findUnique({ where: { email: input.email }, select: { id: true } }),
        ])

        if (existingByName) return { ok: false as const, reason: "NAME_TAKEN" as const }
        if (existingByEmail) return { ok: false as const, reason: "EMAIL_TAKEN" as const }

        const user = await tx.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: input.passwordHash,
          },
          select: { id: true },
        })

        const consumed = await tx.inviteCode.updateMany({
          where: { id: invite.id, usedAt: null },
          data: { usedById: user.id, usedAt: new Date() },
        })

        if (consumed.count !== 1) throw new Error(INVITE_RACE_ERROR)
        return { ok: true as const, userId: user.id }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    )
  } catch (error) {
    if (error instanceof Error && error.message === INVITE_RACE_ERROR) {
      return { ok: false, reason: "INVALID_INVITE" }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const existingByEmail = await prisma.user.findUnique({
          where: { email: input.email },
          select: { id: true },
        })
        return { ok: false, reason: existingByEmail ? "EMAIL_TAKEN" : "RETRY_REQUIRED" }
      }
      if (error.code === "P2034") return { ok: false, reason: "RETRY_REQUIRED" }
    }

    throw error
  }
}

export async function ensureMemberInviteGrant(userId: string): Promise<InviteGrantState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, inviteGrantClaimedAt: true },
  })

  if (!user) throw new Error("用户不存在")

  const unlockAt = getInviteUnlockAt(user.createdAt)
  const eligible = unlockAt.getTime() <= Date.now()
  if (user.inviteGrantClaimedAt || !eligible) {
    return { eligible, granted: !!user.inviteGrantClaimedAt, unlockAt }
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.$transaction(async (tx) => {
        const claimed = await tx.user.updateMany({
          where: {
            id: userId,
            inviteGrantClaimedAt: null,
            createdAt: { lte: new Date(Date.now() - INVITE_UNLOCK_DAYS * 24 * 60 * 60 * 1000) },
          },
          data: { inviteGrantClaimedAt: new Date() },
        })

        if (claimed.count !== 1) return false

        await tx.inviteCode.createMany({
          data: generateInviteBatch(MEMBER_INVITE_COUNT).map((code) => ({
            code,
            source: "MEMBER_GRANT",
            createdById: userId,
          })),
        })
        return true
      })

      // A false result means another concurrent request completed the one-time grant first.
      return { eligible: true, granted: true, unlockAt }
    } catch (error) {
      const isCodeCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
      if (!isCodeCollision || attempt === 2) throw error
    }
  }

  return { eligible: true, granted: false, unlockAt }
}

export async function createAdminInviteCodes(adminId: string, count: number) {
  const safeCount = Math.max(1, Math.min(MAX_ADMIN_INVITE_BATCH, Math.floor(count)))

  for (let attempt = 0; attempt < 3; attempt++) {
    const codes = generateInviteBatch(safeCount)
    try {
      await prisma.inviteCode.createMany({
        data: codes.map((code) => ({ code, source: "ADMIN", createdById: adminId })),
      })
      return codes
    } catch (error) {
      const isCodeCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
      if (!isCodeCollision || attempt === 2) throw error
    }
  }

  throw new Error("邀请码生成失败")
}

export async function getInviteCenterData(userId: string, isAdmin: boolean) {
  const grant = await ensureMemberInviteGrant(userId)

  const [user, ownedCodes, adminStats, recentCodes] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { createdAt: true, inviteGrantClaimedAt: true },
    }),
    prisma.inviteCode.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, code: true, source: true, createdAt: true, usedAt: true },
    }),
    isAdmin
      ? prisma.$transaction([
          prisma.inviteCode.count(),
          prisma.inviteCode.count({ where: { usedAt: null } }),
          prisma.inviteCode.count({ where: { usedAt: { not: null } } }),
        ])
      : Promise.resolve(null),
    isAdmin
      ? prisma.inviteCode.findMany({
          take: 100,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            code: true,
            source: true,
            createdAt: true,
            usedAt: true,
            createdBy: { select: { name: true, email: true } },
            usedBy: { select: { name: true, email: true } },
          },
        })
      : Promise.resolve(null),
  ])

  return {
    grant,
    createdAt: user.createdAt,
    ownedCodes,
    ownedStats: {
      total: ownedCodes.length,
      available: ownedCodes.filter((code) => !code.usedAt).length,
      used: ownedCodes.filter((code) => !!code.usedAt).length,
    },
    adminStats: adminStats
      ? { total: adminStats[0], available: adminStats[1], used: adminStats[2] }
      : null,
    recentCodes,
  }
}

export async function getSuccessfulInviteCount(userId: string) {
  return prisma.inviteCode.count({ where: { createdById: userId, usedAt: { not: null } } })
}
