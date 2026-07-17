/**
 * 帖子置顶功能 — 使用数据库存储
 * Post.pinned 字段控制置顶状态
 */
import { prisma } from "@/lib/prisma"

/**
 * 获取所有置顶帖子的 ID（按 createdAt 降序，最新置顶的排前面）
 */
export async function getPinnedPostIds(): Promise<string[]> {
  const pinnedPosts = await prisma.post.findMany({
    where: { pinned: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })
  return pinnedPosts.map((p) => p.id)
}

/**
 * 置顶帖子
 */
export async function pinPost(postId: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { pinned: true },
  })
}

/**
 * 取消置顶
 */
export async function unpinPost(postId: string): Promise<void> {
  await prisma.post.update({
    where: { id: postId },
    data: { pinned: false },
  })
}

/**
 * 检查帖子是否已置顶
 */
export async function isPostPinned(postId: string): Promise<boolean> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { pinned: true },
  })
  return post?.pinned ?? false
}
