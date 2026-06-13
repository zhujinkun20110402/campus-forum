"use client"

import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { MessageCircle, Heart, Clock, ArrowUpRight, Bookmark } from "lucide-react"
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

const categoryStyles: Record<string, { badge: string; glow: string; accent: string }> = {
  announcement: {
    badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    glow: "group-hover:shadow-amber-100/50 dark:group-hover:shadow-amber-900/20",
    accent: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
  },
  lostfound: {
    badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    glow: "group-hover:shadow-emerald-100/50 dark:group-hover:shadow-emerald-900/20",
    accent: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  },
  confession: {
    badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    glow: "group-hover:shadow-rose-100/50 dark:group-hover:shadow-rose-900/20",
    accent: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
  },
  study: {
    badge: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800",
    glow: "group-hover:shadow-sky-100/50 dark:group-hover:shadow-sky-900/20",
    accent: "group-hover:text-sky-600 dark:group-hover:text-sky-400",
  },
  activity: {
    badge: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    glow: "group-hover:shadow-purple-100/50 dark:group-hover:shadow-purple-900/20",
    accent: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
  },
  secondhand: {
    badge: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    glow: "group-hover:shadow-orange-100/50 dark:group-hover:shadow-orange-900/20",
    accent: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
  },
  "problem-discussion": {
    badge: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    glow: "group-hover:shadow-indigo-100/50 dark:group-hover:shadow-indigo-900/20",
    accent: "group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
  },
}

function getCategoryStyle(slug: string) {
  return categoryStyles[slug] ?? {
    badge: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
    glow: "group-hover:shadow-slate-200/50 dark:group-hover:shadow-slate-800/20",
    accent: "group-hover:text-slate-600 dark:group-hover:text-slate-400",
  }
}

export function PostCard({ post, hideAuthor = false }: PostCardProps) {
  const isConfession = post.category.slug === "confession"
  const shouldHideAuthor = hideAuthor || isConfession
  const truncatedContent =
    post.content.length > 160 ? post.content.slice(0, 160) + "..." : post.content
  const style = getCategoryStyle(post.category.slug)

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <article
        className={cn(
          "relative rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-5 sm:p-6 transition-all duration-400 card-shine",
          "hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-lg",
          style.glow,
          "hover:-translate-y-1"
        )}
      >
        {/* Top row: Badge + Time + Arrow */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/category/${post.category.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Badge
                variant="outline"
                className={cn("text-xs font-normal cursor-pointer", style.badge)}
              >
                {post.category.name}
              </Badge>
            </Link>
            <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-0.5 translate-x-0.5" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-base font-semibold text-stone-800 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors mb-2.5 leading-snug">
          {post.title}
        </h3>

        {/* Content preview */}
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 line-clamp-2 mb-5">
          {truncatedContent}
        </p>

        {/* Bottom row: Author + Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
          {shouldHideAuthor ? (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                <span className="text-[10px] text-rose-400">?</span>
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                匿名用户
              </span>
            </div>
          ) : (
            <Link
              href={`/profile/${post.author.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {post.author.image ? (
                <div className="relative h-7 w-7 rounded-full overflow-hidden ring-2 ring-stone-100 dark:ring-stone-700">
                  <SafeImage
                    src={post.author.image}
                    alt={post.author.name ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-7 w-7 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center ring-2 ring-stone-100 dark:ring-stone-800">
                  <span className="text-[10px] font-medium text-stone-600 dark:text-stone-300">
                    {post.author.name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {post.author.name ?? "匿名用户"}
              </span>
            </Link>
          )}

          <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1.5 transition-colors group-hover:text-stone-500 dark:group-hover:text-stone-400">
              <MessageCircle className="h-3.5 w-3.5" />
              {post._count.comments}
            </span>
            <span className="flex items-center gap-1.5 transition-colors group-hover:text-stone-500 dark:group-hover:text-stone-400">
              <Heart className="h-3.5 w-3.5" />
              {post._count.likes}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
