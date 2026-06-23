import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { Search, Sparkles, BookOpen } from "lucide-react"

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
    author: { id: string; name: string | null; image: string | null }
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
          select: { id: true, name: true, image: true, role: true },
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
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0a0a]">
      {/* Header */}
      <section className="relative overflow-hidden bg-stone-900 pt-28 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <Search className="h-6 w-6 text-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                搜索帖子
              </h1>
              <p className="text-sm text-stone-400">
                发现校园里的精彩讨论
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Search Form & Results */}
      <div className="relative -mt-6 mx-auto max-w-2xl px-4 sm:px-6 pb-20">
        <ScrollReveal>
          <div className="rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-black/20 p-5 sm:p-8">
            <form className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 dark:text-stone-500" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="输入关键词搜索帖子..."
                  className="w-full rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#0f0f0f] px-5 py-4 pl-12 text-sm text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-amber-400 dark:focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-900/30 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 sm:px-5 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 text-sm font-medium transition-colors"
                >
                  搜索
                </button>
              </div>
            </form>

            {q && q.trim().length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    搜索 <span className="font-medium text-stone-800 dark:text-stone-100">&quot;{q}&quot;</span> 的结果
                  </p>
                  <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                    {posts?.length ?? 0} 条结果
                  </span>
                </div>
                {posts && posts.length > 0 ? (
                  <PostList posts={posts} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700 mb-4" />
                    <p className="text-stone-500 dark:text-stone-400 text-lg font-medium mb-1">
                      没有找到相关帖子
                    </p>
                    <p className="text-sm text-stone-400 dark:text-stone-500">
                      试试其他关键词，或者发布一个新帖子
                    </p>
                  </div>
                )}
              </>
            )}

            {(!q || q.trim().length === 0) && (
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
                <Search className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700 mb-4" />
                <p className="text-stone-500 dark:text-stone-400 text-lg font-medium mb-1">
                  开始搜索
                </p>
                <p className="text-sm text-stone-400 dark:text-stone-500">
                  输入关键词，发现校园精彩讨论
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
