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
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 py-1.5 sm:px-4 sm:py-2 text-sm transition-colors ${
        pinned
          ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
          : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
      }`}
    >
      {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      <span className="hidden sm:inline">{pinned ? "取消置顶" : "置顶"}</span>
    </button>
  )
}
