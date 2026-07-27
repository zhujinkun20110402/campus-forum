export const STATUS_MOODS = [
  { value: "STUDY", label: "学习中", english: "FOCUS", color: "bg-[#f3c84b]" },
  { value: "AVAILABLE", label: "有空", english: "OPEN", color: "bg-[#d9ef61]" },
  { value: "LOOKING", label: "找搭子", english: "CONNECT", color: "bg-[#ffb4aa]" },
  { value: "ACTIVE", label: "在活动", english: "ACTIVE", color: "bg-[#b9ddbd]" },
  { value: "QUIET", label: "安静一下", english: "QUIET", color: "bg-[#e5ded1]" },
] as const

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
