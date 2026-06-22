"use client"

import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { MessageCircle, Heart, Clock, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

const categoryStyles: Record<string, { badge: string; dot: string }> = {
  announcement: {
    badge: "bg-amber-50/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60",
    dot: "bg-amber-500",
  },
  lostfound: {
    badge: "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
  },
  confession: {
    badge: "bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60",
    dot: "bg-rose-500",
  },
  study: {
    badge: "bg-sky-50/80 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/60",
    dot: "bg-sky-500",
  },
  activity: {
    badge: "bg-purple-50/80 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60",
    dot: "bg-purple-500",
  },
  secondhand: {
    badge: "bg-orange-50/80 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-800/60",
    dot: "bg-orange-500",
  },
  "problem-discussion": {
    badge: "bg-stone-100 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300 border-stone-200/60 dark:border-stone-700/60",
    dot: "bg-stone-500",
  },
}

function getCategoryStyle(slug: string) {
  return categoryStyles[slug] ?? {
    badge: "bg-stone-100 dark:bg-stone-900/50 text-stone-700 dark:text-stone-300 border-stone-200/60 dark:border-stone-700/60",
    dot: "bg-stone-500",
  }
}

export function PostCard({ post, hideAuthor = false }: PostCardProps) {
  const isConfession = post.category.slug === "confession"
  const shouldHideAuthor = hideAuthor || isConfession
  const truncatedContent =
    post.content.length > 220 ? post.content.slice(0, 220) + "..." : post.content
  const style = getCategoryStyle(post.category.slug)

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <article className="relative bg-white dark:bg-[#141414] px-4 py-5 sm:px-5 sm:py-6 transition-colors hover:bg-stone-50/50 dark:hover:bg-[#171717]">
        {/* Header: Avatar + Name + Meta */}
        <div className="flex items-start gap-3 mb-3">
          {shouldHideAuthor ? (
            <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-2 ring-rose-100 dark:ring-rose-900/30 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <span className="text-sm text-rose-400">?</span>
            </div>
          ) : (
            <Link
              href={`/profile/${post.author.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden ring-2 ring-stone-100 dark:ring-stone-800 hover:ring-amber-200 dark:hover:ring-amber-800/50 transition-all"
            >
              {post.author.image ? (
                <SafeImage
                  src={post.author.image}
                  alt={post.author.name ?? ""}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    {post.author.name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
            </Link>
          )}

          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-[15px] text-stone-800 dark:text-stone-100 truncate">
                {shouldHideAuthor ? "匿名同学" : (post.author.name ?? "匿名用户")}
              </span>
              <Link
                href={`/category/${post.category.slug}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-normal cursor-pointer px-1.5 py-0 h-4 border rounded-full",
                    style.badge
                  )}
                >
                  <span className={cn("w-1 h-1 rounded-full mr-1", style.dot)} />
                  {post.category.name}
                </Badge>
              </Link>
            </div>
            <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <MoreHorizontal className="h-4 w-4 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
        </div>

        {/* Content */}
        <div className="pl-[52px]">
          <h3 className="font-serif text-lg sm:text-xl font-semibold text-stone-800 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mb-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-[15px] leading-[1.7] text-stone-600 dark:text-stone-400 line-clamp-3 mb-4">
            {truncatedContent}
          </p>

          {/* Action bar */}
          <div className="flex items-center gap-6 text-sm text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1.5 transition-colors group-hover:text-stone-500 dark:group-hover:text-stone-400">
              <MessageCircle className="h-4 w-4" />
              {post._count.comments}
            </span>
            <span className="flex items-center gap-1.5 transition-colors group-hover:text-stone-500 dark:group-hover:text-stone-400">
              <Heart className="h-4 w-4" />
              {post._count.likes}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
