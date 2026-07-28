import Link from "next/link"
import { Clock3, Globe2, UserRoundCheck, Users } from "lucide-react"
import { LevelBadge } from "@/components/reputation/level-badge"
import { UserAvatar } from "@/components/user/user-avatar"
import { getStatusMood, getStatusTextColor, STATUS_VISIBILITIES } from "@/lib/status-constants"
import { cn } from "@/lib/utils"

export interface CampusStatusData {
  id: string
  content: string
  mood: string
  tag: string | null
  emoji: string | null
  color: string
  visibility: string
  expiresAt: Date | string
  updatedAt: Date | string
  user: { id: string; name: string | null; image: string | null; role: string; raputation: number }
}

function expiryLabel(expiresAt: Date | string) {
  return new Date(expiresAt).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const visibilityIcons = { PUBLIC: Globe2, FOLLOWERS: Users, MUTUAL: UserRoundCheck }

export function CampusStatusCard({ status, viewerId, compact = false }: { status: CampusStatusData; viewerId: string; compact?: boolean }) {
  const mood = getStatusMood(status.mood)
  const displayTag = status.tag || mood.label
  const statusTextColor = getStatusTextColor(status.color)
  const VisibilityIcon = visibilityIcons[status.visibility as keyof typeof visibilityIcons] ?? Globe2
  const visibilityLabel = STATUS_VISIBILITIES.find((item) => item.value === status.visibility)?.label ?? "全校可见"

  return (
    <article className={cn("relative overflow-hidden border-2 border-[#191914] bg-[#fffaf0] text-[#191914] shadow-[4px_4px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]", compact ? "p-4" : "p-5 sm:p-6")}>
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: status.color }} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/profile/${status.user.id}`}><UserAvatar name={status.user.name} image={status.user.image} role={status.user.role} size={compact ? "sm" : "md"} status={{ color: status.color, emoji: status.emoji }} /></Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2"><Link href={`/profile/${status.user.id}`} className="truncate text-sm font-bold hover:text-[#d44120]">{status.user.name ?? "校园成员"}</Link>{!compact && <LevelBadge raputation={status.user.raputation} role={status.user.role} size="xs" showTitle={false} />}</div>
            <p className="mt-1 font-mono text-[8px] font-bold tracking-[0.12em] text-[#918b80]">{mood.english} / {displayTag}</p>
          </div>
        </div>
        <span className="shrink-0 border border-[#191914] px-2 py-1 font-mono text-[8px] font-bold" style={{ backgroundColor: status.color, color: statusTextColor }}>{status.emoji && <span className="mr-1">{status.emoji}</span>}{displayTag}</span>
      </div>

      <p className={cn("font-serif font-semibold leading-7", compact ? "mt-4 text-base" : "mt-5 text-lg sm:text-xl")}>{status.content}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#191914]/15 pt-3 font-mono text-[8px] text-[#918b80] dark:border-white/15">
        <span className="flex items-center gap-1.5"><Clock3 className="h-3 w-3" />有效至 {expiryLabel(status.expiresAt)}</span>
        {status.user.id === viewerId && <span className="flex items-center gap-1.5"><VisibilityIcon className="h-3 w-3" />{visibilityLabel}</span>}
      </div>
    </article>
  )
}
