import "server-only"

import { getBeijingMonthKey } from "@/lib/beijing-time"
import { getMonthlyPostcardQuota } from "@/lib/postcard-constants"
import { prisma } from "@/lib/prisma"

export async function cleanupExpiredPostcards(now = new Date()) {
  const notificationCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const [postcards] = await prisma.$transaction([
    prisma.postcard.deleteMany({ where: { expiresAt: { lte: now } } }),
    prisma.notification.deleteMany({
      where: { type: "POSTCARD_RECEIVED", createdAt: { lte: notificationCutoff } },
    }),
  ])
  return postcards.count
}

export async function getPostcardCenter(userId: string) {
  await cleanupExpiredPostcards()
  const now = new Date()
  const [user, received, sent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        raputation: true,
        postcardQuotaMonth: true,
        postcardsSentThisMonth: true,
      },
    }),
    prisma.postcard.findMany({
      where: { recipientId: userId, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { sender: { select: { id: true, name: true, image: true, role: true } } },
    }),
    prisma.postcard.findMany({
      where: { senderId: userId, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { recipient: { select: { id: true, name: true, image: true, role: true } } },
    }),
  ])

  if (!user) throw new Error("用户不存在")
  const month = getBeijingMonthKey(now)
  const quota = getMonthlyPostcardQuota(user.raputation, user.role)
  const used = user.postcardQuotaMonth === month ? user.postcardsSentThisMonth : 0

  return {
    received: received.map((postcard) => ({
      ...postcard,
      message: postcard.openedAt ? postcard.message : null,
    })),
    sent,
    quota: { month, total: quota, used, remaining: Math.max(0, quota - used) },
  }
}
