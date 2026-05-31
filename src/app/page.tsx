import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FeedLoader } from "@/components/home/feed-loader"
import { EntryTiles } from "@/components/home/entry-tiles"
import { Plus } from "lucide-react"

export default async function HomePage() {
  const session = await auth()

  const posts = await prisma.post.findMany({
    take: 12,
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

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-stone-50 dark:bg-stone-900/50">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
          style={{
            backgroundImage: "url('/images/home-hero.jpg')",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-3xl font-light tracking-tight text-stone-800 dark:text-stone-200 sm:text-4xl">
              北京二中经开区学校
            </h1>
            <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
              一个安静、温暖的校园社区
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 -mt-8 relative z-10 pb-4">
        <EntryTiles />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            最新动态
          </h2>
          {session?.user ? (
            <Link
              href="/post/new"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              发帖
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              登录后发帖
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
            <p className="text-stone-400 dark:text-stone-500 text-lg">
              还没有帖子
            </p>
            {session?.user ? (
              <Link
                href="/post/new"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-800 dark:bg-stone-200 px-5 py-2 text-sm font-medium text-white dark:text-stone-800 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
              >
                发布第一条帖子
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-800 dark:bg-stone-200 px-5 py-2 text-sm font-medium text-white dark:text-stone-800 hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
              >
                登录后发帖
              </Link>
            )}
          </div>
        ) : (
          <FeedLoader initialPosts={posts} />
        )}
      </div>
    </div>
  )
}