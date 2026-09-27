"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Send } from "lucide-react"
import { publishScheduledPost } from "@/lib/reputation-actions"

/** 定时发布中的帖子：作者可立即发布 */
export function PublishNowButton({ postId }: { postId: string }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handlePublish = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await publishScheduledPost(postId)
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
        onClick={handlePublish}
        disabled={isPending}
        className="inline-flex h-9 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-3 text-sm font-bold text-[#191914] disabled:opacity-50 dark:border-[#f5f0e5]"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        立即发布
      </button>
      {message && <span className="text-xs font-bold text-[#d44120]">{message}</span>}
    </span>
  )
}
