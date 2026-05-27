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
      className="gap-1.5"
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`}
      />
      <span>{likeCount}</span>
    </Button>
  )
}