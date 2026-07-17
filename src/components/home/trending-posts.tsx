"use client"

import Link from "next/link"
import { Heart, MessageCircle, TrendingUp } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
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
    <div className="border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[5px_5px_0_#ff6b43] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] sm:p-6">
      <div className="mb-4 flex items-center justify-between border-b border-[#191914]/20 pb-4 dark:border-white/20">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">TRENDING / 7 DAYS</p>
          <h3 className="mt-1 font-serif text-xl font-bold">本周热帖</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#191914] dark:border-[#f5f0e5]">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>

      <div>
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group grid grid-cols-[32px_minmax(0,1fr)] gap-3 border-b border-[#191914]/12 py-3.5 last:border-b-0 dark:border-white/12"
          >
            <span className="font-mono text-lg font-bold text-[#c8c1b5] transition-colors group-hover:text-[#e4532f] dark:text-[#57544d]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h4 className="line-clamp-2 text-sm font-bold leading-5 transition-colors group-hover:text-[#d44120] dark:group-hover:text-[#ff8a68]">
                {post.title}
              </h4>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[9px] text-[#8b857b] dark:text-[#918c82]">
                <span className="flex items-center gap-1.5">
                  <UserAvatar name={post.author.name} image={post.author.image} role={post.author.role} size="sm" />
                  <span className="max-w-20 truncate">{post.author.name ?? "匿名"}</span>
                </span>
                <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post._count.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" />{post._count.comments}</span>
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
