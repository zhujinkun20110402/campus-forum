"use client"

import { LikeButton } from "@/components/post/like-button"

interface LikeSectionProps {
  postId: string
  likeCount: number
  isLiked: boolean
}

export function LikeSection({ postId, likeCount, isLiked }: LikeSectionProps) {
  return (
    <LikeButton postId={postId} likeCount={likeCount} isLiked={isLiked} />
  )
}