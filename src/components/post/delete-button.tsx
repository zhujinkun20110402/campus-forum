"use client"

import { startTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deletePost } from "@/lib/actions"

interface DeleteButtonProps {
  postId: string
}

export function DeleteButton({ postId }: DeleteButtonProps) {
  const handleDelete = () => {
    if (!window.confirm("确定要删除这篇帖子吗？此操作不可撤销。")) {
      return
    }

    startTransition(() => {
      deletePost(postId)
    })
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}