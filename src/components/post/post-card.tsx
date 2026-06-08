"use client"

import Link from "next/link"
import { MessageCircle, Heart, Clock, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/utils"

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    author: {
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

function getCategoryBadgeStyle(slug: string) {
  const styles: Record<string, string> = {
    announcement: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    lostfound: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    confession: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    study: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800",
    activity: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    secondhand: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  }
  return styles[slug] ?? "bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
}

function getCategoryGlow(slug: string) {
  const glows: Record<string, string> = {
    announcement: "group-hover:shadow-amber-100/50 dark:group-hover:shadow-amber-900/20",
    lostfound: "group-hover:shadow-emerald-100/50 dark:group-hover:shadow-emerald-900/20",
    confession: "group-hover:shadow-rose-100/50 dark:group-hover:shadow-rose-900/20",
    study: "group-hover:shadow-sky-100/50 dark:group-hover:shadow-sky-900/20",
    activity: "group-hover:shadow-purple-100/50 dark:group-hover:shadow-purple-900/20",
    secondhand: "group-hover:shadow-orange-100/50 dark:group-hover:shadow-orange-900/20",
  }
  return glows[slug] ?? "group-hover:shadow-stone-200/50 dark:group-hover:shadow-stone-800/20"
}

export function PostCard({ post, hideAuthor = false }: PostCardProps) {
  const truncatedContent =
    post.content.length > 180 ? post.content.slice(0, 180) + "..." : post.content

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <article className={`relative rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 sm:p-6 transition-all duration-300 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-lg ${getCategoryGlow(post.category.slug)} hover:-translate-y-0.5`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Link
              href={`/category/${post.category.slug}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Badge
                variant="outline"
                className={`text-xs font-normal ${getCategoryBadgeStyle(post.category.slug)}`}
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

        <h3 className="text-base font-medium text-stone-800 dark:text-stone-200 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors mb-2.5 leading-snug">
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 line-clamp-2 mb-5">
          {truncatedContent}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
          {hideAuthor ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-stone-100 dark:ring-stone-800">
                <AvatarFallback className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
                  ?
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                匿名用户
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 ring-2 ring-stone-100 dark:ring-stone-800">
                <AvatarImage src={post.author.image ?? undefined} />
                <AvatarFallback className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  {post.author.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {post.author.name ?? "匿名用户"}
              </span>
            </div>
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
