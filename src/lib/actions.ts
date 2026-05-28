"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { postSchema, commentSchema, registerSchema, profileSchema } from "@/lib/validations"

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

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
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

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      categoryId,
    },
  })

  revalidatePath("/")
  redirect(`/post/${post.id}`)
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
  })

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "请检查表单填写",
    }
  }

  const { name, bio } = validated.data

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, bio },
  })

  revalidatePath("/profile/" + session.user.id)
  revalidatePath("/profile/settings")
  return { success: true, message: "资料已更新" }
}