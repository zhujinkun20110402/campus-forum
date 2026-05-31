import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { Search } from "lucide-react"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  let posts: {
    id: string
    title: string
    content: string
    author: { name: string | null; image: string | null }
    category: { name: string; slug: string }
    _count: { comments: number; likes: number }
    createdAt: Date | string
  }[] | null = null

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <form className="mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="搜索帖子..."
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-4 py-3 pl-10 text-sm text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-800"
          />
        </div>
      </form>

      {q && q.trim().length > 0 && (
        <>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            搜索 &quot;{q}&quot; 的结果：{posts?.length ?? 0} 条
          </p>
          {posts && posts.length > 0 ? (
            <PostList posts={posts} />
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
              <p className="text-stone-400 dark:text-stone-500 text-lg">
                没有找到相关帖子
              </p>
            </div>
          )}
        </>
      )}

      {(!q || q.trim().length === 0) && (
        <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
          <Search className="mx-auto h-10 w-10 text-stone-200 dark:text-stone-700" />
          <p className="mt-4 text-stone-400 dark:text-stone-500">
            输入关键词搜索帖子
          </p>
        </div>
      )}
    </div>
  )
}