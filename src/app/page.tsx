import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Camera,
  ChevronDown,
  Compass,
  Heart,
  LockKeyhole,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquareWarning,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  TicketCheck,
  ShieldCheck,
  Users,
} from "lucide-react"
import { ActiveUsers } from "@/components/home/active-users"
import { FeedLoader } from "@/components/home/feed-loader"
import { PinnedPosts } from "@/components/home/pinned-posts"
import { TrendingPosts } from "@/components/home/trending-posts"
import { CountUp } from "@/components/effects/count-up"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { SafeImage } from "@/components/ui/safe-image"
import { auth } from "@/lib/auth"
import { getPinnedPosts, getTrendingPosts } from "@/lib/actions"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"

const categoryEntries = [
  {
    slug: "announcement",
    name: "校园公告",
    desc: "重要通知、学生会动态",
    english: "NOTICE",
    icon: Megaphone,
    surface: "bg-[#ff6b43]",
  },
  {
    slug: "lostfound",
    name: "寻物启事",
    desc: "失物招领、同学互助",
    english: "FOUND",
    icon: Search,
    surface: "bg-[#d9ef61]",
  },
  {
    slug: "study",
    name: "学习交流",
    desc: "问题讨论、资料分享",
    english: "STUDY",
    icon: BookOpen,
    surface: "bg-[#f3c84b]",
  },
  {
    slug: "confession",
    name: "表白墙",
    desc: "匿名写下此刻心声",
    english: "VOICE",
    icon: Heart,
    surface: "bg-[#ffb4aa]",
    isPage: true,
  },
  {
    slug: "activity",
    name: "校园活动",
    desc: "社团、比赛与招募",
    english: "EVENT",
    icon: Sparkles,
    surface: "bg-[#b9ddbd]",
  },
  {
    slug: "secondhand",
    name: "二手交易",
    desc: "闲置流转、物尽其用",
    english: "MARKET",
    icon: TrendingUp,
    surface: "bg-[#f2eadc]",
  },
  {
    slug: "feedback",
    name: "问题反馈",
    desc: "问题提交、建议与改进",
    english: "FEEDBACK",
    icon: MessageSquareWarning,
    surface: "bg-[#c8d7ef]",
  },
]

const campusImages = [
  {
    src: "/images/campus-02.jpg",
    alt: "校园图书馆",
    title: "放学后的图书馆",
    meta: "AFTER CLASS / 01",
    layout: "col-span-12 lg:col-span-7",
    ratio: "aspect-[16/10]",
  },
  {
    src: "/images/campus-03.jpg",
    alt: "校园操场",
    title: "今天也要跑起来",
    meta: "RUNNING TRACK / 02",
    layout: "col-span-6 lg:col-span-5",
    ratio: "aspect-[4/3] lg:aspect-[10/9]",
  },
  {
    src: "/images/campus-04.jpg",
    alt: "校园实验室",
    title: "好奇心发生的地方",
    meta: "LAB / 03",
    layout: "col-span-6 lg:col-span-5",
    ratio: "aspect-[4/3]",
  },
  {
    src: "/images/campus-05.jpg",
    alt: "校园活动",
    title: "热闹是青春的注脚",
    meta: "CLUB DAY / 04",
    layout: "col-span-6 lg:col-span-3",
    ratio: "aspect-[4/3] lg:aspect-square",
  },
  {
    src: "/images/campus-06.jpg",
    alt: "校园一角",
    title: "课间十分钟",
    meta: "BETWEEN CLASSES / 05",
    layout: "col-span-6 lg:col-span-4",
    ratio: "aspect-[4/3] lg:aspect-square",
  },
]

