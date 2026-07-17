"use client"

import { useState, useTransition } from "react"
import { Pin, PinOff } from "lucide-react"
import { togglePinPost } from "@/lib/actions"

interface PinButtonProps {
  postId: string
  initialPinned: boolean
}

export function PinButton({ postId, initialPinned }: PinButtonProps) {
  const [pinned, setPinned] = useState(initialPinned)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await togglePinPost(postId, pinned)
        setPinned(!pinned)
      } catch (error) {
        alert(error instanceof Error ? error.message : "操作失败")
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex h-9 items-center gap-1.5 border px-3 text-sm font-bold transition-colors disabled:opacity-50 ${
        pinned
          ? "border-[#191914] bg-[#f3c84b] text-[#191914] dark:border-[#f5f0e5]"
          : "border-[#191914] bg-[#fffaf0] text-[#191914] hover:bg-[#f3c84b] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#f3c84b] dark:hover:text-[#191914]"
      }`}
    >
      {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      <span className="hidden sm:inline">{pinned ? "取消置顶" : "置顶"}</span>
    </button>
  )
}
