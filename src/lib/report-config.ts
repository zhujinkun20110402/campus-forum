/**
 * 举报系统共享配置（服务端与客户端通用，不含 Prisma 依赖）。
 */

export interface ReportReasonConfig {
  code: string
  name: string
  /** 徽章底色（Tailwind 类，取自全站校刊色盘） */
  surface: string
}

export const REPORT_REASONS: ReportReasonConfig[] = [
  { code: "SPAM", name: "垃圾广告", surface: "bg-[#f3c84b]" },
  { code: "ABUSE", name: "辱骂攻击", surface: "bg-[#ff6b43]" },
  { code: "PORNOGRAPHY", name: "色情低俗", surface: "bg-[#ffb4aa]" },
  { code: "POLITICS", name: "政治敏感", surface: "bg-[#b9ddbd]" },
  { code: "PRIVACY", name: "泄露隐私", surface: "bg-[#c8d7ef]" },
  { code: "FRAUD", name: "诈骗信息", surface: "bg-[#f2d0b2]" },
  { code: "OTHER", name: "其他", surface: "bg-[#ece6da]" },
]

export const REPORT_REASON_CODES = REPORT_REASONS.map((reason) => reason.code)

export function getReportReason(code: string): ReportReasonConfig | undefined {
  return REPORT_REASONS.find((reason) => reason.code === code)
}

export const REPORT_TARGET_TYPES = ["POST", "COMMENT"] as const
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number]

export const REPORT_STATUS = {
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const
