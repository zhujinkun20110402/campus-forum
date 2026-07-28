import "server-only"

import { prisma } from "@/lib/prisma"

function visibleStatusWhere(viewerId: string) {
  return {
    expiresAt: { gt: new Date() },
    user: { role: { not: "BANNED" } },
    OR: [
      { userId: viewerId },
      { visibility: "PUBLIC" },
      {
        visibility: "FOLLOWERS",
        user: { followers: { some: { followerId: viewerId } } },
      },
      {
        visibility: "MUTUAL",
        AND: [
          { user: { followers: { some: { followerId: viewerId } } } },
          { user: { following: { some: { followingId: viewerId } } } },
        ],
      },
    ],
  }
}

export function getVisibleCampusStatuses(viewerId: string, take = 30) {
  return prisma.campusStatus.findMany({
    where: visibleStatusWhere(viewerId),
    take,
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      content: true,
      mood: true,
      tag: true,
      emoji: true,
      color: true,
      visibility: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true, image: true, role: true, raputation: true },
      },
    },
  })
}

export function getVisibleCampusStatusByUser(viewerId: string, userId: string) {
  return prisma.campusStatus.findFirst({
    where: { ...visibleStatusWhere(viewerId), userId },
    select: {
      id: true,
      content: true,
      mood: true,
      tag: true,
      emoji: true,
      color: true,
      visibility: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, name: true, image: true, role: true, raputation: true },
      },
    },
  })
}

export function getOwnCampusStatus(userId: string) {
  return prisma.campusStatus.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    select: { id: true, content: true, mood: true, tag: true, emoji: true, color: true, visibility: true, expiresAt: true },
  })
}
