import "server-only"

import { prisma } from "@/lib/prisma"

function getShanghaiDayKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function getCheckInDayKeys(now = new Date()) {
  return {
    today: getShanghaiDayKey(now),
    yesterday: getShanghaiDayKey(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
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
