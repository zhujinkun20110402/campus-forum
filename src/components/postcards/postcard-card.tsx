"use client"

import Link from "next/link"
import { Clock3, Loader2, MailOpen, Send, Stamp } from "lucide-react"
import { useState, useTransition } from "react"
import { UserAvatar } from "@/components/user/user-avatar"
import { openPostcard } from "@/lib/postcard-actions"
import { getPostcardTheme } from "@/lib/postcard-constants"
import { cn, formatRelativeTime } from "@/lib/utils"

interface PostcardCardProps {
  postcard: {
    id: string
    message: string | null
    theme: string
    emoji: string | null
    openedAt: Date | string | null
    expiresAt: Date | string
    createdAt: Date | string
  }
  person: { id: string; name: string | null; image: string | null; role: string }
  direction: "received" | "sent"
}

function expiryLabel(date: Date | string) {
  return new Date(date).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function PostcardCard({ postcard, person, direction }: PostcardCardProps) {
  const theme = getPostcardTheme(postcard.theme)
  const [opened, setOpened] = useState(direction === "sent" || Boolean(postcard.openedAt))
  const [revealedMessage, setRevealedMessage] = useState(postcard.message)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const isNight = theme.value === "NIGHT"

  function reveal() {
    startTransition(async () => {
      const result = await openPostcard(postcard.id)
      if (result.success) {
        setRevealedMessage(result.message)
        setOpened(true)
      }
      else setError(result.message)
    })
  }

  return (
    <article className={cn("relative overflow-hidden border-2 border-[#191914] p-5 shadow-[4px_4px_0_rgba(25,25,20,0.18)] dark:border-[#f5f0e5] sm:p-6", theme.surface, isNight && "text-[#f5f0e5]")}>
      <span aria-hidden className={cn("absolute inset-y-0 left-0 w-2", theme.accent)} />
      <div className="flex items-start justify-between gap-4 border-b border-dashed border-current/25 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href={`/profile/${person.id}`}><UserAvatar name={person.name} image={person.image} role={person.role} size="md" /></Link>
          <div className="min-w-0"><p className="font-mono text-[8px] font-bold tracking-[0.12em] opacity-55">{direction === "received" ? "FROM" : "TO"}</p><Link href={`/profile/${person.id}`} className="mt-1 block truncate text-sm font-bold hover:text-[#d44120]">{person.name ?? "校园成员"}</Link></div>
        </div>
        <div className="flex h-12 w-10 rotate-3 items-center justify-center border-2 border-dashed border-current/60 text-xl" title={theme.label}>{postcard.emoji || <Stamp className="h-5 w-5" />}</div>
      </div>

      {opened ? (
        <p className="min-h-24 whitespace-pre-wrap break-words py-5 font-serif text-base font-semibold leading-8 sm:text-lg">{revealedMessage}</p>
      ) : (
        <div className="flex min-h-36 flex-col items-center justify-center py-5 text-center">
          <button type="button" onClick={reveal} disabled={pending} className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#f3c84b] px-5 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] disabled:cursor-wait dark:border-[#f5f0e5]">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailOpen className="h-4 w-4" />} 拆阅明信片
          </button>
          {error && <p className="mt-3 text-xs text-[#b52f1e]">{error}</p>}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-current/25 pt-3 font-mono text-[8px] opacity-60">
        <span className="flex items-center gap-1.5">{direction === "sent" ? <Send className="h-3 w-3" /> : <MailOpen className="h-3 w-3" />}{formatRelativeTime(postcard.createdAt)}</span>
        <span className="flex items-center gap-1.5"><Clock3 className="h-3 w-3" />{expiryLabel(postcard.expiresAt)} 清除</span>
      </div>
    </article>
  )
}
