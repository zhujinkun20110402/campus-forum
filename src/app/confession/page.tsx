import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { ConfessionForm } from "@/components/confession/confession-form"
import { FloatingParticles } from "@/components/effects/floating-particles"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { Heart, MessageCircle, Sparkles } from "lucide-react"

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
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50/80 via-stone-50 to-white dark:from-rose-950/30 dark:via-stone-950 dark:to-stone-900">
        <FloatingParticles />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-8"
          style={{
            backgroundImage: "url('/images/confession-bg.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-50/80 dark:to-stone-950/80" />

        <div className="relative mx-auto max-w-3xl px-4 py-20 sm:py-24">
          <div className="text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-800 bg-rose-50/60 dark:bg-rose-950/40 backdrop-blur-sm px-4 py-1.5 mb-8">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  匿名 · 真诚 · 温暖
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/60 dark:to-pink-950/40 text-rose-500 dark:text-rose-400 mb-6 shadow-lg shadow-rose-200/50 dark:shadow-rose-900/20">
                <Heart className="h-8 w-8" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <h1 className="text-4xl font-light tracking-tight text-stone-800 dark:text-stone-200 sm:text-5xl">
                表白墙
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <p className="mt-4 text-base text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                匿名说出你的心声。在这里，每一份真诚都值得被看见。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                所有内容均为匿名发布，请保持友善与尊重
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 pb-16 -mt-4">
        <ScrollReveal>
          {session?.user ? (
            <div className="mb-10">
              <ConfessionForm />
            </div>
          ) : (
            <div className="mb-10 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-10 text-center bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
              <MessageCircle className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
              <p className="mt-3 text-sm text-stone-400 dark:text-stone-500">
                登录后即可匿名表白
              </p>
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40">
              <Heart className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
                最新表白
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {posts.length} 条匿名心声
              </p>
            </div>
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal delay={200}>
            <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
              <Heart className="mx-auto h-12 w-12 text-stone-200 dark:text-stone-700" />
              <p className="mt-4 text-stone-400 dark:text-stone-500 text-lg">
                还没有表白，来做第一个勇敢的人吧
              </p>
            </div>
          </ScrollReveal>
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
