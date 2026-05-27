import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {category.name}
      </h1>

      {category.posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">该分类下还没有帖子</p>
        </div>
      ) : (
        <PostList posts={category.posts} />
      )}
    </div>
  )
}