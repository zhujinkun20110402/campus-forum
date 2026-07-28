import "server-only"

import { getBeijingDayKey } from "@/lib/beijing-time"
import { prisma } from "@/lib/prisma"

export function getCheckInDayKeys(now = new Date()) {
  return {
    today: getBeijingDayKey(now),
    yesterday: getBeijingDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
  }
}

export async function getCheckInStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastCheckInDay: true, checkInStreak: true, totalCheckIns: true },
  })
  const { today } = getCheckInDayKeys()

  return {
    checkedIn: user?.lastCheckInDay === today,
    streak: user?.checkInStreak ?? 0,
    total: user?.totalCheckIns ?? 0,
  }
}
