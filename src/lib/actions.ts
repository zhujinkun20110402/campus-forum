"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { postSchema, commentSchema, registerSchema, confessionSchema, profileSchema } from "@/lib/validations"

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

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      categoryId,
    },
  })

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

  const post = await prisma.post.create({
    data: {
      title: "匿名表白",
      content: validated.data.content,
      authorId: session.user.id,
      categoryId: confessionCategory.id,
    },
  })

  revalidatePath("/confession")
  redirect("/confession")
}

export async function createComment(postId: string, _prevState: unknown, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

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

  revalidatePath(`/post/${postId}`)
  return { success: true }
}

export async function toggleLike(postId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const userId = session.user.id

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id },
    })
  } else {
    await prisma.like.create({
      data: { postId, userId },
    })
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
  revalidatePath(`/post/${postId}`)
}

export async function banUser(userId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("没有权限")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "USER" },
  })

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
        select: { name: true, image: true },
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