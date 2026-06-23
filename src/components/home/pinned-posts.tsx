"use client"

import Link from "next/link"
import { Pin, MessageCircle, Heart } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

interface PinnedPost {
  id: string
  title: string
  content: string
  author: { id: string; name: string | null; image: string | null }
  category: { name: string; slug: string }
  _count: { comments: number; likes: number }
  createdAt: Date | string
}

interface PinnedPostsProps {
  posts: PinnedPost[]
}

export function PinnedPosts({ posts }: PinnedPostsProps) {
  return (
    <div className="rounded-2xl border border-amber-200/60 dark:border-amber-800/40 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-[#141414] p-4 sm:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Pin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
          置顶公告
        </h3>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group block rounded-xl bg-white/70 dark:bg-[#1c1c1c]/70 hover:bg-white dark:hover:bg-[#1c1c1c] border border-transparent hover:border-amber-200/60 dark:hover:border-amber-800/40 transition-all p-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                  {post.title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {post.content}
                </p>
              </div>
              <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                {post.category.name}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2.5 text-[11px] text-stone-400 dark:text-stone-500">
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {post._count.comments}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {post._count.likes}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
