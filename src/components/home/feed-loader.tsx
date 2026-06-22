"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { getMorePosts } from "@/lib/actions"
import { PostCard } from "@/components/post/post-card"
import { Loader2 } from "lucide-react"

interface PostType {
  id: string
  title: string
  content: string
  author: { id: string; name: string | null; image: string | null }
  category: { name: string; slug: string }
  _count: { comments: number; likes: number }
  createdAt: Date | string
}

interface FeedLoaderProps {
  initialPosts: PostType[]
  pageSize?: number
}

export function FeedLoader({ initialPosts, pageSize = 12 }: FeedLoaderProps) {
  const [posts, setPosts] = useState<PostType[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialPosts.length >= pageSize)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const newPosts = await getMorePosts(page, pageSize)
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
  }, [page, pageSize, loading, hasMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="divide-y divide-stone-100 dark:divide-stone-800 border-y border-stone-100 dark:border-stone-800">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      <div ref={sentinelRef} className="flex justify-center py-8">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载中...
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-sm text-stone-400 dark:text-stone-500">
            — 已经到底了 —
          </p>
        )}
      </div>
    </div>
  )
}