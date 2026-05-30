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
}

export function PostCard({ post }: PostCardProps) {
  const truncatedContent =
    post.content.length > 160 ? post.content.slice(0, 160) + "..." : post.content

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <div className="h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-0.5">
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/category/${post.category.slug}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant="secondary">{post.category.name}</Badge>
          </Link>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
          {truncatedContent}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={post.author.image ?? undefined} />
              <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                {post.author.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {post.author.name ?? "匿名用户"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
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
      </div>
    </Link>
  )
}