import Link from "next/link"
import { Clock3, Radio } from "lucide-react"
import { getStatusMood } from "@/lib/status-constants"
import { cn } from "@/lib/utils"

export function ProfileStatus({ status, isOwnProfile }: { status: { content: string; mood: string; expiresAt: Date | string }; isOwnProfile: boolean }) {
  const mood = getStatusMood(status.mood)
  const expiresAt = new Date(status.expiresAt).toLocaleTimeString("zh-CN", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit" })
  return (
    <Link href="/status" className="mt-5 flex max-w-2xl items-start gap-3 border-l-4 border-[#191914] bg-[#fffaf0]/75 p-3 text-left transition-transform hover:translate-x-1 dark:bg-[#24231e]">
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center border border-[#191914] text-[#191914]", mood.color)}><Radio className="h-4 w-4" /></span>
      <span className="min-w-0"><span className="block text-sm font-semibold leading-6">{status.content}</span><span className="mt-1 flex items-center gap-1.5 font-mono text-[8px] text-[#777268] dark:text-[#989389]"><Clock3 className="h-3 w-3" />{mood.label} · 有效至 {expiresAt}{isOwnProfile ? " · 管理状态" : ""}</span></span>
    </Link>
  )
}
