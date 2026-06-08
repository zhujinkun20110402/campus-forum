import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FeedLoader } from "@/components/home/feed-loader"
import { EntryTiles } from "@/components/home/entry-tiles"
import { FloatingParticles } from "@/components/effects/floating-particles"
import { TypewriterText } from "@/components/effects/typewriter-text"
import { MarqueeBanner } from "@/components/effects/marquee-banner"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { TrendingUp, Users, MessageSquare, Sparkles, ArrowRight, Plus } from "lucide-react"

export default async function HomePage() {
  const session = await auth()

  const [posts, stats] = await Promise.all([
    prisma.post.findMany({
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
    }),
    prisma.$transaction([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
    ]),
  ])

  const [totalPosts, totalUsers, totalComments] = stats

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-white dark:from-stone-900 dark:via-stone-950 dark:to-stone-900">
        <FloatingParticles />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 dark:opacity-5"
          style={{ backgroundImage: "url('/images/home-hero.jpg')" }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28 lg:py-32">
          <div className="text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm px-4 py-1.5 mb-8">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  北京二中经开区学校 · 校园论坛
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="text-4xl font-light tracking-tight text-stone-800 dark:text-stone-200 sm:text-5xl lg:text-6xl">
                连接每一个
                <span className="relative inline-block mx-2">
                  <span className="relative z-10 font-medium text-stone-900 dark:text-stone-100">
                    校园故事
                  </span>
                  <span className="absolute bottom-1 left-0 right-0 h-3 bg-amber-200/60 dark:bg-amber-800/40 -z-0 rounded-sm" />
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="mt-6 h-8 flex items-center justify-center">
                <TypewriterText
                  texts={["学习交流", "失物招领", "匿名表白", "校园公告", "难题讨论"]}
                  speed={100}
                  pause={1500}
                  className="text-lg text-stone-500 dark:text-stone-400 font-light"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
                <div className="text-center">
                  <div className="text-3xl font-light text-stone-800 dark:text-stone-200">
                    {totalPosts}
                  </div>
                  <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 tracking-wide">
                    帖子
                  </div>
                </div>
                <div className="h-10 w-px bg-stone-200 dark:bg-stone-700" />
                <div className="text-center">
                  <div className="text-3xl font-light text-stone-800 dark:text-stone-200">
                    {totalUsers}
                  </div>
                  <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 tracking-wide">
                    成员
                  </div>
                </div>
                <div className="h-10 w-px bg-stone-200 dark:bg-stone-700" />
                <div className="text-center">
                  <div className="text-3xl font-light text-stone-800 dark:text-stone-200">
                    {totalComments}
                  </div>
                  <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 tracking-wide">
                    评论
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <div className="mt-10 flex items-center justify-center gap-4">
                {session?.user ? (
                  <Link
                    href="/post/new"
                    className="group inline-flex items-center gap-2 rounded-full bg-stone-800 dark:bg-stone-200 px-7 py-3 text-sm font-medium text-white dark:text-stone-800 shadow-lg shadow-stone-800/20 dark:shadow-stone-200/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Plus className="h-4 w-4" />
                    发布新帖
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="group inline-flex items-center gap-2 rounded-full bg-stone-800 dark:bg-stone-200 px-7 py-3 text-sm font-medium text-white dark:text-stone-800 shadow-lg shadow-stone-800/20 dark:shadow-stone-200/20 transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    加入社区
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                )}
                <Link
                  href="/confession"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 dark:border-stone-600 px-7 py-3 text-sm font-medium text-stone-600 dark:text-stone-400 transition-all hover:bg-stone-50 dark:hover:bg-stone-800 hover:-translate-y-0.5"
                >
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  表白墙
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="border-y border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 py-3">
        <MarqueeBanner
          items={[
            "校园公告实时更新",
            "失物招领互帮互助",
            "匿名表白说出心声",
            "学习交流共同进步",
            "二手交易物尽其用",
            "校园活动精彩纷呈",
          ]}
          speed={25}
          className="text-stone-400 dark:text-stone-500"
        />
      </div>

      {/* Entry Tiles */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <ScrollReveal>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
              <TrendingUp className="h-4 w-4 text-stone-600 dark:text-stone-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
                探索版块
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                发现你感兴趣的内容
              </p>
            </div>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <EntryTiles />
        </ScrollReveal>
      </section>

      {/* Hot Topics Preview */}
      <section className="mx-auto max-w-5xl px-4 pb-8">
        <ScrollReveal>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                <MessageSquare className="h-4 w-4 text-stone-600 dark:text-stone-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-stone-800 dark:text-stone-200">
                  最新动态
                </h2>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  看看大家都在讨论什么
                </p>
              </div>
            </div>
            {session?.user ? (
              <Link
                href="/post/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
                发帖
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
              >
                登录后发帖
              </Link>
            )}
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center">
              <Users className="mx-auto h-12 w-12 text-stone-200 dark:text-stone-700" />
              <p className="mt-4 text-stone-400 dark:text-stone-500 text-lg">
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
          </ScrollReveal>
        ) : (
          <FeedLoader initialPosts={posts} />
        )}
      </section>

      {/* Community CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-700 dark:to-stone-800 px-8 py-12 sm:px-12 sm:py-16">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-stone-600/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-stone-500/10 blur-3xl" />
            <div className="relative flex flex-col items-center text-center">
              <Sparkles className="h-8 w-8 text-amber-400 mb-4" />
              <h2 className="text-2xl font-light text-white sm:text-3xl">
                加入我们的校园社区
              </h2>
              <p className="mt-3 text-sm text-stone-300 max-w-md">
                与同学们分享学习心得、发布失物招领、参与校园活动，让校园生活更加丰富多彩
              </p>
              <div className="mt-8 flex items-center gap-4">
                {!session?.user && (
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-medium text-stone-800 transition-all hover:bg-stone-100 hover:shadow-lg"
                  >
                    立即注册
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-full border border-stone-600 px-6 py-2.5 text-sm font-medium text-stone-300 transition-all hover:bg-stone-700/50"
                >
                  搜索帖子
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  )
}
