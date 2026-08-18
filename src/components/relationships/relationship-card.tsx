"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Loader2, Unlink } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { getLevelProgress, getRelationshipType } from "@/lib/relationship-config"
import { dissolveRelationship } from "@/lib/relationship-actions"
import { cn, formatRelativeTime } from "@/lib/utils"

interface RelationshipCardProps {
  relationship: {
    id: string
    type: string
    xp: number
    createdAt: Date | string
    partner: { id: string; name: string | null; image: string | null; role: string }
  }
}

export function RelationshipCard({ relationship }: RelationshipCardProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  const config = getRelationshipType(relationship.type)
  const progress = getLevelProgress(relationship.type, relationship.xp)
  const partnerName = relationship.partner.name ?? "未命名用户"

  function handleDissolve() {
    if (!confirming) {
      setConfirming(true)
      setMessage("")
      return
    }
    startTransition(async () => {
      const result = await dissolveRelationship(relationship.id)
      if (!result.success) {
        setMessage(result.message)
        setConfirming(false)
        return
      }
      setMessage(result.message)
      router.refresh()
    })
  }

  return (
    <article className={cn("relative flex flex-col overflow-hidden border-2 border-[#191914] text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5]", config?.surface ?? "bg-[#e5ded1]")}>
      <div className="flex items-center justify-between gap-3 border-b-2 border-[#191914] px-4 py-3 dark:border-[#f5f0e5]">
        <span className="inline-flex items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.14em] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]">
          <span aria-hidden>{config?.emoji}</span>
          {config?.name ?? relationship.type}
          <span className="text-[#e4532f]">{config?.english}</span>
        </span>
        <span className="font-mono text-[8px] font-bold tracking-[0.12em] text-[#191914]/50 dark:text-[#f5f0e5]/50">
          绑定于 {formatRelativeTime(relationship.createdAt)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${relationship.partner.id}`} className="shrink-0" aria-label={`查看 ${partnerName} 的主页`}>
            <UserAvatar name={relationship.partner.name} image={relationship.partner.image} role={relationship.partner.role} size="lg" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`/profile/${relationship.partner.id}`} className="truncate font-serif text-xl font-bold hover:text-[#d44120] dark:hover:text-[#ff8a68]">
              {partnerName}
            </Link>
            <p className="mt-1 font-serif text-sm font-semibold">
              <span className="mr-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#e4532f]">LV {progress.level}</span>
              {progress.title}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2.5 border border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]">
            <div className="h-full bg-[#191914] transition-all dark:bg-[#f5f0e5]" style={{ width: `${progress.percent}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] font-bold tracking-[0.1em] text-[#191914]/55 dark:text-[#f5f0e5]/55">
            <span>{relationship.xp} / {progress.isMax ? "MAX" : "XP"}</span>
            <span>{progress.isMax ? "已满级 · 情比金坚" : `再互动 +${progress.need} XP 升到 LV ${progress.level + 1}`}</span>
          </div>
        </div>

        <p className="mt-3 border-t border-[#191914]/25 pt-3 text-[11px] leading-5 text-[#191914]/60 dark:border-[#f5f0e5]/25 dark:text-[#f5f0e5]/60">
          点赞 +3 · 评论 +8 · 明信片 +6，每段关系每天最多 +30 经验。去 TA 的主页逛逛，关系就会悄悄升温。
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            href={`/profile/${relationship.partner.id}`}
            className="inline-flex h-9 items-center gap-1.5 border-2 border-[#191914] bg-[#191914] px-3 text-xs font-bold text-[#fffaf0] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:bg-[#f5f0e5] dark:text-[#191914]"
          >
            去互动
          </Link>
          <button
            type="button"
            onClick={handleDissolve}
            disabled={pending}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 border border-[#191914]/60 px-3 text-xs font-bold transition-colors disabled:cursor-wait dark:border-[#f5f0e5]/60",
              confirming ? "bg-[#191914] text-[#fffaf0] dark:bg-[#f5f0e5] dark:text-[#191914]" : "hover:bg-[#191914] hover:text-[#fffaf0] dark:hover:bg-[#f5f0e5] dark:hover:text-[#191914]"
            )}
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
            {confirming ? "确认解除？" : "解除关系"}
          </button>
        </div>
        {message && <p className="mt-2 text-[10px] font-bold text-[#b52f1e]" role="status">{message}</p>}
      </div>
    </article>
  )
}
