import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PostForm } from "@/components/post/post-form"

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const { category: categorySlug } = await searchParams
  const isAdmin = session.user.role === "ADMIN"

  const allCategories = await prisma.category.findMany()

  const categories = allCategories.filter((cat) => {
    if (cat.slug === "confession") return false
    if (cat.slug === "announcement" && !isAdmin) return false
    if (cat.slug === "lostfound" && !categorySlug) return false
    if (categorySlug === "lostfound" && cat.slug !== "lostfound") return false
    return true
  })

  const isLostFound = categorySlug === "lostfound"

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-light text-stone-800 dark:text-stone-200 mb-8">
        {isLostFound ? "发布寻物启事" : "发布新帖子"}
      </h1>
      <PostForm categories={categories} />
    </div>
  )
}