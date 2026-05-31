import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { ConfessionForm } from "@/components/confession/confession-form"
import { Heart, MessageCircle } from "lucide-react"

export default async function ConfessionPage() {
  const session = await auth()

  const posts = await prisma.post.findMany({
    where: {
      category: {
        slug: "confession",
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
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
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/50 via-stone-50 to-white dark:from-rose-950/20 dark:via-stone-950 dark:to-stone-950">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-10"
          style={{
            backgroundImage: "url('/images/confession-bg.jpg')",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 mb-4">
              <Heart className="h-7 w-7" />
            </div>
            <h1 className="text-3xl font-light tracking-tight text-stone-800 dark:text-stone-200 sm:text-4xl">
              表白墙
            </h1>
            <p className="mt-3 text-base text-stone-500 dark:text-stone-400">
              匿名说出你的心声
            </p>
            <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
              所有内容均为匿名发布，请保持友善与尊重
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 pb-16">
        {session?.user ? (
          <div className="mb-8">
            <ConfessionForm />
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-8 text-center">
            <MessageCircle className="mx-auto h-6 w-6 text-stone-300 dark:text-stone-600" />
            <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
              登录后即可匿名表白
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
            最新表白
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
            <Heart className="mx-auto h-10 w-10 text-stone-200 dark:text-stone-700" />
            <p className="mt-4 text-stone-400 dark:text-stone-500">
              还没有表白，来做第一个勇敢的人吧
            </p>
          </div>
        ) : (
          <PostList
            posts={posts.map((p) => ({
              ...p,
              author: { name: null, image: null },
            }))}
            hideAuthor
          />
        )}
      </div>
    </div>
  )
}