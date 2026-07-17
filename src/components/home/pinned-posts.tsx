"use client"

import Link from "next/link"
import { Heart, MessageCircle, Pin } from "lucide-react"
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
    <div className="border-2 border-[#191914] bg-[#f3c84b] p-4 text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5] sm:p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center border-2 border-[#191914] bg-[#191914] text-[#f3c84b]">
          <Pin className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-bold">置顶公告</h3>
          <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-[#191914]/55">PINNED BY SCHOOL</p>
        </div>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group block border border-[#191914]/25 bg-[#fffaf0]/85 p-3.5 transition-all hover:-translate-y-0.5 hover:bg-[#fffaf0] dark:border-[#f5f0e5]/20 dark:bg-[#191914]/85 dark:hover:bg-[#191914]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="line-clamp-1 font-serif font-bold text-[#191914] transition-colors group-hover:text-[#d44120] dark:text-[#f5f0e5]">
                  {post.title}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#69655d] dark:text-[#aaa69c]">
                  {post.content}
                </p>
              </div>
              <span className="shrink-0 border border-[#191914] px-2 py-0.5 font-mono text-[9px] font-bold dark:border-[#f5f0e5]">
                {post.category.name}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-4 font-mono text-[10px] text-[#777268] dark:text-[#aaa69c]">
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> {post._count.comments}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {post._count.likes}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