const tickerItems = ["校园新鲜事", "学习搭子", "失物招领", "社团招新", "匿名心声", "二手好物"]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ feed?: string | string[] }>
}) {
  const session = await auth()

  if (!session?.user?.id) return <GuestHome />

  const params = await searchParams
  const feedMode = params.feed === "following" ? "following" : "latest"

  const [pinnedPosts, posts, trendingPosts, activeUsers, stats, categoryCounts] = await Promise.all([
    getPinnedPosts(),
    prisma.post.findMany({
      where: feedMode === "following"
        ? { author: { followers: { some: { followerId: session.user.id } } } }
        : { pinned: false },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    getTrendingPosts(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, image: true, role: true, raputation: true },
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
  const countMap = new Map(categoryCounts.map((category) => [category.slug, category._count.posts]))
  const regularPosts = posts

  return (
    <div className="min-h-screen overflow-hidden bg-[#f4efe4] text-[#191914] dark:bg-[#11110f] dark:text-[#f5f0e5]">
      <section className="campus-paper relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:min-h-[820px] lg:px-8 lg:pb-24 lg:pt-36">
        <div aria-hidden className="absolute -left-12 top-44 h-28 w-28 rotate-12 border-2 border-[#191914] bg-[#d9ef61] dark:border-[#f5f0e5]" />
        <div aria-hidden className="absolute -right-10 bottom-20 h-36 w-36 rounded-full border-2 border-[#191914] bg-[#ff6b43] dark:border-[#f5f0e5]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <div className="relative z-10">
            <ScrollReveal>
              <div className="mb-7 inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.2em] text-[#191914] shadow-[3px_3px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#1a1a16] dark:text-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5b35]" />
                CAMPUS IS LIVE
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.08}>
              <h1 className="font-serif text-[clamp(3.6rem,8vw,7.2rem)] font-bold leading-[0.88] tracking-[-0.07em] text-[#191914] dark:text-[#f5f0e5]">
                把校园
                <span className="relative mt-2 block w-fit px-2 tracking-[-0.09em]">
                  <span className="relative z-10">说得更鲜活</span>
                  <span aria-hidden className="absolute inset-x-0 bottom-[0.08em] h-[0.34em] -rotate-1 bg-[#d9ef61] dark:bg-[#ff6b43]" />
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.16}>
              <p className="mt-8 max-w-xl text-base leading-8 text-[#5f5c54] dark:text-[#aaa69c] sm:text-lg">
                一个属于同学们的线上校园广场。分享问题、找到同伴、交换消息，
                也认真收藏那些只会发生一次的青春现场。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.24}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href={session?.user ? "/post/new" : "/auth/signin"}
                  className="hard-shadow group inline-flex min-h-12 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-6 py-3 text-sm font-bold text-[#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5]"
                >
                  {session?.user ? <Plus className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                  {session?.user ? "发布新帖" : "加入校园社区"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#latest"
                  className="inline-flex min-h-12 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-6 py-3 text-sm font-bold text-[#191914] transition-colors hover:bg-[#191914] hover:text-white dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#f5f0e5] dark:hover:text-[#191914]"
                >
                  <Compass className="h-4 w-4" />
                  逛逛新鲜事
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.32}>
              <div className="mt-12 grid max-w-xl grid-cols-3 border-y-2 border-[#191914] dark:border-[#f5f0e5]">
                {[
                  [totalPosts, "正在讨论"],
                  [totalUsers, "校园成员"],
                  [totalComments, "真诚回应"],
                ].map(([value, label], index) => (
                  <div
                    key={label}
                    className={cn(
                      "py-4 text-center sm:py-5",
                      index !== 0 && "border-l border-[#191914]/30 dark:border-[#f5f0e5]/30"
                    )}
                  >
                    <div className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
                      <CountUp end={Number(value)} />
                    </div>
                    <div className="mt-1 text-[10px] font-medium tracking-[0.14em] text-[#777268] dark:text-[#969187]">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.12} direction="left" className="relative mx-auto w-full max-w-2xl lg:mx-0">
            <div aria-hidden className="absolute -right-5 -top-5 h-full w-[92%] rotate-2 border-2 border-[#191914] bg-[#ff6b43] dark:border-[#f5f0e5]" />
            <figure className="relative overflow-hidden border-2 border-[#191914] bg-[#191914] shadow-[10px_10px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[10px_10px_0_#f5f0e5]">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/4]">
                <SafeImage
                  src="/images/campus-01.jpg"
                  alt="北京二中经开区学校校园"
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover saturate-[0.92] transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
              <figcaption className="flex items-center justify-between gap-4 bg-[#191914] px-4 py-3 text-white sm:px-5">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-white/50">TODAY AT SCHOOL</p>
                  <p className="mt-1 text-sm font-medium">春日校园，故事正在发生</p>
                </div>
                <Camera className="h-5 w-5 text-[#d9ef61]" />
              </figcaption>
            </figure>

            <div className="absolute -right-3 top-8 rotate-6 border-2 border-[#191914] bg-[#d9ef61] px-4 py-3 text-center text-[#191914] shadow-[4px_4px_0_#191914] sm:right-6 dark:border-[#f5f0e5] dark:shadow-[4px_4px_0_#f5f0e5]">
              <span className="block font-mono text-[9px] font-bold tracking-[0.16em]">NO. 02</span>
              <span className="mt-1 block font-serif text-lg font-bold">校园现场</span>
            </div>

            <div className="absolute -bottom-7 -left-2 max-w-[220px] -rotate-2 border-2 border-[#191914] bg-[#fffaf0] p-4 text-[#191914] shadow-[5px_5px_0_#191914] sm:left-8 dark:border-[#f5f0e5] dark:bg-[#22221d] dark:text-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5]">
              <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">
                <CalendarDays className="h-3.5 w-3.5" /> THIS WEEK
              </div>
              <p className="mt-2 font-serif text-base font-semibold leading-snug">和大家聊聊~</p>
            </div>
          </ScrollReveal>
        </div>

        <a
          href="#categories"
          aria-label="查看校园版块"
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-[#191914]/40 transition-colors hover:text-[#191914] lg:block dark:text-white/30 dark:hover:text-white"
        >
          <ChevronDown className="h-5 w-5 animate-bounce-subtle" />
        </a>
      </section>

      <div className="ticker-rail border-y-2 border-[#191914] bg-[#191914] py-3 text-[#f8f0e3] dark:border-[#f5f0e5]">
        <div className="ticker-track flex w-max items-center gap-7 whitespace-nowrap font-mono text-[11px] font-bold tracking-[0.18em]">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-7">
              {item}
              <span className="h-2.5 w-2.5 rotate-45 bg-[#ff6b43]" />
            </span>
          ))}
        </div>
      </div>

      <section id="categories" className="bg-[#fffaf0] px-4 py-20 dark:bg-[#151512] sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-10 flex flex-col justify-between gap-5 border-b-2 border-[#191914] pb-6 dark:border-[#f5f0e5] sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#e4532f]">01 / FIND YOUR CORNER</p>
                <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">今天想聊什么？</h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[#777268] dark:text-[#989389]">
                从一条通知到一道难题，每个版块都对应一段真实的校园生活。
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryEntries.map((entry, index) => {
              const Icon = entry.icon
              const href = entry.isPage ? "/confession" : `/category/${entry.slug}`
              const postCount = countMap.get(entry.slug) ?? 0

              return (
                <ScrollReveal key={entry.slug} delay={index * 0.05}>
                  <Link
                    href={href}
                    className={cn(
                      "category-block group relative flex min-h-48 flex-col justify-between overflow-hidden border-2 border-[#191914] p-5 text-[#191914] shadow-[6px_6px_0_#191914] transition-all duration-300 hover:-translate-y-1 hover:shadow-[10px_10px_0_#191914] sm:p-6",
                      entry.surface
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center border-2 border-[#191914] bg-[#fffaf0]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold tracking-[0.15em]">
                        {String(index + 1).padStart(2, "0")} / {entry.english}
                      </span>
                    </div>
                    <div className="mt-8">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-2xl font-bold">{entry.name}</h3>
                          <p className="mt-1 text-sm text-[#191914]/65">{entry.desc}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="mt-4 border-t border-[#191914]/25 pt-3 font-mono text-[10px] font-bold tracking-[0.12em]">
                        {postCount} POSTS
                      </p>
                    </div>
                  </Link>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      <section id="latest" className="campus-dot-grid bg-[#ece6da] px-4 py-20 dark:bg-[#10100e] sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-10 flex flex-col justify-between gap-5 border-b-2 border-[#191914] pb-6 dark:border-[#f5f0e5] sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#e4532f]">02 / CAMPUS FEED</p>
                <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">校园正在发生</h2>
                <div className="mt-5 inline-flex border-2 border-[#191914] bg-[#fffaf0] p-1 dark:border-[#f5f0e5] dark:bg-[#191914]" aria-label="动态范围">
                  <Link
                    href="/?feed=latest#latest"
                    aria-current={feedMode === "latest" ? "page" : undefined}
                    className={cn(
                      "px-4 py-2 text-xs font-bold transition-colors",
                      feedMode === "latest" ? "bg-[#191914] text-[#fffaf0] dark:bg-[#f5f0e5] dark:text-[#191914]" : "hover:bg-[#f3c84b] hover:text-[#191914]"
                    )}
                  >
                    最新动态
                  </Link>
                  <Link
                    href="/?feed=following#latest"
                    aria-current={feedMode === "following" ? "page" : undefined}
                    className={cn(
                      "px-4 py-2 text-xs font-bold transition-colors",
                      feedMode === "following" ? "bg-[#191914] text-[#fffaf0] dark:bg-[#f5f0e5] dark:text-[#191914]" : "hover:bg-[#d9ef61] hover:text-[#191914]"
                    )}
                  >
                    我的关注
                  </Link>
                </div>
              </div>
              <Link
                href={session?.user ? "/post/new" : "/auth/signin"}
                className="group inline-flex items-center gap-2 self-start border-2 border-[#191914] bg-[#d9ef61] px-4 py-2.5 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5] sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                {session?.user ? "写点新鲜的" : "登录后发帖"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
            <div className="min-w-0">
              {feedMode === "latest" && pinnedPosts.length > 0 && (
                <ScrollReveal className="mb-5">
                  <PinnedPosts posts={pinnedPosts} />
                </ScrollReveal>
              )}

              {regularPosts.length === 0 ? (
                <ScrollReveal>
                  <div className="border-2 border-dashed border-[#191914] bg-[#fffaf0] px-6 py-20 text-center dark:border-[#f5f0e5] dark:bg-[#191914]">
                    <Users className="mx-auto h-10 w-10 text-[#ff6b43]" />
                    <p className="mt-4 font-serif text-2xl font-bold">{feedMode === "following" ? "关注动态还是空的" : "这里还很安静"}</p>
                    <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">
                      {feedMode === "following" ? "去发现值得关注的同学，他们的新帖子会出现在这里。" : "来发布第一条校园新鲜事吧。"}
                    </p>
                    <Link
                      href={feedMode === "following" ? "/leaderboard" : "/post/new"}
                      className="mt-6 inline-flex items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-5 py-2.5 text-sm font-bold text-[#191914] shadow-[4px_4px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[4px_4px_0_#f5f0e5]"
                    >
                      {feedMode === "following" ? <Users className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {feedMode === "following" ? "发现校园同学" : "发布第一条帖子"}
                    </Link>
                  </div>
                </ScrollReveal>
              ) : (
                <FeedLoader key={feedMode} initialPosts={regularPosts} feed={feedMode} />
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <ScrollReveal direction="left">
                <TrendingPosts posts={trendingPosts} />
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.08}>
                <ActiveUsers users={activeUsers} />
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.16}>
                <div className="border-2 border-[#191914] bg-[#191914] p-6 text-[#f8f0e3] shadow-[6px_6px_0_#ff6b43] dark:border-[#f5f0e5]">
                  <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#d9ef61]">COMMUNITY NOTE</p>
                  <h3 className="mt-3 font-serif text-2xl font-bold">认真表达，也认真回应。</h3>
                  <p className="mt-3 text-sm leading-6 text-white/55">
                    尊重不同观点，保护个人隐私，让每一次讨论都给校园多一点善意。
                  </p>
                  <Link href="/search" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#ff8a68] hover:text-[#d9ef61]">
                    <Search className="h-4 w-4" /> 搜索帖子与同学
                  </Link>
                </div>
              </ScrollReveal>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#191914] px-4 py-20 text-[#f8f0e3] sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/30 pb-6 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-[#d9ef61]">03 / CAMPUS FRAME</p>
                <h2 className="mt-3 font-serif text-4xl font-bold tracking-tight sm:text-5xl">在场的青春</h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] text-white/45">
                <MapPin className="h-3.5 w-3.5 text-[#ff6b43]" /> 北京二中经开区学校
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-12 gap-3 sm:gap-4">
            {campusImages.map((image, index) => (
              <ScrollReveal key={image.src} delay={index * 0.05} className={image.layout}>
                <figure className="group border border-white/40 bg-[#f8f0e3] p-1 text-[#191914] transition-transform duration-300 hover:-translate-y-1 sm:p-1.5">
                  <div className={cn("relative overflow-hidden bg-[#2a2924]", image.ratio)}>
                    <SafeImage
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105 group-hover:saturate-[1.08]"
                    />
                  </div>
                  <figcaption className="flex items-end justify-between gap-3 px-2 py-3 sm:px-3">
                    <div>
                      <p className="font-mono text-[8px] font-bold tracking-[0.13em] text-[#e4532f] sm:text-[9px]">{image.meta}</p>
                      <p className="mt-1 font-serif text-sm font-bold sm:text-base">{image.title}</p>
                    </div>
                    <ArrowRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-1 sm:block" />
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="mt-16 grid gap-8 border-2 border-[#191914] bg-[#ff6b43] p-7 text-[#191914] shadow-[8px_8px_0_#d9ef61] sm:p-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] font-bold tracking-[0.18em]">YOUR STORY MATTERS</p>
                <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                  下一条校园故事，等你来写。
                </h2>
              </div>
              <div className="lg:text-right">
                <p className="mb-5 text-sm leading-6 text-[#191914]/65">分享见闻、提出问题，或者只是记录今天。</p>
                <Link
                  href={session?.user ? "/post/new" : "/auth/register"}
                  className="inline-flex items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-5 py-3 text-sm font-bold shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1"
                >
                  {session?.user ? "现在发帖" : "加入我们"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

function GuestHome() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4efe4] text-[#191914] dark:bg-[#11110f] dark:text-[#f5f0e5]">
      <section className="campus-paper relative overflow-hidden px-4 pb-18 pt-28 sm:px-6 lg:min-h-[760px] lg:px-8 lg:pb-24 lg:pt-36">
        <div aria-hidden className="absolute -left-12 top-40 h-28 w-28 rotate-12 border-2 border-[#191914] bg-[#f3c84b] dark:border-[#f5f0e5]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-3 py-2 font-mono text-[10px] font-bold tracking-[0.16em] text-[#191914] shadow-[3px_3px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
              <LockKeyhole className="h-3.5 w-3.5" /> INVITE ONLY
            </div>
            <h1 className="mt-8 max-w-3xl font-serif text-[clamp(3.6rem,7vw,6.8rem)] font-bold leading-[0.92] tracking-[-0.07em]">
              一座只向
              <span className="relative mt-2 block w-fit px-2">
                <span className="relative z-10">校园熟人开放</span>
                <span aria-hidden className="absolute inset-x-0 bottom-[0.06em] h-[0.32em] -rotate-1 bg-[#ff6b43]" />
              </span>
              的论坛
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#5f5c54] dark:text-[#aaa69c] sm:text-lg">
              为了让真实讨论留在可信任的校园关系里，论坛现采用邀请制。登录后可进入社区；新成员需要一枚尚未使用的邀请码。
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/auth/register" className="hard-shadow inline-flex h-12 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-6 text-sm font-bold text-[#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5]">
                <TicketCheck className="h-4 w-4" /> 使用邀请码注册 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/signin" className="inline-flex h-12 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-6 text-sm font-bold hover:bg-[#191914] hover:text-white dark:border-[#f5f0e5] dark:bg-[#191914] dark:hover:bg-[#f5f0e5] dark:hover:text-[#191914]">
                已有账号，登录
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div aria-hidden className="absolute -right-5 -top-5 h-full w-[92%] rotate-2 border-2 border-[#191914] bg-[#d9ef61] dark:border-[#f5f0e5]" />
            <figure className="relative border-2 border-[#191914] bg-[#191914] shadow-[9px_9px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[9px_9px_0_#f5f0e5]">
              <div className="relative aspect-[5/4]">
                <SafeImage src="/images/campus-01.jpg" alt="校园春日景色" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover saturate-[0.9]" />
              </div>
              <figcaption className="flex items-center justify-between bg-[#191914] px-5 py-4 text-white">
                <div><p className="font-mono text-[9px] tracking-[0.18em] text-white/45">PRIVATE CAMPUS COMMUNITY</p><p className="mt-1 text-sm font-bold">真实身份之外，也保留真诚表达的空间</p></div>
                <ShieldCheck className="h-5 w-5 text-[#d9ef61]" />
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-[#191914] bg-[#191914] px-4 py-16 text-[#f5f0e5] dark:border-[#f5f0e5] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#ff8a68]">HOW INVITATIONS WORK</p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              ["01", "一枚一码", "每枚邀请码只允许完成一次注册，使用后立即失效。"],
              ["02", "永久有效", "未使用的邀请码不会过期，可以在合适的时候交给可信任的同学。"],
              ["03", "三日后接力", "新成员注册满三天后自动获得 3 枚邀请码，让社区稳步生长。"],
            ].map(([index, title, description]) => (
              <div key={index} className="border-t border-white/30 pt-5">
                <span className="font-mono text-sm font-bold text-[#d9ef61]">{index}</span>
                <h2 className="mt-4 font-serif text-2xl font-bold">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
