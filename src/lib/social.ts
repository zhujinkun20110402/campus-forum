import "server-only"

import { prisma } from "@/lib/prisma"

const COMPETITIVE_ROLES = ["ADMIN", "BANNED"]

export async function getFollowSummary(viewerId: string, targetUserId: string) {
  const [followers, following, relation] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetUserId } }),
    prisma.follow.count({ where: { followerId: targetUserId } }),
    viewerId === targetUserId
      ? Promise.resolve(null)
      : prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: targetUserId } },
          select: { followerId: true },
        }),
  ])

  return { followers, following, isFollowing: !!relation }
}

export async function getLeaderboard(limit = 50) {
  return prisma.user.findMany({
    where: { role: { notIn: COMPETITIVE_ROLES } },
    take: limit,
    orderBy: [{ raputation: "desc" }, { createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      raputation: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true, followers: true } },
    },
  })
}

export async function getCompetitiveRank(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, raputation: true, createdAt: true },
  })

  if (!user || COMPETITIVE_ROLES.includes(user.role)) return null

  const higherRanked = await prisma.user.count({
    where: {
      role: { notIn: COMPETITIVE_ROLES },
      OR: [
        { raputation: { gt: user.raputation } },
        { raputation: user.raputation, createdAt: { lt: user.createdAt } },
        { raputation: user.raputation, createdAt: user.createdAt, id: { lt: user.id } },
      ],
    },
  })

  return higherRanked + 1
}
