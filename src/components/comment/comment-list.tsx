"use client"

import { Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { LevelBadge } from "@/components/reputation/level-badge"
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
      role?: string | null
      raputation?: number | null
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
              <UserAvatar
                name={comment.author.name}
                image={comment.author.image}
                role={comment.author.role}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author.name ?? "匿名用户"}
                  </span>
                  {comment.author.raputation != null && (
                    <LevelBadge raputation={comment.author.raputation} role={comment.author.role} size="xs" showTitle={false} />
                  )}
                </div>
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