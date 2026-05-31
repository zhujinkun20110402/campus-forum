import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { BookOpen } from "lucide-react"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  if (slug === "problem-discussion") {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-400 mb-6">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-light text-stone-800 dark:text-stone-200">
            难题讨论
          </h1>
          <p className="mt-3 text-stone-500 dark:text-stone-400">
            功能正在建设中，敬请期待
          </p>
          <div className="mt-8">
            <img
              src="/images/construction.svg"
              alt="建设中"
              className="mx-auto h-40 w-40 opacity-50 dark:opacity-30"
            />
          </div>
        </div>
      </div>
    )
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        take: 20,
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
      },
    },
  })

  if (!category) {
    notFound()
  }

  const isConfession = category.slug === "confession"

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-light text-stone-800 dark:text-stone-200 mb-8">
          {category.name}
        </h1>

        {category.posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-lg">
              该分类下还没有帖子
            </p>
          </div>
        ) : isConfession ? (
          <PostList
            posts={category.posts.map((p) => ({
              ...p,
              author: { name: null, image: null },
            }))}
            hideAuthor
          />
        ) : (
          <PostList posts={category.posts} />
        )}
      </div>
    </div>
  )
}