"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { auth } from "@/lib/auth"
import { getCheckInDayKeys } from "@/lib/daily-check-in"
import { prisma } from "@/lib/prisma"
import { REP_POINTS } from "@/lib/reputation"
import { STATUS_MOODS, STATUS_VISIBILITIES } from "@/lib/status-constants"

const statusSchema = z.object({
  content: z.string().trim().min(1, "写下一句话再发布").max(120, "状态最多 120 个字"),
  mood: z.enum(STATUS_MOODS.map((mood) => mood.value)),
  tag: z.string().trim().max(12, "自定义标签最多 12 个字").optional(),
  emoji: z.string().trim().max(16, "Emoji 太长了").optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "请选择有效的状态颜色"),
  visibility: z.enum(STATUS_VISIBILITIES.map((item) => item.value)),
})

async function requireActiveUser() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("请先登录")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      lastCheckInDay: true,
      checkInStreak: true,
      totalCheckIns: true,
    },
  })
  if (!user || user.role === "BANNED") throw new Error("当前账号无法使用此功能")
  return user
}

export async function checkInToday() {
  const user = await requireActiveUser()
  const { today, yesterday } = getCheckInDayKeys()

  if (user.lastCheckInDay === today) {
    return { success: true as const, alreadyCheckedIn: true, streak: user.checkInStreak, total: user.totalCheckIns, reward: 0 }
  }

  const nextStreak = user.lastCheckInDay === yesterday ? user.checkInStreak + 1 : 1
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      OR: [{ lastCheckInDay: null }, { lastCheckInDay: { not: today } }],
    },
    data: {
      lastCheckInDay: today,
      checkInStreak: nextStreak,
      totalCheckIns: { increment: 1 },
      raputation: { increment: REP_POINTS.DAILY_CHECK_IN },
    },
  })

  if (result.count === 0) {
    const current = await prisma.user.findUnique({
      where: { id: user.id },
      select: { checkInStreak: true, totalCheckIns: true },
    })
    return { success: true as const, alreadyCheckedIn: true, streak: current?.checkInStreak ?? nextStreak, total: current?.totalCheckIns ?? user.totalCheckIns, reward: 0 }
  }

  revalidatePath("/")
  revalidatePath("/status")
  revalidatePath(`/profile/${user.id}`)
  return { success: true as const, alreadyCheckedIn: false, streak: nextStreak, total: user.totalCheckIns + 1, reward: REP_POINTS.DAILY_CHECK_IN }
}

export async function publishCampusStatus(_previousState: unknown, formData: FormData) {
  const user = await requireActiveUser()
  const parsed = statusSchema.safeParse({
    content: formData.get("content"),
    mood: formData.get("mood"),
    tag: formData.get("tag"),
    emoji: formData.get("emoji"),
    color: formData.get("color"),
    visibility: formData.get("visibility"),
  })

  if (!parsed.success) {
    return { success: false as const, message: parsed.error.issues[0]?.message ?? "请检查状态内容" }
  }

  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const statusData = {
    ...parsed.data,
    tag: parsed.data.tag || null,
    emoji: parsed.data.emoji || null,
    color: parsed.data.color.toLowerCase(),
  }
  await prisma.campusStatus.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...statusData, expiresAt },
    update: { ...statusData, expiresAt, createdAt: now },
  })

  revalidatePath("/")
  revalidatePath("/status")
  revalidatePath(`/profile/${user.id}`)
  return { success: true as const, message: "状态已发布，将在 24 小时后自动结束" }
}

export async function deleteCampusStatus() {
  const user = await requireActiveUser()
  await prisma.campusStatus.deleteMany({ where: { userId: user.id } })
  revalidatePath("/")
  revalidatePath("/status")
  revalidatePath(`/profile/${user.id}`)
  return { success: true as const }
}
