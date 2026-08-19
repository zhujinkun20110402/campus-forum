"use client"

import { useState, useCallback } from "react"
import { getMorePosts } from "@/lib/actions"
import { PostRow } from "@/components/post/post-row"
import { ChevronDown, Loader2 } from "lucide-react"

interface PostType {
  id: string
  title: string
  content: string
  author: { id: string; name: string | null; image: string | null; role?: string | null; raputation?: number | null }
  category: { name: string; slug: string }
  _count: { comments: number; likes: number }
  createdAt: Date | string
}

interface FeedLoaderProps {
  initialPosts: PostType[]
  pageSize?: number
  feed?: "latest" | "following"
}

export function FeedLoader({ initialPosts, pageSize = 12, feed = "latest" }: FeedLoaderProps) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= pageSize)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const newPosts = await getMorePosts(page, pageSize, feed)
      if (newPosts.length < pageSize) {
        setHasMore(false)
      }
      if (newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts])
        setPage((p) => p + 1)
      }
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, feed, loading, hasMore])

  return (
    <div>
      <div className="overflow-hidden border-2 border-[#191914] bg-[#fffaf0] shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.12)]">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </div>

      <div className="mt-5 flex min-h-11 items-center justify-center">
        {hasMore ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-6 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0 dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                加载中…
              </>
            ) : (
              <>
                加载更多
                <ChevronDown className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        ) : posts.length > 0 ? (
          <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#918b80] dark:text-[#77736b]">
            — YOU&apos;RE ALL CAUGHT UP —
          </p>
        ) : null}
      </div>
    </div>
  )
}
