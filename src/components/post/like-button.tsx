"use client"

import { startTransition } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleLike } from "@/lib/actions"

interface LikeButtonProps {
  postId: string
  likeCount: number
  isLiked: boolean
}

export function LikeButton({ postId, likeCount, isLiked }: LikeButtonProps) {
  const handleClick = () => {
    startTransition(() => {
      toggleLike(postId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className="gap-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-2.5 py-1.5 sm:px-4 sm:py-2 h-auto text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`}
      />
      <span>{likeCount}</span>
    </Button>
  )
}