"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parsePoll } from "@/lib/poll"
import { isScheduledPending } from "@/lib/post-visibility"

/** 投票帖：每人一票，投出后不可更改 */
export async function votePoll(postId: string, optionId: string) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const [post, user] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, poll: true, publishAt: true },
    }),
    prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }),
  ])

  if (user?.role === "BANNED") return { message: "账号已被封禁" }
  if (!post) return { message: "帖子不存在" }
  if (isScheduledPending(post.publishAt)) return { message: "帖子尚未发布" }

  const poll = parsePoll(post.poll)
  if (!poll) return { message: "这不是投票帖" }
  if (!poll.options.some((option) => option.id === optionId)) return { message: "选项不存在" }

  try {
    await prisma.pollVote.create({
      data: { postId, userId: session.user.id, optionId },
    })
  } catch {
    // 唯一约束冲突：已投过票
    return { message: "你已经投过票了" }
  }

  revalidatePath(`/post/${postId}`)
  return { success: true as const }
}
