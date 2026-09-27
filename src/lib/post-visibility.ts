import "server-only"

import type { Prisma } from "@/generated/prisma/client"

/**
 * 定时发布的可见性规则
 * publishAt 为空 = 立即发布；否则到达时间后才对其他同学可见。
 */

/** 供 where.AND 使用的"已发布"条件 */
export function publishedCondition(): Prisma.PostWhereInput {
  return { OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }] }
}

/** 是否仍在等待定时发布 */
export function isScheduledPending(publishAt: Date | null | undefined): boolean {
  return !!publishAt && publishAt.getTime() > Date.now()
}

/** 定时发布最短提前时间（5 分钟） */
export const MIN_SCHEDULE_AHEAD_MS = 5 * 60 * 1000
