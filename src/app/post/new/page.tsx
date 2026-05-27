import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PostForm } from "@/components/post/post-form"

export default async function NewPostPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const categories = await prisma.category.findMany()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">发布新帖子</h1>
      <PostForm categories={categories} />
    </div>
  )
}