export const STATUS_MOODS = [
  { value: "STUDY", label: "学习中", english: "FOCUS", color: "bg-[#f3c84b]", hex: "#f3c84b" },
  { value: "AVAILABLE", label: "有空", english: "OPEN", color: "bg-[#d9ef61]", hex: "#d9ef61" },
  { value: "LOOKING", label: "找搭子", english: "CONNECT", color: "bg-[#ffb4aa]", hex: "#ffb4aa" },
  { value: "ACTIVE", label: "在活动", english: "ACTIVE", color: "bg-[#b9ddbd]", hex: "#b9ddbd" },
  { value: "QUIET", label: "安静一下", english: "QUIET", color: "bg-[#e5ded1]", hex: "#e5ded1" },
] as const

export const STATUS_COLORS = ["#f3c84b", "#d9ef61", "#ff8a68", "#79a982", "#58a6a6", "#c94f6d", "#e5ded1"] as const

export const STATUS_VISIBILITIES = [
  { value: "PUBLIC", label: "全校可见" },
  { value: "FOLLOWERS", label: "仅关注我的人" },
  { value: "MUTUAL", label: "仅互相关注" },
] as const

export type StatusMood = (typeof STATUS_MOODS)[number]["value"]
export type StatusVisibility = (typeof STATUS_VISIBILITIES)[number]["value"]

export function getStatusMood(value: string) {
  return STATUS_MOODS.find((mood) => mood.value === value) ?? STATUS_MOODS[4]
}

export function getStatusTextColor(hex: string) {
  const value = hex.replace("#", "")
  if (!/^[0-9a-fA-F]{6}$/.test(value)) return "#191914"
  const red = Number.parseInt(value.slice(0, 2), 16)
  const green = Number.parseInt(value.slice(2, 4), 16)
  const blue = Number.parseInt(value.slice(4, 6), 16)
  return red * 0.299 + green * 0.587 + blue * 0.114 > 150 ? "#191914" : "#fffaf0"
}
