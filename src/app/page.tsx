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
  Users,
  TrendingUp,
  Sparkles,
  MapPin,
  Compass,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryEntries = [
  {
    slug: "announcement",
    name: "校园公告",
    desc: "学生会 & 校园通知",
    icon: Megaphone,
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    darkBgColor: "dark:bg-amber-950/20",
    borderColor: "border-amber-200/80",
    darkBorderColor: "dark:border-amber-800/40",
    hoverBorder: "hover:border-amber-400",
    darkHoverBorder: "dark:hover:border-amber-600",
  },
  {
    slug: "lostfound",
    name: "寻物启事",
    desc: "失物招领 · 互帮互助",
    icon: Search,
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    darkBgColor: "dark:bg-emerald-950/20",
    borderColor: "border-emerald-200/80",
    darkBorderColor: "dark:border-emerald-800/40",
    hoverBorder: "hover:border-emerald-400",
    darkHoverBorder: "dark:hover:border-emerald-600",
  },
  {
    slug: "study",
    name: "学习交流",
    desc: "学术讨论 · 共同进步",
    icon: BookOpen,
    color: "text-sky-700",
    bgColor: "bg-sky-50",
    darkBgColor: "dark:bg-sky-950/20",
    borderColor: "border-sky-200/80",
    darkBorderColor: "dark:border-sky-800/40",
    hoverBorder: "hover:border-sky-400",
    darkHoverBorder: "dark:hover:border-sky-600",
  },
  {
    slug: "confession",
    name: "表白墙",
    desc: "匿名说出你的心声",
    icon: Heart,
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    darkBgColor: "dark:bg-rose-950/20",
    borderColor: "border-rose-200/80",
    darkBorderColor: "dark:border-rose-800/40",
    hoverBorder: "hover:border-rose-400",
    darkHoverBorder: "dark:hover:border-rose-600",
    isPage: true,
  },
  {
    slug: "activity",
    name: "校园活动",
    desc: "精彩纷呈 · 不容错过",
    icon: Sparkles,
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    darkBgColor: "dark:bg-violet-950/20",
    borderColor: "border-violet-200/80",
    darkBorderColor: "dark:border-violet-800/40",
    hoverBorder: "hover:border-violet-400",
    darkHoverBorder: "dark:hover:border-violet-600",
  },
  {
    slug: "secondhand",
    name: "二手交易",
    desc: "物尽其用 · 循环利用",
    icon: TrendingUp,
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    darkBgColor: "dark:bg-orange-950/20",
    borderColor: "border-orange-200/80",
    darkBorderColor: "dark:border-orange-800/40",
    hoverBorder: "hover:border-orange-400",
    darkHoverBorder: "dark:hover:border-orange-600",
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

// 噪点纹理 SVG data URL
const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default async function HomePage() {
  const session = await auth()

  const [posts, stats, categoryCounts] = await Promise.all([
    prisma.post.findMany({
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true } },
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
  const countMap = new Map(categoryCounts.map((c) => [c.slug, c._count.posts]))

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: noiseSvg }}
        />

        {/* Soft gold glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#d4af37]/[0.04] blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#8b7355]/[0.03] blur-[100px]" />

        <AcademicParticles />

        <div className="relative z-10 mx-auto max-w-5xl px-4 py-32 text-center">
          {/* 校徽 */}
          <ScrollReveal delay={0}>
            <div className="flex justify-center mb-8">
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] shadow-2xl overflow-hidden">
                <SafeImage
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-3"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* 学校名 */}
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-[0.12em] mb-3">
              北京二中经开区学校
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="text-base sm:text-lg text-white/30 tracking-[0.4em] uppercase mb-10">
              校园论坛
            </p>
          </ScrollReveal>

          {/* 校训 */}
          <ScrollReveal delay={0.3}>
            <div className="mb-12">
              <MottoStream size="lg" animated={false} />
            </div>
          </ScrollReveal>

          {/* 装饰线 */}
          <ScrollReveal delay={0.35}>
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="h-px w-12 bg-white/10" />
              <div className="h-1 w-1 rounded-full bg-[#d4af37]/40" />
              <div className="h-px w-12 bg-white/10" />
            </div>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
              {session?.user ? (
                <Link
                  href="/post/new"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#d4af37] hover:bg-[#e6c65c] text-[#0a0a0a] px-8 py-3.5 text-sm font-semibold shadow-lg shadow-[#d4af37]/10 hover:shadow-xl hover:shadow-[#d4af37]/15 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Plus className="h-4 w-4" />
                  发布新帖
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#d4af37] hover:bg-[#e6c65c] text-[#0a0a0a] px-8 py-3.5 text-sm font-semibold shadow-lg shadow-[#d4af37]/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  加入社区
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-white/50 hover:text-white/80 hover:bg-white/[0.06] hover:border-white/[0.15] px-8 py-3.5 text-sm font-medium transition-all duration-300"
              >
                <Compass className="h-4 w-4" />
                浏览帖子
              </Link>
            </div>
          </ScrollReveal>

          {/* 统计数据 */}
          <ScrollReveal delay={0.5}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono text-[#d4af37]">
                  <CountUp end={totalPosts} />
                </div>
                <div className="mt-1 text-[10px] text-white/25 tracking-[0.2em] uppercase">
                  帖子
                </div>
              </div>
              <div className="h-10 w-px bg-white/[0.06]" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono text-[#d4af37]">
                  <CountUp end={totalUsers} />
                </div>
                <div className="mt-1 text-[10px] text-white/25 tracking-[0.2em] uppercase">
                  成员
                </div>
              </div>
              <div className="h-10 w-px bg-white/[0.06]" />
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-mono text-[#d4af37]">
                  <CountUp end={totalComments} />
                </div>
                <div className="mt-1 text-[10px] text-white/25 tracking-[0.2em] uppercase">
                  评论
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="h-5 w-5 text-white/15 animate-bounce-subtle" />
        </div>
      </section>

      {/* ===== MOTTO BAR ===== */}
      <section className="relative bg-[#f5f2ed] dark:bg-[#111111] border-y border-[#e8e4dc] dark:border-[#1c1c1c]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-18 text-center">
          <ScrollReveal>
            <MottoStream size="md" />
            <p className="mt-5 text-sm text-[#78716c] dark:text-[#737373] max-w-lg mx-auto leading-[1.8] tracking-wide">
              根深则叶茂，本固则枝荣。学识渊博，方能报效国家。
              愿每一位学子在此扎根成长，终成栋梁之材。
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== CATEGORY GRID ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] text-[#a8a29e] dark:text-[#525252] tracking-[0.25em] uppercase mb-2">
                Explore
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1c1917] dark:text-[#e8e6e3]">
                探索版块
              </h2>
            </div>
            <p className="hidden sm:block text-sm text-[#a8a29e] dark:text-[#525252]">
              发现你感兴趣的内容
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryEntries.map((entry, index) => {
            const Icon = entry.icon
            const href = entry.isPage ? "/confession" : `/category/${entry.slug}`
            const postCount = countMap.get(entry.slug) ?? 0

            return (
              <ScrollReveal key={entry.slug} delay={index * 0.06}>
                <Link href={href} className="group block">
                  <div
                    className={cn(
                      "relative flex items-start gap-5 rounded-2xl border bg-white dark:bg-[#141414] p-6 transition-all duration-500",
                      "hover:-translate-y-1 hover:shadow-lg",
                      entry.borderColor,
                      entry.darkBorderColor,
                      entry.hoverBorder,
                      entry.darkHoverBorder
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
                        entry.bgColor,
                        entry.darkBgColor
                      )}
                    >
                      <Icon className={cn("h-5 w-5", entry.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-serif text-base font-semibold text-[#1c1917] dark:text-[#e8e6e3]">
                          {entry.name}
                        </h3>
                        <ArrowRight className="h-4 w-4 text-[#d6d3d1] dark:text-[#404040] opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
                      </div>
                      <p className="text-sm text-[#a8a29e] dark:text-[#737373] mb-2">
                        {entry.desc}
                      </p>
                      <p className="text-[11px] text-[#d6d3d1] dark:text-[#525252] tracking-wide">
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

      {/* ===== LATEST POSTS ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] text-[#a8a29e] dark:text-[#525252] tracking-[0.25em] uppercase mb-2">
                Latest
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1c1917] dark:text-[#e8e6e3]">
                校园新鲜事
              </h2>
            </div>
            {session?.user ? (
              <Link
                href="/post/new"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#78716c] dark:text-[#a3a3a3] hover:text-[#d4af37] transition-colors"
              >
                <Plus className="h-4 w-4" />
                发帖
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm text-[#a8a29e] dark:text-[#525252] hover:text-[#78716c] dark:hover:text-[#a3a3a3] transition-colors"
              >
                登录后发帖
              </Link>
            )}
          </div>
        </ScrollReveal>

        {posts.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-2xl border border-dashed border-[#e7e5e4] dark:border-[#262626] py-20 text-center bg-[#faf9f7] dark:bg-[#0f0f0f]">
              <Users className="mx-auto h-10 w-10 text-[#e7e5e4] dark:text-[#262626]" />
              <p className="mt-4 text-[#a8a29e] dark:text-[#525252] text-lg font-serif">
                还没有帖子
              </p>
              {session?.user ? (
                <Link
                  href="/post/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1c1917] dark:bg-[#d4af37] text-white dark:text-[#0a0a0a] px-6 py-2.5 text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Plus className="h-4 w-4" />
                  发布第一条帖子
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1c1917] dark:bg-[#d4af37] text-white dark:text-[#0a0a0a] px-6 py-2.5 text-sm font-medium transition-all"
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

      {/* ===== CAMPUS GALLERY ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] text-[#a8a29e] dark:text-[#525252] tracking-[0.25em] uppercase mb-2">
                Gallery
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1c1917] dark:text-[#e8e6e3]">
                校园风采
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#a8a29e] dark:text-[#525252]">
              <MapPin className="h-3 w-3" />
              北京二中经开区学校
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {campusImages.map((img, index) => (
            <ScrollReveal key={img.src} delay={index * 0.08}>
              <div className={cn(
                "group relative overflow-hidden rounded-xl bg-[#f0eeeb] dark:bg-[#1c1c1c]",
                index === 0 ? "aspect-[4/3] md:col-span-2 md:row-span-2" : "aspect-[4/3]"
              )}>
                <SafeImage
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white font-medium text-sm">{img.title}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#141414] dark:bg-[#111111] border border-[#1c1c1c] px-8 py-14 sm:px-12 sm:py-20">
            {/* 装饰纹理 */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: noiseSvg }}
            />
            {/* 金色光晕 */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#d4af37]/[0.04] blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#d4af37]/[0.03] blur-3xl" />

            <div className="relative text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/10 mb-6">
                <Sparkles className="h-5 w-5 text-[#d4af37]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white mb-4 tracking-wide">
                成为校园故事的一部分
              </h2>
              <p className="text-sm sm:text-base text-white/30 max-w-md mx-auto mb-8 leading-relaxed">
                与同学们分享学习心得、发布失物招领、参与校园活动，
                让校园生活更加丰富多彩
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {!session?.user && (
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] hover:bg-[#e6c65c] text-[#0a0a0a] px-7 py-3 text-sm font-semibold shadow-lg shadow-[#d4af37]/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    立即注册
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] text-white/40 hover:text-white/70 hover:bg-white/[0.04] hover:border-white/[0.12] px-7 py-3 text-sm font-medium transition-all duration-300"
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
