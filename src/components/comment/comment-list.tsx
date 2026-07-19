"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { CornerUpLeft, MessageCircleMore, Radio } from "lucide-react"
import { CommentForm } from "@/components/comment/comment-form"
import { DeleteCommentButton } from "@/components/comment/delete-comment-button"
import { LevelBadge } from "@/components/reputation/level-badge"
import { UserAvatar } from "@/components/user/user-avatar"
import { cn, formatRelativeTime } from "@/lib/utils"

interface CommentAuthor {
  id: string
  name: string | null
  image: string | null
  role?: string | null
  raputation?: number | null
}

interface ThreadComment {
  id: string
  content: string
  createdAt: Date | string
  author: CommentAuthor
  parent?: {
    id: string
    content: string
    author: { id: string; name: string | null }
  } | null
}

interface CommentListProps {
  comments: ThreadComment[]
  currentUserId: string
  isAdmin?: boolean
  postId: string
}

interface ReplySelection {
  id: string
  content: string
  author: { name: string | null }
}

export function CommentList({ comments, currentUserId, isAdmin, postId }: CommentListProps) {
  const threadRef = useRef<HTMLDivElement>(null)
  const [replyingTo, setReplyingTo] = useState<ReplySelection | null>(null)
  const clearReply = useCallback(() => setReplyingTo(null), [])

  useEffect(() => {
    const thread = threadRef.current
    if (thread) thread.scrollTop = thread.scrollHeight
  }, [comments.length])

  function startReply(comment: ReplySelection) {
    setReplyingTo(comment)
    window.setTimeout(() => {
      document.getElementById("comment-composer")?.scrollIntoView({ behavior: "smooth", block: "center" })
      document.getElementById("comment-composer")?.focus()
    }, 0)
  }

  return (
    <div className="overflow-hidden border-2 border-[#191914] bg-[#cfdcc9] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#20231f] dark:shadow-[6px_6px_0_#f5f0e5]">
      <div className="flex items-center justify-between border-b-2 border-[#191914] bg-[#191914] px-4 py-3 text-[#f5f0e5] dark:border-[#f5f0e5]">
        <div className="flex items-center gap-2">
          <MessageCircleMore className="h-4 w-4 text-[#d9ef61]" />
          <span className="text-sm font-bold">帖子讨论群</span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-white/50"><Radio className="h-3 w-3 text-[#ff8a68]" />{comments.length} MESSAGES</span>
      </div>

      <div ref={threadRef} className="max-h-[720px] min-h-64 space-y-5 overflow-y-auto px-3 py-6 sm:px-6">
        {comments.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#191914] bg-[#fffaf0] text-[#e4532f] dark:border-[#f5f0e5] dark:bg-[#191914]"><MessageCircleMore className="h-6 w-6" /></div>
            <p className="mt-4 font-serif text-lg font-bold">群聊还没有消息</p>
            <p className="mt-1 text-xs text-[#5f5c54] dark:text-[#aaa69c]">从一条认真回应开始。</p>
          </div>
        ) : comments.map((comment) => {
          const mine = comment.author.id === currentUserId
          const authorName = comment.author.name ?? "未命名用户"

          return (
            <div key={comment.id} className={cn("flex items-start gap-2.5", mine && "flex-row-reverse")}>
              <Link href={`/profile/${comment.author.id}`} className="shrink-0" aria-label={`查看 ${authorName} 的主页`}>
                <UserAvatar name={comment.author.name} image={comment.author.image} role={comment.author.role} size="md" />
              </Link>

              <div className={cn("min-w-0 max-w-[82%] sm:max-w-[72%]", mine && "text-right")}>
                <div className={cn("mb-1 flex flex-wrap items-center gap-2", mine && "justify-end")}>
                  <Link href={`/profile/${comment.author.id}`} className="text-xs font-bold hover:text-[#d44120] dark:hover:text-[#ff8a68]">{mine ? "我" : authorName}</Link>
                  {comment.author.raputation != null && <LevelBadge raputation={comment.author.raputation} role={comment.author.role} size="xs" showTitle={false} />}
                  <span className="font-mono text-[8px] text-[#6f736b] dark:text-[#8f948b]">{formatRelativeTime(comment.createdAt)}</span>
                </div>

                <div className={cn(
                  "relative border border-[#191914]/35 px-3 py-2.5 text-left text-sm leading-6 text-[#292822] shadow-[2px_2px_0_rgba(25,25,20,0.12)] dark:border-white/25 dark:text-[#eee9de]",
                  mine ? "bg-[#d9ef61] dark:bg-[#53632c]" : "bg-[#fffaf0] dark:bg-[#191914]"
                )}>
                  {comment.parent && (
                    <button type="button" onClick={() => startReply(comment.parent!)} className="mb-2 block w-full border-l-3 border-[#e4532f] bg-[#191914]/[0.06] px-2 py-1.5 text-left dark:bg-white/[0.07]">
                      <span className="block text-[10px] font-bold text-[#d44120] dark:text-[#ff8a68]">回复 @{comment.parent.author.name ?? "未命名用户"}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-[#69655d] dark:text-[#aaa69c]">{comment.parent.content}</span>
                    </button>
                  )}
                  <p className="whitespace-pre-wrap break-words">{comment.content}</p>
                </div>

                <div className={cn("mt-1.5 flex items-center gap-1", mine && "justify-end")}>
                  <button type="button" onClick={() => startReply(comment)} className="inline-flex h-7 items-center gap-1 px-2 text-[10px] font-bold text-[#5f5c54] hover:bg-[#fffaf0] hover:text-[#191914] dark:text-[#aaa69c] dark:hover:bg-[#191914] dark:hover:text-[#f5f0e5]">
                    <CornerUpLeft className="h-3 w-3" /> 回复
                  </button>
                  {(mine || isAdmin) && <DeleteCommentButton commentId={comment.id} postId={postId} className="h-7 w-7 rounded-none text-[#777268] hover:bg-[#ffb4aa] hover:text-[#b52f1e]" />}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <CommentForm
        key={replyingTo?.id ?? "root"}
        postId={postId}
        replyTo={replyingTo ? { id: replyingTo.id, name: replyingTo.author.name ?? "未命名用户", content: replyingTo.content } : null}
        onCancelReply={clearReply}
        onSuccess={clearReply}
      />
    </div>
  )
}
