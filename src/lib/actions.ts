"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { postSchema, commentSchema, registerSchema, confessionSchema, profileSchema } from "@/lib/validations"
import { pinPost, unpinPost } from "@/lib/pinned-posts"
import {
  REP_POINTS,
  adjustRaputation,
  hasPostedToday,
} from "@/lib/reputation.server"

async function checkBanned(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  if (user?.role === "BANNED") {
    throw new Error("账号已被封禁")
  }
}

export async function registerUser(
  _prevState: unknown,
  formData: FormData
) {
  const validated = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "请检查表单填写",
    }
  }

  const { name, email, password } = validated.data

  const existingByName = await prisma.user.findFirst({
    where: { name },
  })
  if (existingByName) {
    return { message: "该用户名已被使用" }
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  })
  if (existingByEmail) {
    return { message: "该邮箱已被注册" }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  redirect("/auth/signin?registered=true")
}

export async function createPost(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  await checkBanned(session.user.id)

  const validated = postSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId"),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "请检查表单填写",
    }
  }

  const { title, content, categoryId } = validated.data

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  })

  if (!category) {
    return { message: "分类不存在" }
  }

  if (category.slug === "announcement" && session.user.role !== "ADMIN") {
    return { message: "只有管理员可以发布公告" }
  }

  // 检查是否今日首次发帖（在创建帖子之前检查）
  const isFirstPostToday = !(await hasPostedToday(session.user.id))

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      categoryId,
    },
  })

  // 声望奖励：发帖 +5，每日首次发帖额外 +3
  const repDelta = REP_POINTS.POST_CREATED + (isFirstPostToday ? REP_POINTS.DAILY_FIRST_POST : 0)
  await adjustRaputation(session.user.id, repDelta)

  revalidatePath("/")
  if (category.slug === "confession") {
    redirect("/confession")
  }
  redirect(`/post/${post.id}`)
}

export async function createConfession(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  await checkBanned(session.user.id)

  const validated = confessionSchema.safeParse({
    content: formData.get("content"),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "请检查表单填写",
    }
  }

  const confessionCategory = await prisma.category.findUnique({
    where: { slug: "confession" },
  })

  if (!confessionCategory) {
    return { message: "表白墙分类不存在" }
  }

  const isFirstPostToday = !(await hasPostedToday(session.user.id))

  await prisma.post.create({
    data: {
      title: "匿名表白",
      content: validated.data.content,
      authorId: session.user.id,
      categoryId: confessionCategory.id,
    },
  })

  // 声望奖励：发帖 +5，每日首次发帖额外 +3
  const repDelta = REP_POINTS.POST_CREATED + (isFirstPostToday ? REP_POINTS.DAILY_FIRST_POST : 0)
  await adjustRaputation(session.user.id, repDelta)

  revalidatePath("/confession")
  redirect("/confession")
}

export async function createComment(postId: string, _prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  await checkBanned(session.user.id)

  const validated = commentSchema.safeParse({
    content: formData.get("content"),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "请检查评论内容",
    }
  }

  await prisma.comment.create({
    data: {
      content: validated.data.content,
      postId,
      authorId: session.user.id,
    },
  })

  // 声望奖励：评论 +2
  await adjustRaputation(session.user.id, REP_POINTS.COMMENT_CREATED)

  revalidatePath(`/post/${postId}`)
  return { success: true }
}

export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  await checkBanned(session.user.id)

  const userId = session.user.id

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  // 获取帖子作者 ID（用于声望调整）
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    })
    // 取消点赞：扣除帖子作者的声望
    if (post && post.authorId !== userId) {
      await adjustRaputation(post.authorId, -REP_POINTS.POST_LIKED)
    }
  } else {
    await prisma.like.create({
      data: { postId, userId },
    })
    // 点赞：给帖子作者增加声望（不给自己点赞加分）
    if (post && post.authorId !== userId) {
      await adjustRaputation(post.authorId, REP_POINTS.POST_LIKED)
    }
  }

  revalidatePath(`/post/${postId}`)
  revalidatePath("/confession")
}

export async function deletePost(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })

  if (!post) {
    throw new Error("帖子不存在")
  }

  if (post.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  await prisma.post.delete({ where: { id: postId } })

  // 声望扣除：删帖 -5
  await adjustRaputation(post.authorId, REP_POINTS.POST_DELETED)

  revalidatePath("/")
  revalidatePath("/confession")
  redirect("/")
}

export async function deleteComment(commentId: string, postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } })

  if (!comment) {
    throw new Error("评论不存在")
  }

  if (comment.authorId !== session.user.id && session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  await prisma.comment.delete({ where: { id: commentId } })

  // 声望扣除：删评论 -2
  await adjustRaputation(comment.authorId, REP_POINTS.COMMENT_DELETED)

  revalidatePath(`/post/${postId}`)
}

export async function banUser(userId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "BANNED" },
  })

  // 声望扣除：被封禁 -50
  await adjustRaputation(userId, REP_POINTS.BANNED)

  revalidatePath("/admin")
}

export async function unbanUser(userId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" },
  })

  // 声望恢复：解封 +50
  await adjustRaputation(userId, REP_POINTS.UNBANNED_RESTORE)

  revalidatePath("/admin")
}

export async function updateProfile(_prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const validated = profileSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio"),
    image: formData.get("image"),
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "请检查表单填写",
    }
  }

  const { name, bio, image } = validated.data

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, bio, image: image || null },
  })

  revalidatePath("/profile/" + session.user.id)
  revalidatePath("/profile/settings")
  return { success: true, message: "资料已更新" }
}

export async function getMorePosts(page: number, pageSize = 12) {
  const posts = await prisma.post.findMany({
    skip: page * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
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

  return posts
}

export async function getTrendingPosts() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  return prisma.post.findMany({
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
}

export async function getPinnedPosts() {
  const posts = await prisma.post.findMany({
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
  return posts
}

export async function togglePinPost(postId: string, pinned: boolean) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  // 获取帖子作者 ID（用于声望调整）
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  })

  if (!post) {
    throw new Error("帖子不存在")
  }

  if (pinned) {
    await unpinPost(postId)
    // 取消置顶：扣除声望
    await adjustRaputation(post.authorId, -REP_POINTS.POST_PINNED)
  } else {
    await pinPost(postId)
    // 置顶：奖励声望
    await adjustRaputation(post.authorId, REP_POINTS.POST_PINNED)
  }

  revalidatePath("/")
  revalidatePath("/search")
  revalidatePath(`/post/${postId}`)
}

/**
 * 管理员手动调整用户声望
 */
export async function adjustUserRaputation(userId: string, delta: number) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  await adjustRaputation(userId, delta)

  revalidatePath("/admin")
  revalidatePath(`/profile/${userId}`)
}