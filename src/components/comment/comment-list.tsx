"use client"

import { MessageSquare, Trash2 } from "lucide-react"
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
      <div className="border-2 border-dashed border-[#191914]/35 bg-[#fffaf0]/50 py-14 text-center dark:border-white/30 dark:bg-[#191914]/40">
        <MessageSquare className="mx-auto h-8 w-8 text-[#e4532f]" />
        <p className="mt-3 text-sm text-[#777268] dark:text-[#989389]">暂无评论，来说点什么吧</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <div key={comment.id} className="border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[4px_4px_0_rgba(25,25,20,0.14)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[4px_4px_0_rgba(245,240,229,0.1)] sm:p-6">
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
                  <span className="text-sm font-bold">
                    {comment.author.name ?? "匿名用户"}
                  </span>
                  {comment.author.raputation != null && (
                    <LevelBadge raputation={comment.author.raputation} role={comment.author.role} size="xs" showTitle={false} />
                  )}
                </div>
                <span className="font-mono text-[9px] tracking-[0.1em] text-[#918b80]">
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
                  className="flex h-8 w-8 items-center justify-center border border-transparent text-[#918b80] hover:border-[#191914] hover:bg-[#ffb4aa] hover:text-[#b52f1e] dark:hover:border-[#f5f0e5]"
                  title="删除评论"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
          <p className="mt-4 whitespace-pre-wrap border-t border-[#191914]/15 pt-4 text-sm leading-7 text-[#5f5c54] dark:border-white/15 dark:text-[#c0bbb1]">
            {comment.content}
          </p>
          <p className="mt-3 text-right font-mono text-[9px] font-bold tracking-[0.12em] text-[#c0b9ad] dark:text-[#5f5b54]">#{String(index + 1).padStart(2, "0")}</p>
        </div>
      ))}
    </div>
  )
}
