"use client"

import Link from "next/link"
import { Clock, Heart, MessageCircle } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface PostRowProps {
  post: {
    id: string
    title: string
    content?: string
    author: {
      id: string
      name: string | null
      image?: string | null
      role?: string | null
      raputation?: number | null
    }
    category: {
      name: string
      slug: string
    }
    _count: {
      comments: number
      likes: number
    }
    createdAt: Date | string
    anonymous?: boolean
  }
  hideAuthor?: boolean
  pinned?: boolean
}

/** 去除 Markdown 语法得到纯文本摘要；帖子含图时返回 [图片] 标记。 */
function getExcerpt(content?: string): { text: string; hasImage: boolean } {
  if (!content) return { text: "", hasImage: false }
  const hasImage = /!\[[^\]]*\]\([^)\s]+\)/.test(content)
  const plain = content
    .replace(/!\[[^\]]*\]\([^)\s]+\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)\s]+\)/g, "$1")
    .replace(/[#>*`~_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return { text: plain.slice(0, 90), hasImage }
}

const categoryStyles: Record<string, { chip: string; text: string }> = {
  announcement: { chip: "bg-[#ff6b43]", text: "text-[#191914]" },
  lostfound: { chip: "bg-[#d9ef61]", text: "text-[#191914]" },
  confession: { chip: "bg-[#ffb4aa]", text: "text-[#191914]" },
  study: { chip: "bg-[#f3c84b]", text: "text-[#191914]" },
  activity: { chip: "bg-[#b9ddbd]", text: "text-[#191914]" },
  secondhand: { chip: "bg-[#f2d0b2]", text: "text-[#191914]" },
  "problem-discussion": { chip: "bg-[#e5ded1]", text: "text-[#191914]" },
  feedback: { chip: "bg-[#c8d7ef]", text: "text-[#191914]" },
}

/** 紧凑的论坛主题行：移动端与桌面端各自优化（行式扫读，信息密度高）。 */
export function PostRow({ post, hideAuthor = false, pinned = false }: PostRowProps) {
  const shouldHideAuthor = hideAuthor || post.anonymous || post.category.slug === "confession"
  const style = categoryStyles[post.category.slug] ?? categoryStyles["problem-discussion"]
  const authorName = shouldHideAuthor ? "匿名同学" : post.author.name ?? "未命名用户"
  const excerpt = getExcerpt(post.content)

  return (
    <Link
      href={`/post/${post.id}`}
      className="group relative grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-[#191914]/15 px-3 py-3 transition-colors last:border-b-0 hover:bg-[#f2eadc] dark:border-white/15 dark:hover:bg-[#24231e] sm:gap-4 sm:px-5 sm:py-3.5"
    >
      <span
        className={cn(
          "inline-flex max-w-20 items-center justify-center truncate border border-[#191914] px-2 py-1 font-mono text-[9px] font-bold tracking-[0.08em] dark:border-[#f5f0e5] sm:max-w-28 sm:text-[10px]",
          style.chip,
          style.text
        )}
      >
        {post.category.name}
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2">
          {pinned && (
            <span className="inline-flex shrink-0 items-center gap-1 border border-[#191914] bg-[#f3c84b] px-1.5 py-px font-mono text-[8px] font-bold tracking-[0.1em] text-[#191914] dark:border-[#f5f0e5]">
              置顶
            </span>
          )}
          <span className="truncate font-serif text-[15px] font-bold leading-snug text-[#191914] transition-colors group-hover:text-[#d44120] dark:text-[#f5f0e5] dark:group-hover:text-[#ff8a68] sm:text-base">
            {post.title}
          </span>
        </span>
        {(excerpt.text || excerpt.hasImage) && (
          <span className="mt-0.5 flex items-center gap-1.5 text-xs leading-5 text-[#777268] dark:text-[#aaa69c]">
            {excerpt.hasImage && (
              <span className="inline-flex shrink-0 items-center border border-[#191914]/30 bg-[#ece6da] px-1 py-px font-mono text-[9px] font-bold tracking-[0.06em] text-[#e4532f] dark:border-white/25 dark:bg-[#292821]">
                [图片]
              </span>
            )}
            <span className="truncate">{excerpt.text}</span>
          </span>
        )}
        <span className="mt-1 flex items-center gap-2 font-mono text-[9px] tracking-[0.08em] text-[#918b80] dark:text-[#7f7b73]">
          <span className="truncate">{authorName}</span>
          <span aria-hidden>·</span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatRelativeTime(post.createdAt)}
          </span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-2.5 font-mono text-[10px] font-bold text-[#777268] dark:text-[#aaa69c] sm:gap-4">
        <span className="flex items-center gap-1" aria-label={`${post._count.comments} 条评论`}>
          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
          {post._count.comments}
        </span>
        <span className="flex items-center gap-1" aria-label={`${post._count.likes} 个赞`}>
          <Heart className="h-3.5 w-3.5" aria-hidden />
          {post._count.likes}
        </span>
      </span>
    </Link>
  )
}
