import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  let posts = null

  if (q && q.trim().length > 0) {
    posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
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
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <form className="mb-8">
        <div className="relative">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="搜索帖子..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </form>

      {q && q.trim().length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            搜索 &quot;{q}&quot; 的结果：{posts?.length ?? 0} 条
          </p>
          {posts && posts.length > 0 ? (
            <PostList posts={posts} />
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">没有找到相关帖子</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}