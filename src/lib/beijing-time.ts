const BEIJING_TIME_ZONE = "Asia/Shanghai"

function getBeijingDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: BEIJING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)

  return Object.fromEntries(parts.map((part) => [part.type, part.value]))
}

export function getBeijingDayKey(date = new Date()) {
  const parts = getBeijingDateParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function getBeijingMonthKey(date = new Date()) {
  const parts = getBeijingDateParts(date)
  return `${parts.year}-${parts.month}`
}
