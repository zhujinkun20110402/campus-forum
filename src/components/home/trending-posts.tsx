"use client"

import Link from "next/link"
import { TrendingUp, MessageCircle, Heart } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { LevelBadge } from "@/components/reputation/level-badge"
import { formatRelativeTime } from "@/lib/utils"

interface TrendingPost {
  id: string
  title: string
  author: { id: string; name: string | null; image: string | null; role?: string | null; raputation?: number | null }
  category: { name: string; slug: string }
  _count: { comments: number; likes: number }
  createdAt: Date | string
}

interface TrendingPostsProps {
  posts: TrendingPost[]
}

export function TrendingPosts({ posts }: TrendingPostsProps) {
  if (posts.length === 0) return null

  return (
    <div className="h-full rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-rose-500" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">热门帖子</h3>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">近 7 天最受欢迎</p>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors"
          >
            <span className="shrink-0 h-5 w-5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-medium text-stone-500 flex items-center justify-center mt-0.5">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                <span className="flex items-center gap-1">
                  <UserAvatar name={post.author.name} image={post.author.image} role={post.author.role} size="sm" />
                  <span className="truncate max-w-[80px]">{post.author.name ?? "匿名"}</span>
                  {post.author.raputation != null && (
                    <LevelBadge raputation={post.author.raputation} role={post.author.role} size="xs" showTitle={false} />
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {post._count.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {post._count.comments}
                </span>
                <span className="hidden sm:inline">{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
