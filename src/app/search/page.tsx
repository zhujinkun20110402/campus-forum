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
    <div className="min-h-screen bg-slate-50 dark:bg-indigo-950">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-28 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 mb-4 shadow-lg shadow-gold-500/20">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                搜索帖子
              </h1>
              <p className="text-sm text-indigo-300/50">
                发现校园里的精彩讨论
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Search Form & Results */}
      <div className="relative -mt-6 mx-auto max-w-2xl px-4 sm:px-6 pb-20">
        <ScrollReveal>
          <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-xl shadow-slate-200/20 dark:shadow-indigo-950/30 p-6 sm:p-8">
            <form className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-indigo-400" />
                <input
                  type="search"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="输入关键词搜索帖子..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-indigo-800/60 bg-slate-50 dark:bg-indigo-950/50 px-5 py-4 pl-12 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-indigo-400/50 focus:border-indigo-400 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800/50 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-sm font-medium transition-colors shadow-md shadow-indigo-700/20"
                >
                  搜索
                </button>
              </div>
            </form>

            {q && q.trim().length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-4 w-4 text-gold-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    搜索 <span className="font-medium text-slate-800 dark:text-slate-100">&quot;{q}&quot;</span> 的结果
                  </p>
                  <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                    {posts?.length ?? 0} 条结果
                  </span>
                </div>
                {posts && posts.length > 0 ? (
                  <PostList posts={posts} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 dark:border-indigo-700/50 py-20 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-indigo-700 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-1">
                      没有找到相关帖子
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      试试其他关键词，或者发布一个新帖子
                    </p>
                  </div>
                )}
              </>
            )}

            {(!q || q.trim().length === 0) && (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-indigo-700/50 py-20 text-center">
                <Search className="mx-auto h-12 w-12 text-slate-300 dark:text-indigo-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-1">
                  开始搜索
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
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
