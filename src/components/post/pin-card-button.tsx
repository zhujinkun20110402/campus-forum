"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pin } from "lucide-react"
import { usePinCard } from "@/lib/reputation-actions"

interface PinCardButtonProps {
  postId: string
  selfPinnedActive: boolean
}

/** 置顶卡按钮：作者可用一张置顶卡将自己的帖子置顶 24 小时 */
export function PinCardButton({ postId, selfPinnedActive }: PinCardButtonProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (selfPinnedActive) {
    return (
      <span className="inline-flex h-9 items-center gap-2 border border-[#191914] bg-[#f3c84b] px-3 text-sm font-bold text-[#191914] dark:border-[#f5f0e5]">
        <Pin className="h-4 w-4" /> 置顶中 · 24h
      </span>
    )
  }

  const handlePin = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await usePinCard(postId)
      if (result && "message" in result) {
        setMessage(result.message ?? null)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handlePin}
        disabled={isPending}
        className="inline-flex h-9 items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 text-sm font-bold transition-colors hover:bg-[#d9ef61] disabled:opacity-50 dark:border-[#f5f0e5] dark:bg-[#191914]"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pin className="h-4 w-4" />}
        使用置顶卡
      </button>
      {message && <span className="text-xs font-bold text-[#d44120]">{message}</span>}
    </span>
  )
}
