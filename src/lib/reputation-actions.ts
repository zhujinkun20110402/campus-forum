"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { mintReputationInviteCodes } from "@/lib/invitations"
import {
  EDIT_WINDOW_MS,
  PROFILE_THEMES,
  getBalances,
  isSelfPinnedActive,
  isThemeUnlocked,
  isTitleUnlocked,
} from "@/lib/reputation-milestones"

const POST_EDIT_REP = 150

const editPostSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题最多 200 个字符"),
  content: z.string().min(1, "内容不能为空"),
})

/** 获取当前用户（含声望与道具计数），未登录跳转登录页 */
async function getUserRepState() {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      raputation: true,
      pinCardsUsedCount: true,
      anonCardsUsedCount: true,
      inviteQuotaUsed: true,
    },
  })
  if (!user) redirect("/auth/signin")
  return user
}

function usedOf(user: Awaited<ReturnType<typeof getUserRepState>>) {
  return {
    pinCards: user.pinCardsUsedCount,
    anonCards: user.anonCardsUsedCount,
    inviteQuota: user.inviteQuotaUsed,
  }
}

/** 编辑自己的帖子（声望 ≥ 150，发布后 30 分钟内） */
export async function updatePost(_previousState: unknown, formData: FormData) {
  const user = await getUserRepState()
  if (user.role === "BANNED") return { message: "账号已被封禁" }

  const postId = String(formData.get("postId") ?? "")
  const validated = editPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  })
  if (!validated.success) return { message: "标题或内容格式不正确" }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, createdAt: true, category: { select: { slug: true } } },
  })
  if (!post) return { message: "帖子不存在" }
  if (post.authorId !== user.id) return { message: "只能编辑自己的帖子" }
  if (user.raputation < POST_EDIT_REP) return { message: `声望达到 ${POST_EDIT_REP} 才能编辑帖子` }
  if (Date.now() - post.createdAt.getTime() > EDIT_WINDOW_MS) {
    return { message: "发布超过 30 分钟，无法再编辑" }
  }

  await prisma.post.update({
    where: { id: postId },
    data: { title: validated.data.title, content: validated.data.content, editedAt: new Date() },
  })

  revalidatePath(`/post/${postId}`)
  revalidatePath(`/category/${post.category.slug}`)
  revalidatePath("/")
  return { success: true as const }
}

/** 使用一张置顶卡：自己的帖子置顶 24 小时 */
export async function usePinCard(postId: string) {
  const user = await getUserRepState()
  if (user.role === "BANNED") return { message: "账号已被封禁" }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true, selfPinnedAt: true, category: { select: { slug: true } } },
  })
  if (!post) return { message: "帖子不存在" }
  if (post.authorId !== user.id) return { message: "只能置顶自己的帖子" }
  if (isSelfPinnedActive(post.selfPinnedAt)) return { message: "该帖子正在置顶中" }

  const balances = getBalances(user.raputation, user.id, usedOf(user))
  if (balances.pinCards <= 0) return { message: "没有可用的置顶卡" }

  await prisma.$transaction([
    prisma.post.update({
      where: { id: postId },
      data: { selfPinnedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { pinCardsUsedCount: { increment: 1 } },
    }),
  ])

  revalidatePath("/")
  revalidatePath(`/post/${postId}`)
  revalidatePath(`/category/${post.category.slug}`)
  return { success: true as const }
}

/** 用邀请额度铸造 1 枚邀请码 */
export async function mintReputationInviteCode() {
  const user = await getUserRepState()
  if (user.role === "BANNED") return { message: "账号已被封禁" }

  const balances = getBalances(user.raputation, user.id, usedOf(user))
  if (balances.inviteQuota <= 0) return { message: "没有可用的邀请额度" }

  const codes = await mintReputationInviteCodes(user.id, 1)
  await prisma.user.update({
    where: { id: user.id },
    data: { inviteQuotaUsed: { increment: 1 } },
  })

  revalidatePath("/invites")
  revalidatePath("/reputation")
  return { success: true as const, code: codes[0] }
}

/** 装备 / 卸下称号（传空 titleId 表示卸下） */
export async function equipTitle(formData: FormData) {
  const user = await getUserRepState()
  if (user.role === "BANNED") return { message: "账号已被封禁" }

  const titleId = String(formData.get("titleId") ?? "").trim()
  if (!titleId) {
    await prisma.user.update({ where: { id: user.id }, data: { equippedTitle: null } })
    revalidatePath("/profile/settings")
    revalidatePath(`/profile/${user.id}`)
    return { success: true as const }
  }

  if (!isTitleUnlocked(user.raputation, titleId)) return { message: "该称号尚未解锁" }
  await prisma.user.update({ where: { id: user.id }, data: { equippedTitle: titleId } })

  revalidatePath("/profile/settings")
  revalidatePath(`/profile/${user.id}`)
  return { success: true as const }
}

/** 设置主页主题（声望 ≥ 600） */
export async function setProfileTheme(formData: FormData) {
  const user = await getUserRepState()
  if (user.role === "BANNED") return { message: "账号已被封禁" }

  if (!isThemeUnlocked(user.raputation)) return { message: "声望达到 600 才能自定义主页主题" }
  const themeId = String(formData.get("themeId") ?? "").trim()
  if (!PROFILE_THEMES.some((theme) => theme.id === themeId)) return { message: "主题不存在" }

  await prisma.user.update({ where: { id: user.id }, data: { profileTheme: themeId } })

  revalidatePath(`/profile/${user.id}`)
  revalidatePath("/profile/settings")
  return { success: true as const }
}
