import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    prisma.post.findMany({
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
    }),
    prisma.category.findMany(),
  ])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-blue-600 text-white border-blue-600 shrink-0"
        >
          全部
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-100 shrink-0 transition-colors"
          >
            {category.name}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">
            还没有帖子，快来发布第一条吧！
          </p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </div>
  )
}