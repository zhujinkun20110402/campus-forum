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
      className="h-9 rounded-none border border-[#191914] bg-[#ffb4aa] px-3 text-[#b52f1e] hover:bg-[#ff8f81] dark:border-[#f5f0e5]"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
