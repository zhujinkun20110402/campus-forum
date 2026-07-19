"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { NOTIFICATION_TYPES } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

export async function toggleFollowUser(targetUserId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false as const, message: "请先登录" }

  const viewerId = session.user.id
  if (viewerId === targetUserId) return { success: false as const, message: "不能关注自己" }

  const [viewer, target] = await Promise.all([
    prisma.user.findUnique({ where: { id: viewerId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true, role: true } }),
  ])

  if (!viewer || viewer.role === "BANNED") {
    return { success: false as const, message: "当前账号无法进行关注操作" }
  }
  if (!target || target.role === "BANNED") {
    return { success: false as const, message: "该用户不存在或暂不可关注" }
  }

  const key = { followerId_followingId: { followerId: viewerId, followingId: targetUserId } }
  const existing = await prisma.follow.findUnique({ where: key, select: { followerId: true } })

  if (existing) {
    await prisma.$transaction([
      prisma.follow.delete({ where: key }),
      prisma.notification.deleteMany({
        where: {
          type: NOTIFICATION_TYPES.USER_FOLLOWED,
          actorId: viewerId,
          userId: targetUserId,
        },
      }),
    ])
  } else {
    await prisma.$transaction([
      prisma.follow.create({ data: { followerId: viewerId, followingId: targetUserId } }),
      prisma.notification.create({
        data: {
          userId: targetUserId,
          actorId: viewerId,
          type: NOTIFICATION_TYPES.USER_FOLLOWED,
        },
      }),
    ])
  }

  revalidatePath(`/profile/${targetUserId}`)
  revalidatePath(`/profile/${viewerId}`)
  revalidatePath(`/profile/${targetUserId}/connections`)
  revalidatePath(`/profile/${viewerId}/connections`)
  revalidatePath("/leaderboard")
  revalidatePath("/search")
  revalidatePath("/")

  return { success: true as const, following: !existing }
}
