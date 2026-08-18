"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowRight, Loader2, RotateCcw, X } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { getRelationshipType } from "@/lib/relationship-config"
import { cancelRelationshipRequest } from "@/lib/relationship-actions"
import { cn, formatRelativeTime } from "@/lib/utils"

interface SentRequestItemProps {
  request: {
    id: string
    type: string
    status: string
    createdAt: Date | string
    toUser: { id: string; name: string | null; image: string | null; role: string }
  }
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "等待回应", className: "bg-[#f3c84b]" },
  DECLINED: { label: "已被婉拒", className: "bg-[#ffb4aa]" },
  CANCELLED: { label: "已取消", className: "bg-[#ece6da]" },
}

export function SentRequestItem({ request }: SentRequestItemProps) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  const config = getRelationshipType(request.type)
  const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.CANCELLED
  const toName = request.toUser.name ?? "未命名用户"

  function cancel() {
    setMessage("")
    startTransition(async () => {
      const result = await cancelRelationshipRequest(request.id)
      if (!result.success) {
        setMessage(result.message)
        return
      }
      setMessage(result.message)
      router.refresh()
    })
  }

  return (
    <article className="flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-[#191914]/15 px-5 py-4 last:border-b-0 dark:border-white/15 sm:px-6">
      <Link href={`/profile/${request.toUser.id}`} className="shrink-0" aria-label={`查看 ${toName} 的主页`}>
        <UserAvatar name={request.toUser.name} image={request.toUser.image} role={request.toUser.role} size="md" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6">
          <Link href={`/profile/${request.toUser.id}`} className="font-bold hover:text-[#d44120] dark:hover:text-[#ff8a68]">
            {toName}
          </Link>
          <span className="ml-2 inline-flex items-center gap-1 border border-[#191914] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.1em] dark:border-[#f5f0e5]">
            <span aria-hidden>{config?.emoji}</span>
            {config?.name ?? request.type}
          </span>
        </p>
        <p className="mt-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
          {formatRelativeTime(request.createdAt)}
          {request.status === "CANCELLED" && " · 若对方已与他人绑定同种关系，申请会自动取消"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("border border-[#191914] px-2 py-1 text-[10px] font-bold text-[#191914] dark:border-[#f5f0e5]", status.className)}>
          {status.label}
        </span>
        {request.status === "PENDING" && (
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="inline-flex h-9 items-center gap-1 border border-[#191914] px-3 text-xs font-bold transition-colors hover:bg-[#ffb4aa] disabled:cursor-wait dark:border-[#f5f0e5] dark:hover:bg-[#3a2624]"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            撤销
          </button>
        )}
        {request.status === "DECLINED" && (
          <Link
            href={`/relationships?with=${encodeURIComponent(request.toUser.id)}&type=${encodeURIComponent(request.type)}`}
            className="inline-flex h-9 items-center gap-1 border border-[#191914] bg-[#d9ef61] px-3 text-xs font-bold text-[#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            再试一次
          </Link>
        )}
        <Link
          href={`/profile/${request.toUser.id}`}
          className="inline-flex h-9 items-center gap-1 border border-[#191914] px-3 text-xs font-bold hover:bg-[#f3c84b] dark:border-[#f5f0e5]"
        >
          主页
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {message && <span className="text-[10px] font-bold text-[#b52f1e]" role="status">{message}</span>}
      </div>
    </article>
  )
}
