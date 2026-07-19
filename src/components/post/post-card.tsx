"use client"

import Link from "next/link"
import { Clock, Heart, MessageCircle } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { LevelBadge } from "@/components/reputation/level-badge"
import { formatRelativeTime } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    author: {
      id: string
      name: string | null
      image: string | null
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
  }
  hideAuthor?: boolean
}

const categoryStyles: Record<string, { chip: string; accent: string }> = {
  announcement: { chip: "bg-[#ff6b43]", accent: "bg-[#ff6b43]" },
  lostfound: { chip: "bg-[#d9ef61]", accent: "bg-[#7a9130]" },
  confession: { chip: "bg-[#ffb4aa]", accent: "bg-[#e86472]" },
  study: { chip: "bg-[#f3c84b]", accent: "bg-[#c18f18]" },
  activity: { chip: "bg-[#b9ddbd]", accent: "bg-[#3f8450]" },
  secondhand: { chip: "bg-[#f2d0b2]", accent: "bg-[#d85d2f]" },
  "problem-discussion": { chip: "bg-[#e5ded1]", accent: "bg-[#68645c]" },
  feedback: { chip: "bg-[#c8d7ef]", accent: "bg-[#52729d]" },
}

function getCategoryStyle(slug: string) {
  return categoryStyles[slug] ?? { chip: "bg-[#e5ded1]", accent: "bg-[#68645c]" }
}

export function PostCard({ post, hideAuthor = false }: PostCardProps) {
  const shouldHideAuthor = hideAuthor || post.category.slug === "confession"
  const truncatedContent = post.content.length > 210 ? `${post.content.slice(0, 210)}...` : post.content
  const style = getCategoryStyle(post.category.slug)

  return (
    <article className="group relative overflow-hidden border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[5px_5px_0_rgba(25,25,20,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_#ff6b43] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[5px_5px_0_rgba(245,240,229,0.12)] sm:p-6">
      <div aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", style.accent)} />
      <Link href={`/post/${post.id}`} aria-label={`查看帖子：${post.title}`} className="absolute inset-0 z-0" />

      <div className="pointer-events-none relative z-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/category/${post.category.slug}`}
            className={cn(
              "pointer-events-auto inline-flex items-center border border-[#191914] px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.12em] text-[#191914] transition-transform hover:-rotate-1 dark:border-[#f5f0e5]",
              style.chip
            )}
          >
            {post.category.name}
          </Link>
          <span className="flex items-center gap-1.5 font-mono text-[9px] font-medium tracking-[0.08em] text-[#888277] dark:text-[#918c82]">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        <h3 className="max-w-2xl font-serif text-xl font-bold leading-snug tracking-tight transition-colors group-hover:text-[#d94d2a] sm:text-2xl">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#69655d] dark:text-[#aaa69c] sm:text-[15px]">
          {truncatedContent}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#191914]/15 pt-4 dark:border-white/15">
          <div className="flex min-w-0 items-center gap-2.5">
            {shouldHideAuthor ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#191914] bg-[#ffb4aa] text-sm font-bold text-[#191914] dark:border-[#f5f0e5]">
                ?
              </div>
            ) : (
              <Link href={`/profile/${post.author.id}`} className="pointer-events-auto shrink-0" aria-label={`查看${post.author.name ?? "用户"}的主页`}>
                <UserAvatar name={post.author.name} image={post.author.image} role={post.author.role} size="sm" />
              </Link>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-bold">
                  {shouldHideAuthor ? "匿名同学" : (post.author.name ?? "匿名用户")}
                </span>
                {!shouldHideAuthor && post.author.raputation != null && (
                  <LevelBadge raputation={post.author.raputation} role={post.author.role} size="xs" showTitle={false} />
                )}
              </div>
              <span className="mt-0.5 block font-mono text-[8px] tracking-[0.12em] text-[#9a9489]">CAMPUS MEMBER</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4 font-mono text-[10px] font-bold text-[#777268] dark:text-[#aaa69c]">
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" /> {post._count.comments}
            </span>
            <span className="flex items-center gap-1.5">
              <Heart className="h-4 w-4" /> {post._count.likes}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
