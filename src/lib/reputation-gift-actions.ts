"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { getBeijingDayKey } from "@/lib/beijing-time"
import { NOTIFICATION_TYPES } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import { REP_POINTS } from "@/lib/reputation"

export async function giftReputation(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false as const, message: "请先登录" }

  const senderId = session.user.id
  if (!targetUserId || senderId === targetUserId) {
    return { success: false as const, message: "不能给自己赠送声望" }
  }

  const today = getBeijingDayKey()
  const [sender, target, following] = await Promise.all([
    prisma.user.findUnique({ where: { id: senderId }, select: { role: true, lastReputationGiftDay: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, role: true } }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: senderId, followingId: targetUserId } },
      select: { followerId: true },
    }),
  ])

  if (!sender || sender.role === "BANNED") return { success: false as const, message: "当前账号无法赠送声望" }
  if (!target || target.role === "BANNED") return { success: false as const, message: "对方暂时无法接收声望" }
  if (!following) return { success: false as const, message: "只能给自己已经关注的用户赠送声望" }
  if (sender.lastReputationGiftDay === today) return { success: false as const, message: "今天的声望礼物已经送出" }

  try {
    await prisma.$transaction(async (tx) => {
      const lock = await tx.user.updateMany({
        where: {
          id: senderId,
          role: { not: "BANNED" },
          OR: [{ lastReputationGiftDay: null }, { lastReputationGiftDay: { not: today } }],
          following: { some: { followingId: targetUserId } },
        },
        data: { lastReputationGiftDay: today },
      })

      if (lock.count === 0) throw new Error("GIFT_ALREADY_USED")

      const recipient = await tx.user.updateMany({
        where: { id: targetUserId, role: { not: "BANNED" } },
        data: { raputation: { increment: REP_POINTS.REPUTATION_GIFT } },
      })
      if (recipient.count === 0) throw new Error("RECIPIENT_UNAVAILABLE")

      await tx.notification.create({
        data: {
          userId: targetUserId,
          actorId: senderId,
          type: NOTIFICATION_TYPES.REPUTATION_GIFT,
        },
      })
    })
  } catch (error) {
    if (error instanceof Error && error.message === "GIFT_ALREADY_USED") {
      return { success: false as const, message: "今天的声望礼物已经送出" }
    }
    return { success: false as const, message: "赠送没有完成，请稍后再试" }
  }

  revalidatePath(`/profile/${senderId}`)
  revalidatePath(`/profile/${targetUserId}`)
  revalidatePath("/leaderboard")
  revalidatePath("/notifications")
  revalidatePath("/search")
  revalidatePath("/")

  return {
    success: true as const,
    message: `已送出 +${REP_POINTS.REPUTATION_GIFT} 声望，明天可以再次赠送`,
    reward: REP_POINTS.REPUTATION_GIFT,
  }
}
