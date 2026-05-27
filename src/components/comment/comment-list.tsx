"use client"

import { Trash2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/utils"
import { deleteComment } from "@/lib/actions"

interface CommentListProps {
  comments: {
    id: string
    content: string
    createdAt: Date | string
    author: {
      id: string
      name: string | null
      image: string | null
    }
  }[]
  currentUserId?: string
  isAdmin?: boolean
  postId: string
}

export function CommentList({ comments, currentUserId, isAdmin, postId }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        暂无评论，来说点什么吧
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.author.image ?? undefined} />
                <AvatarFallback>
                  {comment.author.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.name ?? "匿名用户"}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {formatRelativeTime(comment.createdAt)}
                </span>
              </div>
            </div>
            {(comment.author.id === currentUserId || isAdmin) && (
              <form
                action={async () => {
                  await deleteComment(comment.id, postId)
                }}
              >
                <button
                  type="submit"
                  className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  title="删除评论"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  )
}