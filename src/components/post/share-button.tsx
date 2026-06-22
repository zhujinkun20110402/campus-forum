"use client"

import { Share2 } from "lucide-react"

interface ShareButtonProps {
  postId: string
}

export function ShareButton({ postId }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`)
    } catch {}
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 sm:px-4 sm:py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">分享</span>
    </button>
  )
}
