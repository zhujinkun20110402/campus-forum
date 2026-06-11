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
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-indigo-700 bg-white dark:bg-indigo-900/40 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-indigo-800/50 transition-colors"
    >
      <Share2 className="h-4 w-4" />
      <span>分享</span>
    </button>
  )
}
