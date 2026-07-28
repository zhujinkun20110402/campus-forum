import "server-only"

import { getBeijingDayKey } from "@/lib/beijing-time"
import { prisma } from "@/lib/prisma"
import { REP_POINTS } from "@/lib/reputation"

export async function getReputationGiftState(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastReputationGiftDay: true },
  })

  return {
    available: user?.lastReputationGiftDay !== getBeijingDayKey(),
    reward: REP_POINTS.REPUTATION_GIFT,
  }
}
