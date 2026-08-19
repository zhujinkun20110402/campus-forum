import "server-only"

import { prisma } from "@/lib/prisma"
import { withTtl } from "@/lib/ttl-cache"

/**
 * 全站共享、低频变化的数据，用进程内 TTL 缓存减少数据库往返（省函数时长）。
 * 每个缓存项独立 TTL，过期后由下一个请求同步刷新一次。
 */

const MINUTE = 60_000

export function getSiteStatsCached() {
  return withTtl("site-stats", 5 * MINUTE, async () => {
    const [posts, users, comments] = await prisma.$transaction([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
    ])
    return { posts, users, comments }
  })
}

export function getTrendingPostsCached() {
  return withTtl("trending-posts", 2 * MINUTE, async () => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const posts = await prisma.post.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: [
        { likes: { _count: "desc" } },
        { comments: { _count: "desc" } },
      ],
      take: 5,
      include: {
        author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true, likes: true } },
      },
    })

    // 表白墙帖子在服务端即抹除作者信息，避免真实身份泄露（与原实现一致）
    return posts.map((post) =>
      post.category.slug === "confession"
        ? { ...post, author: { id: "anonymous", name: null, image: null, role: null, raputation: null } }
        : post
    )
  })
}

export function getPinnedPostsCached() {
  // 置顶列表 TTL 短一些，管理员置顶/取消后 30 秒内可见
  return withTtl("pinned-posts", 30_000, () =>
    prisma.post.findMany({
      where: { pinned: true },
      orderBy: { updatedAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true, raputation: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        _count: {
          select: { comments: true, likes: true },
        },
      },
    })
  )
}

export function getActiveUsersCached() {
  return withTtl("active-users", 5 * MINUTE, () =>
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, image: true, role: true, raputation: true },
    })
  )
}

export function getCategoryCountsCached() {
  return withTtl("category-counts", 5 * MINUTE, () =>
    prisma.category.findMany({
      include: {
        _count: { select: { posts: true } },
      },
    })
  )
}
