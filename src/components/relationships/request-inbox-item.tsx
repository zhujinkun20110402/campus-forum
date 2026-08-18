"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Check, Loader2, X } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { getRelationshipType } from "@/lib/relationship-config"
import { respondRelationshipRequest } from "@/lib/relationship-actions"
import { formatRelativeTime } from "@/lib/utils"

interface RequestInboxItemProps {
  request: {
    id: string
    type: string
    message: string | null
    createdAt: Date | string
    fromUser: { id: string; name: string | null; image: string | null; role: string }
  }
}

export function RequestInboxItem({ request }: RequestInboxItemProps) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  const config = getRelationshipType(request.type)
  const fromName = request.fromUser.name ?? "未命名用户"

  function respond(action: "accept" | "decline") {
    setMessage("")
    startTransition(async () => {
      const result = await respondRelationshipRequest(request.id, action)
      if (!result.success) {
        setMessage(result.message)
        return
      }
      setMessage(result.message)
      router.refresh()
    })
  }

  return (
    <article className="grid gap-4 border-b border-[#191914]/15 px-5 py-5 last:border-b-0 dark:border-white/15 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/profile/${request.fromUser.id}`} className="shrink-0" aria-label={`查看 ${fromName} 的主页`}>
          <UserAvatar name={request.fromUser.name} image={request.fromUser.image} role={request.fromUser.role} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6">
            <Link href={`/profile/${request.fromUser.id}`} className="font-bold hover:text-[#d44120] dark:hover:text-[#ff8a68]">
              {fromName}
            </Link>{" "}
            想和你绑定
            <span className={`ml-2 inline-flex items-center gap-1 border-2 border-[#191914] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.12em] text-[#191914] dark:border-[#f5f0e5] ${config?.surface ?? "bg-[#e5ded1]"} dark:text-[#191914]`}>
              <span aria-hidden>{config?.emoji}</span>
              {config?.name ?? request.type}
            </span>
          </p>
          <p className="mt-1.5 text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
            {request.message || "对方没有留下想说的话，直接点头答应了 TA？"}
          </p>
          <p className="mt-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
            {formatRelativeTime(request.createdAt)} · 接受后点赞、评论、写明信片都能让关系升级
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-0 sm:pl-[52px]">
        <button
          type="button"
          onClick={() => respond("accept")}
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 border-2 border-[#191914] bg-[#d9ef61] px-4 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          接受
        </button>
        <button
          type="button"
          onClick={() => respond("decline")}
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 border-2 border-[#191914] bg-[#fffaf0] px-4 text-xs font-bold text-[#191914] transition-colors hover:bg-[#ffb4aa] disabled:cursor-wait disabled:opacity-60 dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#3a2624]"
        >
          <X className="h-4 w-4" />
          婉拒
        </button>
        {message && <span className="text-xs font-bold text-[#b52f1e]" role="status">{message}</span>}
      </div>
    </article>
  )
}
