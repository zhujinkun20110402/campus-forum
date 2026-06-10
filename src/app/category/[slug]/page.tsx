import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { CountUp } from "@/components/effects/count-up"
import {
  BookOpen,
  Megaphone,
  Search,
  Heart,
  GraduationCap,
  PartyPopper,
  ShoppingBag,
  MessageCircle,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryConfig: Record<string, {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  accentColor: string
  textColor: string
  bgColor: string
  particleColor: string
}> = {
  announcement: {
    name: "校园公告",
    description: "学校重要通知、活动安排、政策发布",
    icon: Megaphone,
    gradient: "from-amber-900 via-amber-950 to-slate-900",
    accentColor: "bg-amber-500",
    textColor: "text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    particleColor: "rgba(245, 158, 11, ",
  },
  lostfound: {
    name: "失物招领",
    description: "丢失物品寻找、拾到物品归还",
    icon: Search,
    gradient: "from-emerald-900 via-emerald-950 to-slate-900",
    accentColor: "bg-emerald-500",
    textColor: "text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    particleColor: "rgba(16, 185, 129, ",
  },
  study: {
    name: "学习交流",
    description: "学习资料分享、难题讨论、经验交流",
    icon: GraduationCap,
    gradient: "from-sky-900 via-sky-950 to-slate-900",
    accentColor: "bg-sky-500",
    textColor: "text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/20",
    particleColor: "rgba(14, 165, 233, ",
  },
  confession: {
    name: "表白墙",
    description: "匿名表白、心意传递、情感交流",
    icon: Heart,
    gradient: "from-rose-900 via-rose-950 to-slate-900",
    accentColor: "bg-rose-500",
    textColor: "text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    particleColor: "rgba(244, 63, 94, ",
  },
  activity: {
    name: "校园活动",
    description: "社团活动、比赛通知、聚会邀约",
    icon: PartyPopper,
    gradient: "from-violet-900 via-violet-950 to-slate-900",
    accentColor: "bg-violet-500",
    textColor: "text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/20",
    particleColor: "rgba(139, 92, 246, ",
  },
  secondhand: {
    name: "二手交易",
    description: "闲置物品转让、书籍交换、好物推荐",
    icon: ShoppingBag,
    gradient: "from-orange-900 via-orange-950 to-slate-900",
    accentColor: "bg-orange-500",
    textColor: "text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    particleColor: "rgba(249, 115, 22, ",
  },
  "problem-discussion": {
    name: "难题讨论",
    description: "学科难题、竞赛题目、知识探讨",
    icon: MessageCircle,
    gradient: "from-indigo-900 via-indigo-950 to-slate-900",
    accentColor: "bg-indigo-500",
    textColor: "text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/20",
    particleColor: "rgba(99, 102, 241, ",
  },
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const config = categoryConfig[slug]

  if (!config) {
    notFound()
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
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
      },
    },
  })

  if (!category) {
    notFound()
  }

  const Icon = config.icon
  const totalComments = category.posts.reduce((sum, p) => sum + p._count.comments, 0)
  const totalLikes = category.posts.reduce((sum, p) => sum + p._count.likes, 0)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-indigo-950">
      {/* Category Header */}
      <section className={cn(
        "relative overflow-hidden bg-gradient-to-br pt-28 pb-16",
        config.gradient
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-white/10 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg",
                config.bgColor
              )}>
                <Icon className={cn("h-8 w-8", config.textColor)} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-2">
                  {config.name}
                </h1>
                <p className="text-sm text-white/50 max-w-md">
                  {config.description}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={0.1}>
            <div className="mt-8 flex items-center justify-center sm:justify-start gap-6">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <FileText className="h-4 w-4" />
                <span>
                  <CountUp end={category.posts.length} duration={1500} className="text-white font-mono" /> 帖子
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MessageCircle className="h-4 w-4" />
                <span>
                  <CountUp end={totalComments} duration={1500} className="text-white font-mono" /> 评论
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Heart className="h-4 w-4" />
                <span>
                  <CountUp end={totalLikes} duration={1500} className="text-white font-mono" /> 点赞
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Posts List */}
      <div className="relative -mt-8 mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <ScrollReveal>
          <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-xl shadow-slate-200/20 dark:shadow-indigo-950/30 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Icon className={cn("h-5 w-5", config.textColor)} />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {config.name}帖子
              </h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                共 {category.posts.length} 条
              </span>
            </div>

            {category.posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-indigo-700/50 py-20 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-indigo-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-1">
                  该分类下还没有帖子
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  来做第一个发帖的人吧
                </p>
              </div>
            ) : slug === "confession" ? (
              <PostList
                posts={category.posts.map((p) => ({
                  ...p,
                  author: { name: null, image: null },
                }))}
                hideAuthor
              />
            ) : (
              <PostList posts={category.posts} />
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
