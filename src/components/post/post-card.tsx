"use client"

import Link from "next/link"
import { MessageCircle, Heart, Clock } from "lucide-react"
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

export function PostCard({ post, hideAuthor = false }: PostCardProps) {
  const truncatedContent =
    post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <article className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 transition-all duration-200 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
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
          </div>
          <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        <h3 className="text-base font-medium text-stone-800 dark:text-stone-200 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors mb-2">
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 line-clamp-3 mb-4">
          {truncatedContent}
        </p>

        <div className="flex items-center justify-between">
          {hideAuthor ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
                  ?
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                匿名
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.image ?? undefined} />
                <AvatarFallback className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                  {post.author.name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {post.author.name ?? "匿名用户"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-stone-500">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post._count.comments}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post._count.likes}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}