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
      className="h-9 gap-1.5 rounded-none border border-[#191914] bg-[#fffaf0] px-3 text-sm font-bold text-[#191914] hover:bg-[#ffb4aa] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#ffb4aa] dark:hover:text-[#191914]"
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`}
      />
      <span>{likeCount}</span>
    </Button>
  )
}
