import "server-only"

import { prisma } from "@/lib/prisma"

export const RELATIONSHIP_REQUEST_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
} as const

const PARTNER_SELECT = { id: true, name: true, image: true, role: true } as const

export function getRelationshipsForUser(userId: string) {
  return prisma.relationship.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      type: true,
      xp: true,
      createdAt: true,
      updatedAt: true,
      userA: { select: PARTNER_SELECT },
      userB: { select: PARTNER_SELECT },
    },
  })
}

export function countActiveRelationships(userId: string) {
  return prisma.relationship.count({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
  })
}

/** 两个人之间已绑定的关系，以及双方之间待处理的申请。 */
export async function getRelationshipState(viewerId: string, targetId: string) {
  const [bonds, pending] = await Promise.all([
    prisma.relationship.findMany({
      where: {
        OR: [
          { userAId: viewerId, userBId: targetId },
          { userAId: targetId, userBId: viewerId },
        ],
      },
      select: { id: true, type: true, xp: true, createdAt: true },
    }),
    prisma.relationshipRequest.findFirst({
      where: {
        status: RELATIONSHIP_REQUEST_STATUS.PENDING,
        OR: [
          { fromUserId: viewerId, toUserId: targetId },
          { fromUserId: targetId, toUserId: viewerId },
        ],
      },
      select: { id: true, fromUserId: true, type: true },
    }),
  ])

  return { bonds, pending }
}

export async function isMutualFollow(userAId: string, userBId: string) {
  const [forward, backward] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userAId, followingId: userBId } },
      select: { followerId: true },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userBId, followingId: userAId } },
      select: { followerId: true },
    }),
  ])
  return Boolean(forward && backward)
}

export function getIncomingRelationshipRequests(userId: string) {
  return prisma.relationshipRequest.findMany({
    where: { toUserId: userId, status: RELATIONSHIP_REQUEST_STATUS.PENDING },
    orderBy: { createdAt: "desc" },
    include: { fromUser: { select: PARTNER_SELECT } },
  })
}

export function getOutgoingRelationshipRequests(userId: string) {
  return prisma.relationshipRequest.findMany({
    where: {
      fromUserId: userId,
      status: { in: ["PENDING", "DECLINED", "CANCELLED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { toUser: { select: PARTNER_SELECT } },
  })
}

/** 与 userId 互相关注的成员（绑定关系的前提）。 */
export async function getMutualFollowers(userId: string) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  })
  const followingIds = following.map((row) => row.followingId)
  if (followingIds.length === 0) return []

  const rows = await prisma.follow.findMany({
    where: { followingId: userId, followerId: { in: followingIds } },
    select: { follower: { select: PARTNER_SELECT } },
  })
  return rows.map((row) => row.follower).filter((user) => user.role !== "BANNED")
}
