/**
 * 声望系统服务端函数
 * 这些函数依赖 Prisma，只能在服务端调用
 */

import { prisma } from "@/lib/prisma"
import { REP_POINTS } from "@/lib/reputation"

/**
 * 给用户增加/减少声望（不会低于 0）
 */
export async function adjustRaputation(userId: string, delta: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      raputation: {
        increment: delta,
      },
    },
  })

  // 确保声望不低于 0
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { raputation: true, role: true },
  })

  if (user && user.role !== "ADMIN" && user.raputation < 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { raputation: 0 },
    })
  }
}

/**
 * 检查用户今日是否已发帖（用于每日首次发帖奖励）
 */
export async function hasPostedToday(userId: string): Promise<boolean> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const count = await prisma.post.count({
    where: {
      authorId: userId,
      createdAt: { gte: today },
    },
  })

  return count > 0
}

export { REP_POINTS }
