"use client"

import { startTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteComment } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface DeleteCommentButtonProps {
  commentId: string
  postId: string
  className?: string
}

export function DeleteCommentButton({ commentId, postId, className }: DeleteCommentButtonProps) {
  const handleDelete = () => {
    if (!window.confirm("确定要删除这条评论吗？")) {
      return
    }

    startTransition(() => {
      deleteComment(commentId, postId)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className={cn(className)}
      aria-label="删除评论"
      title="删除评论"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
