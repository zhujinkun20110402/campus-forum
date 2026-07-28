export const POSTCARD_THEMES = [
  {
    value: "PAPER",
    label: "档案纸",
    english: "ARCHIVE PAPER",
    surface: "bg-[#fffaf0]",
    accent: "bg-[#ff6b43]",
  },
  {
    value: "HERBARIUM",
    label: "植物标本",
    english: "HERBARIUM",
    surface: "bg-[#e9f0dc]",
    accent: "bg-[#6f8b4b]",
  },
  {
    value: "SUNSET",
    label: "晚霞邮局",
    english: "SUNSET OFFICE",
    surface: "bg-[#f7d4bf]",
    accent: "bg-[#d94d2a]",
  },
  {
    value: "NIGHT",
    label: "夜航信笺",
    english: "NIGHT DISPATCH",
    surface: "bg-[#24231e]",
    accent: "bg-[#f3c84b]",
  },
] as const

export type PostcardTheme = (typeof POSTCARD_THEMES)[number]["value"]

export function getPostcardTheme(value: string) {
  return POSTCARD_THEMES.find((theme) => theme.value === value) ?? POSTCARD_THEMES[0]
}

export function getMonthlyPostcardQuota(raputation: number, role?: string | null) {
  if (role === "ADMIN" || raputation >= 1400) return 5
  if (raputation >= 350) return 3
  if (raputation >= 50) return 2
  return 1
}
