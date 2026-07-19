import "server-only"

import { prisma } from "@/lib/prisma"

export const NOTIFICATION_TYPES = {
  COMMENT_CREATED: "COMMENT_CREATED",
  COMMENT_REPLIED: "COMMENT_REPLIED",
  POST_LIKED: "POST_LIKED",
  USER_FOLLOWED: "USER_FOLLOWED",
  POST_PINNED: "POST_PINNED",
} as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export function getNotifications(userId: string, take = 100) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      type: true,
      readAt: true,
      createdAt: true,
      actor: {
        select: { id: true, name: true, image: true, role: true },
      },
      post: {
        select: { id: true, title: true },
      },
      comment: {
        select: { id: true },
      },
    },
  })
}

export function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({
    where: { userId, readAt: null },
  })
}

export async function getNotificationCenter(userId: string) {
  const [notifications, unreadCount, readCount] = await Promise.all([
    getNotifications(userId),
    getUnreadNotificationCount(userId),
    prisma.notification.count({ where: { userId, readAt: { not: null } } }),
  ])

  return { notifications, unreadCount, readCount }
}
