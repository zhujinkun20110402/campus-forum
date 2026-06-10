import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { FeedLoader } from "@/components/home/feed-loader"
import { AcademicParticles } from "@/components/effects/academic-particles"
import { MottoStream } from "@/components/effects/motto-stream"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { CountUp } from "@/components/effects/count-up"
import {
  ArrowRight,
  Plus,
  ChevronDown,
  Megaphone,
  Search,
  BookOpen,
  Heart,
  MessageSquare,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryEntries = [
  {
    slug: "announcement",
    name: "校园公告",
    desc: "学生会 & 校园通知",
    icon: Megaphone,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    hoverBorder: "hover:border-amber-400 dark:hover:border-amber-600",
    shadowColor: "group-hover:shadow-amber-100/50 dark:group-hover:shadow-amber-900/20",
  },
  {
    slug: "lostfound",
    name: "寻物启事",
    desc: "失物招领 · 互帮互助",
    icon: Search,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    hoverBorder: "hover:border-emerald-400 dark:hover:border-emerald-600",
    shadowColor: "group-hover:shadow-emerald-100/50 dark:group-hover:shadow-emerald-900/20",
  },
  {
    slug: "study",
    name: "学习交流",
    desc: "学术讨论 · 共同进步",
    icon: BookOpen,
    color: "text-sky-600",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-200 dark:border-sky-800",
    hoverBorder: "hover:border-sky-400 dark:hover:border-sky-600",
    shadowColor: "group-hover:shadow-sky-100/50 dark:group-hover:shadow-sky-900/20",
  },
  {
    slug: "confession",
    name: "表白墙",
    desc: "匿名说出你的心声",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    hoverBorder: "hover:border-rose-400 dark:hover:border-rose-600",
    shadowColor: "group-hover:shadow-rose-100/50 dark:group-hover:shadow-rose-900/20",
    isPage: true,
  },
  {
    slug: "activity",
    name: "校园活动",
    desc: "精彩纷呈 · 不容错过",
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    hoverBorder: "hover:border-purple-400 dark:hover:border-purple-600",
    shadowColor: "group-hover:shadow-purple-100/50 dark:group-hover:shadow-purple-900/20",
  },
  {
    slug: "secondhand",
    name: "二手交易",
    desc: "物尽其用 · 循环利用",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-orange-200 dark:border-orange-800",
    hoverBorder: "hover:border-orange-400 dark:hover:border-orange-600",
    shadowColor: "group-hover:shadow-orange-100/50 dark:group-hover:shadow-orange-900/20",
  },
]

const campusImages = [
  { src: "/images/campus-01.jpg", alt: "教学楼", title: "教学楼" },
  { src: "/images/campus-02.jpg", alt: "图书馆", title: "图书馆" },
  { src: "/images/campus-03.jpg", alt: "操场", title: "操场" },
  { src: "/images/campus-04.jpg", alt: "实验室", title: "实验室" },
  { src: "/images/campus-05.jpg", alt: "校园活动", title: "校园活动" },
  { src: "/images/campus-06.jpg", alt: "校园一角", title: "校园一角" },
]

export default async function HomePage() {
  const session = await auth()

  const [posts, stats, categoryCounts] = await Promise.all([
    prisma.post.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, image: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.$transaction([
      prisma.post.count(),
      prisma.user.count(),
      prisma.comment.count(),
    ]),
    prisma.category.findMany({
      include: {
        _count: { select: { posts: true } },
      },
    }),
  ])

  const [totalPosts, totalUsers, totalComments] = stats

  // Build category count map
  const countMap = new Map(categoryCounts.map((c) => [c.slug, c._count.posts]))

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-800">
        <AcademicParticles />

        {/* Background overlay with subtle texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(79,70,229,0.15),_transparent_50%)]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center">
          {/* School Logo */}
          <ScrollReveal delay={0}>
            <div className="flex justify-center mb-8">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl shadow-indigo-900/50 overflow-hidden">
                <SafeImage
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-3"
                  fallback="二"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* School Name */}
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-wider mb-2">
              北京二中经开区学校
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-lg sm:text-xl text-indigo-200/80 tracking-[0.3em] mb-8">
              校园论坛
            </p>
          </ScrollReveal>

          {/* Motto */}
          <ScrollReveal delay={0.3}>
            <div className="mb-10">
              <MottoStream size="lg" animated={false} />
            </div>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              {session?.user ? (
                <Link
                  href="/post/new"
                  className="group inline-flex items-center gap-2 rounded-full bg-gold-400 hover:bg-gold-300 text-indigo-950 px-8 py-3.5 text-sm font-semibold shadow-lg shadow-gold-400/25 hover:shadow-xl hover:shadow-gold-400/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  发布新帖
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="group inline-flex items-center gap-2 rounded-full bg-gold-400 hover:bg-gold-300 text-indigo-950 px-8 py-3.5 text-sm font-semibold shadow-lg shadow-gold-400/25 hover:shadow-xl hover:shadow-gold-400/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  加入社区
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/10 px-8 py-3.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                浏览帖子
              </Link>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={0.5}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono text-gold-400">
                  <CountUp end={totalPosts} />
                </div>
                <div className="mt-1 text-xs text-indigo-300/70 tracking-wider uppercase">
                  帖子
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono text-gold-400">
                  <CountUp end={totalUsers} />
                </div>
                <div className="mt-1 text-xs text-indigo-300/70 tracking-wider uppercase">
                  成员
                </div>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono text-gold-400">
                  <CountUp end={totalComments} />
                </div>
                <div className="mt-1 text-xs text-indigo-300/70 tracking-wider uppercase">
                  评论
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="h-6 w-6 text-white/30 animate-bounce-subtle" />
        </div>
      </section>

      {/* Motto Bar */}
      <section className="relative bg-gold-50 dark:bg-indigo-900/30 border-y border-gold-200/50 dark:border-indigo-800/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 text-center">
          <ScrollReveal>
            <MottoStream size="md" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              根深则叶茂，本固则枝荣。学识渊博，方能报效国家。
              愿每一位学子在此扎根成长，终成栋梁之材。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Category Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 mb-3">
              探索版块
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              发现你感兴趣的内容，连接志同道合的伙伴
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categoryEntries.map((entry, index) => {
            const Icon = entry.icon
            const href = entry.isPage ? "/confession" : `/category/${entry.slug}`
            const postCount = countMap.get(entry.slug) ?? 0

            return (
              <ScrollReveal key={entry.slug} delay={index * 0.08}>
                <Link href={href} className="group block">
                  <div
                    className={cn(
                      "relative flex items-start gap-5 rounded-2xl border bg-white dark:bg-indigo-900/40 p-6 transition-all duration-400 card-shine",
                      "hover:-translate-y-2 hover:shadow-xl",
                      entry.borderColor,
                      entry.hoverBorder,
                      entry.shadowColor
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                        entry.bgColor
                      )}
                    >
                      <Icon className={cn("h-7 w-7", entry.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif text-lg font-semibold text-slate-800 dark:text-slate-100">
                          {entry.name}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                        {entry.desc}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {postCount} 个帖子
                      </p>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </section>

      {/* Latest Posts */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 mb-1">
                校园新鲜事
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                看看大家都在讨论什么
              </p>
            </div>
            {session?.user ? (
              <Link
                href="/post/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                发帖
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                登录后发帖
              </Link>
            )}
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-indigo-700 py-20 text-center bg-slate-50/50 dark:bg-indigo-900/20">
              <Users className="mx-auto h-12 w-12 text-slate-200 dark:text-indigo-800" />
              <p className="mt-4 text-slate-400 dark:text-slate-500 text-lg font-serif">
                还没有帖子
              </p>
              {session?.user ? (
                <Link
                  href="/post/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2.5 text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  发布第一条帖子
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-700 hover:bg-indigo-800 text-white px-6 py-2.5 text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
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

      {/* Campus Gallery */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl text-slate-800 dark:text-slate-100 mb-3">
              校园风采
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              记录校园生活的每一个精彩瞬间
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {campusImages.map((img, index) => (
            <ScrollReveal key={img.src} delay={index * 0.1}>
              <div className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-indigo-900/50">
                <SafeImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white font-medium text-sm">{img.title}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-800 to-indigo-950 px-8 py-14 sm:px-12 sm:py-20">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gold-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.05),_transparent_70%)]" />

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                <Sparkles className="h-7 w-7 text-gold-400" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white mb-4">
                成为校园故事的一部分
              </h2>
              <p className="text-sm sm:text-base text-indigo-200/70 max-w-md mx-auto mb-8 leading-relaxed">
                与同学们分享学习心得、发布失物招领、参与校园活动，
                让校园生活更加丰富多彩
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {!session?.user && (
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-full bg-gold-400 hover:bg-gold-300 text-indigo-950 px-7 py-3 text-sm font-semibold shadow-lg shadow-gold-400/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    立即注册
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/10 px-7 py-3 text-sm font-medium transition-all duration-300"
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
