"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getBeijingDayKey } from "@/lib/beijing-time"
import { NOTIFICATION_TYPES } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import {
  DAILY_XP_CAP,
  MAX_ACTIVE_RELATIONSHIPS,
  MAX_XP,
  XP_VALUES,
  getLevel,
  getRelationshipType,
} from "@/lib/relationship-config"
import type { XpAction } from "@/lib/relationship-config"
import { countActiveRelationships, isMutualFollow } from "@/lib/relationships"
import { relationshipRequestSchema } from "@/lib/validations"

class RelationshipRuleError extends Error {}

async function requireActor() {
  const session = await auth()
  if (!session?.user?.id) throw new RelationshipRuleError("请先登录")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (!user || user.role === "BANNED") throw new RelationshipRuleError("当前账号无法进行该操作")
  return session.user.id
}

type ActionResult = { success: boolean; message: string }

function fail(error: unknown): ActionResult {
  return {
    success: false,
    message: error instanceof RelationshipRuleError ? error.message : "操作没有完成，请稍后再试",
  }
}

/**
 * 向互关好友发出关系绑定申请。
 */
export async function sendRelationshipRequest(_prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const viewerId = await requireActor()
    const validated = relationshipRequestSchema.safeParse({
      targetId: formData.get("targetId"),
      type: formData.get("type"),
      message: formData.get("message"),
    })

    if (!validated.success) {
      return { success: false, message: validated.error.issues[0]?.message ?? "请检查填写内容" }
    }

    const { targetId, type, message } = validated.data
    const typeName = getRelationshipType(type)?.name ?? type

    if (targetId === viewerId) return { success: false, message: "不能和自己绑定关系" }

    const [target, mutual, viewerBond, targetBond, viewerCount, pending] = await Promise.all([
      prisma.user.findUnique({ where: { id: targetId }, select: { id: true, role: true } }),
      isMutualFollow(viewerId, targetId),
      prisma.relationship.findFirst({
        where: { type, OR: [{ userAId: viewerId }, { userBId: viewerId }] },
        select: { id: true },
      }),
      prisma.relationship.findFirst({
        where: { type, OR: [{ userAId: targetId }, { userBId: targetId }] },
        select: { id: true },
      }),
      countActiveRelationships(viewerId),
      prisma.relationshipRequest.findFirst({
        where: {
          status: "PENDING",
          type,
          OR: [
            { fromUserId: viewerId, toUserId: targetId },
            { fromUserId: targetId, toUserId: viewerId },
          ],
        },
        select: { id: true, fromUserId: true },
      }),
    ])

    if (!target || target.role === "BANNED") return { success: false, message: "对方不存在或暂不可用" }
    if (!mutual) return { success: false, message: "只有互相关注的好友才能绑定关系" }
    if (viewerBond) return { success: false, message: `你已经和另一位成员绑定了「${typeName}」关系` }
    if (targetBond) return { success: false, message: `对方已经和另一位成员绑定了「${typeName}」关系` }
    if (viewerCount >= MAX_ACTIVE_RELATIONSHIPS) {
      return { success: false, message: `每位成员最多同时绑定 ${MAX_ACTIVE_RELATIONSHIPS} 段关系，先去整理一下旧关系吧` }
    }
    if (pending) {
      return pending.fromUserId === viewerId
        ? { success: false, message: "你已经向对方发出过这种关系的申请，等待回应即可" }
        : { success: false, message: "对方已经向你发出同种关系的申请，去收件箱处理吧" }
    }

    const request = await prisma.$transaction(async (tx) => {
      // 清理同方向的历史申请记录，控制表体积
      await tx.relationshipRequest.deleteMany({
        where: {
          fromUserId: viewerId,
          toUserId: targetId,
          type,
          status: { not: "PENDING" },
        },
      })
      return tx.relationshipRequest.create({
        data: {
          fromUserId: viewerId,
          toUserId: targetId,
          type,
          message: message || null,
        },
      })
    })

    await prisma.notification.create({
      data: {
        userId: targetId,
        actorId: viewerId,
        type: NOTIFICATION_TYPES.RELATIONSHIP_REQUEST,
        requestId: request.id,
      },
    })

    revalidatePath("/relationships")
    revalidatePath(`/profile/${targetId}`)
    return { success: true, message: `「${typeName}」申请已发送，等待对方回应` }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 处理收到的关系申请：同意或婉拒。
 */
export async function respondRelationshipRequest(requestId: string, action: "accept" | "decline"): Promise<ActionResult> {
  try {
    const viewerId = await requireActor()
    const request = await prisma.relationshipRequest.findFirst({
      where: { id: requestId, toUserId: viewerId, status: "PENDING" },
    })
    if (!request) return { success: false, message: "该申请不存在或已被处理" }

    const partnerId = request.fromUserId
    const typeName = getRelationshipType(request.type)?.name ?? request.type

    if (action === "decline") {
      await prisma.$transaction([
        prisma.relationshipRequest.update({
          where: { id: request.id },
          data: { status: "DECLINED", respondedAt: new Date() },
        }),
        prisma.notification.deleteMany({ where: { requestId: request.id } }),
        prisma.notification.create({
          data: { userId: partnerId, actorId: viewerId, type: NOTIFICATION_TYPES.RELATIONSHIP_DECLINED },
        }),
      ])
      revalidatePath("/relationships")
      revalidatePath(`/profile/${partnerId}`)
      return { success: true, message: "已婉拒该申请" }
    }

    // 同意：再次校验互关与占位情况（申请可能已过期）
    const [mutual, viewerBond, partnerBond, viewerCount, partnerCount] = await Promise.all([
      isMutualFollow(viewerId, partnerId),
      prisma.relationship.findFirst({
        where: { type: request.type, OR: [{ userAId: viewerId }, { userBId: viewerId }] },
        select: { id: true },
      }),
      prisma.relationship.findFirst({
        where: { type: request.type, OR: [{ userAId: partnerId }, { userBId: partnerId }] },
        select: { id: true },
      }),
      countActiveRelationships(viewerId),
      countActiveRelationships(partnerId),
    ])

    if (!mutual) return { success: false, message: "你们已经不是互关好友，无法绑定关系" }
    if (viewerBond) return { success: false, message: `你已经和另一位成员绑定了「${typeName}」关系` }
    if (partnerBond) return { success: false, message: `对方已经和另一位成员绑定了「${typeName}」关系` }
    if (viewerCount >= MAX_ACTIVE_RELATIONSHIPS || partnerCount >= MAX_ACTIVE_RELATIONSHIPS) {
      return { success: false, message: `每人最多同时绑定 ${MAX_ACTIVE_RELATIONSHIPS} 段关系` }
    }

    // 同种关系占位成功后，双方相关的其它待处理申请自动取消
    const otherPending = await prisma.relationshipRequest.findMany({
      where: {
        status: "PENDING",
        type: request.type,
        id: { not: request.id },
        OR: [
          { fromUserId: viewerId },
          { toUserId: viewerId },
          { fromUserId: partnerId },
          { toUserId: partnerId },
        ],
      },
      select: { id: true },
    })
    const otherPendingIds = otherPending.map((row) => row.id)

    await prisma.$transaction(async (tx) => {
      await tx.relationshipRequest.update({
        where: { id: request.id },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      })
      if (otherPendingIds.length > 0) {
        await tx.relationshipRequest.updateMany({
          where: { id: { in: otherPendingIds } },
          data: { status: "CANCELLED", respondedAt: new Date() },
        })
        await tx.notification.deleteMany({ where: { requestId: { in: otherPendingIds } } })
      }
      await tx.relationship.create({
        data: { userAId: partnerId, userBId: viewerId, type: request.type },
      })
      await tx.notification.deleteMany({ where: { requestId: request.id } })
      await tx.notification.create({
        data: { userId: partnerId, actorId: viewerId, type: NOTIFICATION_TYPES.RELATIONSHIP_ACCEPTED },
      })
    })

    revalidatePath("/relationships")
    revalidatePath(`/profile/${viewerId}`)
    revalidatePath(`/profile/${partnerId}`)
    return { success: true, message: `你们已成为「${typeName}」，多点赞多评论，关系会一直升温` }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 撤销自己发出的待处理申请。
 */
export async function cancelRelationshipRequest(requestId: string): Promise<ActionResult> {
  try {
    const viewerId = await requireActor()
    const request = await prisma.relationshipRequest.findFirst({
      where: { id: requestId, fromUserId: viewerId, status: "PENDING" },
      select: { id: true },
    })
    if (!request) return { success: false, message: "该申请不存在或已被处理" }

    await prisma.$transaction([
      prisma.relationshipRequest.update({
        where: { id: request.id },
        data: { status: "CANCELLED", respondedAt: new Date() },
      }),
      prisma.notification.deleteMany({ where: { requestId: request.id } }),
    ])

    revalidatePath("/relationships")
    return { success: true, message: "申请已取消" }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 解除一段关系（任意一方均可操作）。
 */
export async function dissolveRelationship(relationshipId: string): Promise<ActionResult> {
  try {
    const viewerId = await requireActor()
    const relationship = await prisma.relationship.findFirst({
      where: { id: relationshipId, OR: [{ userAId: viewerId }, { userBId: viewerId }] },
    })
    if (!relationship) return { success: false, message: "关系不存在或你不在其中" }

    const partnerId = relationship.userAId === viewerId ? relationship.userBId : relationship.userAId
    const typeName = getRelationshipType(relationship.type)?.name ?? relationship.type

    await prisma.$transaction([
      prisma.relationship.delete({ where: { id: relationship.id } }),
      prisma.notification.create({
        data: { userId: partnerId, actorId: viewerId, type: NOTIFICATION_TYPES.RELATIONSHIP_DISSOLVED },
      }),
    ])

    revalidatePath("/relationships")
    revalidatePath(`/profile/${viewerId}`)
    revalidatePath(`/profile/${partnerId}`)
    return { success: true, message: `已解除「${typeName}」关系` }
  } catch (error) {
    return fail(error)
  }
}

/**
 * 互动升温：点赞、评论、写明信片都会给两人的关系增加经验。
 * 每段关系每天有经验上限，等级由经验推导（不单独存等级，节约空间）。
 *
 * 注意：整个流程包在 try/catch 里——即使关系表尚未建好（SQL 未执行），
 * 点赞/评论/明信片等核心功能也必须照常可用。
 */
export async function awardRelationshipXp(userId: string, partnerId: string, action: XpAction) {
  if (userId === partnerId) return
  const base = XP_VALUES[action]
  if (!base) return

  try {
    const bonds = await prisma.relationship.findMany({
      where: {
        OR: [
          { userAId: userId, userBId: partnerId },
          { userAId: partnerId, userBId: userId },
        ],
      },
      select: { id: true, userAId: true, userBId: true },
    })
    if (bonds.length === 0) return

    const today = getBeijingDayKey()

    await prisma.$transaction(async (tx) => {
      for (const bond of bonds) {
        // 行级锁，防止并发互动导致经验丢失
        await tx.$queryRaw`SELECT id FROM "Relationship" WHERE id = ${bond.id} FOR UPDATE`
        const fresh = await tx.relationship.findUnique({
          where: { id: bond.id },
          select: { xp: true, xpDay: true, xpToday: true },
        })
        if (!fresh) continue

        const dayReset = fresh.xpDay !== today
        const gainedToday = dayReset ? 0 : fresh.xpToday
        if (gainedToday >= DAILY_XP_CAP) continue

        const delta = Math.min(base, DAILY_XP_CAP - gainedToday)
        const oldXp = fresh.xp
        const newXp = Math.min(MAX_XP, oldXp + delta)

        await tx.relationship.update({
          where: { id: bond.id },
          data: {
            xp: newXp,
            xpDay: today,
            xpToday: dayReset ? delta : fresh.xpToday + delta,
          },
        })

        const oldLevel = getLevel(oldXp)
        const newLevel = getLevel(newXp)
        if (newLevel > oldLevel) {
          await tx.notification.createMany({
            data: [
              { userId: bond.userAId, actorId: bond.userBId, type: NOTIFICATION_TYPES.RELATIONSHIP_LEVEL_UP },
              { userId: bond.userBId, actorId: bond.userAId, type: NOTIFICATION_TYPES.RELATIONSHIP_LEVEL_UP },
            ],
          })
        }
      }
    })

    revalidatePath("/relationships")
  } catch {
    // 关系表不可用或事务失败时静默跳过，不影响点赞/评论/明信片主流程
  }
}
