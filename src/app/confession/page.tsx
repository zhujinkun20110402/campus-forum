import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { ConfessionForm } from "@/components/confession/confession-form"
import { AcademicParticles } from "@/components/effects/academic-particles"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { MottoStream } from "@/components/effects/motto-stream"
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
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50/90 via-slate-50 to-white dark:from-rose-950/20 dark:via-indigo-950 dark:to-indigo-950">
        <AcademicParticles />

        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,29,72,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/80 dark:to-indigo-950/80" />

        <div className="relative mx-auto max-w-3xl px-4 py-20 sm:py-28">
          <div className="text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 dark:border-rose-800/60 bg-rose-50/80 dark:bg-rose-950/30 backdrop-blur-sm px-4 py-1.5 mb-8">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  匿名 · 真诚 · 温暖
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/60 dark:to-pink-950/40 text-rose-500 dark:text-rose-400 mb-6 shadow-lg shadow-rose-200/50 dark:shadow-rose-900/20 animate-pulse-soft">
                <Heart className="h-8 w-8" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 sm:text-5xl mb-4">
                表白墙
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-2">
                匿名说出你的心声。在这里，每一份真诚都值得被温柔以待。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <p className="text-xs text-slate-400 dark:text-slate-500">
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
            <div className="mb-10 rounded-2xl border border-dashed border-slate-300 dark:border-indigo-700 py-10 text-center bg-white/70 dark:bg-indigo-900/30 backdrop-blur-sm">
              <MessageCircle className="mx-auto h-8 w-8 text-slate-300 dark:text-indigo-700" />
              <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
                登录后即可匿名表白
              </p>
            </div>
          )}
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/40">
              <Heart className="h-4 w-4 text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-slate-800 dark:text-slate-100">
                最新表白
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {posts.length} 条匿名心声
              </p>
            </div>
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal delay={0.2}>
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-indigo-700 py-20 text-center bg-slate-50/50 dark:bg-indigo-900/20">
              <Heart className="mx-auto h-12 w-12 text-slate-200 dark:text-indigo-800" />
              <p className="mt-4 text-slate-400 dark:text-slate-500 text-lg font-serif">
                还没有表白，来做第一个勇敢的人吧
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <PostList
            posts={posts.map((p) => ({
              ...p,
              author: { id: "anonymous", name: null, image: null },
            }))}
            hideAuthor
          />
        )}
      </div>
    </div>
  )
}
