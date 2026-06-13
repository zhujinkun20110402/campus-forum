import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { CountUp } from "@/components/effects/count-up"
import { SafeImage } from "@/components/ui/safe-image"
import {
  Settings,
  FileText,
  MessageSquare,
  Heart,
  ArrowUpRight,
  Calendar,
  BookOpen,
  Clock,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

const categoryStyles: Record<string, string> = {
  announcement: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400",
  lostfound: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400",
  study: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/60 dark:bg-sky-950/30 dark:text-sky-400",
  confession: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400",
  activity: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/30 dark:text-violet-400",
  secondhand: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800/60 dark:bg-orange-950/30 dark:text-orange-400",
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const isOwnProfile = session?.user?.id === id

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          comments: true,
          likes: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const posts = await prisma.post.findMany({
    where: { authorId: id },
    include: {
      category: true,
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const comments = await prisma.comment.findMany({
    where: { authorId: id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          category: { select: { slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  const stats = [
    { label: "帖子", value: user._count.posts, icon: FileText },
    { label: "评论", value: user._count.comments, icon: MessageSquare },
    { label: "获赞", value: user._count.likes, icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0a0a]">
      {/* Hero Profile Header */}
      <section className="relative overflow-hidden bg-stone-900 pb-24 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full bg-stone-700 blur-[100px]" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-amber-500/10 blur-[80px]" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-amber-500/20 p-0.5 shadow-xl">
                  <div className="h-full w-full rounded-[22px] bg-stone-800 overflow-hidden">
                    {user.image ? (
                      <SafeImage
                        src={user.image}
                        alt={user.name ?? ""}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-stone-700">
                        <span className="text-3xl font-serif text-amber-400/80">
                          {(user.name ?? "U").charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {user.role === "ADMIN" && (
                  <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-amber-500 border-2 border-stone-900 flex items-center justify-center shadow-lg">
                    <span className="text-[10px] font-bold text-stone-900">管</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {user.name ?? "未命名用户"}
                  </h1>
                  {user.role === "ADMIN" && (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                      管理员
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    加入于 {formatDate(user.createdAt).split(" ")[0]}
                  </span>
                </div>

                {user.bio && (
                  <p className="mt-4 text-sm text-stone-400 max-w-lg leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>

              {isOwnProfile && (
                <Link href="/profile/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-stone-700 bg-stone-800/50 text-stone-300 hover:bg-stone-700 hover:text-white rounded-full px-5"
                  >
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    编辑资料
                  </Button>
                </Link>
              )}
            </div>
          </ScrollReveal>

          {/* Stats Bar */}
          <ScrollReveal delay={0.1}>
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto sm:mx-0">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center"
                >
                  <stat.icon className="h-4 w-4 text-amber-400/70 mx-auto mb-2" />
                  <div className="text-2xl font-mono font-semibold text-white">
                    <CountUp end={stat.value} duration={1500} />
                  </div>
                  <div className="text-xs text-stone-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Content Tabs */}
      <div className="relative -mt-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="bg-white dark:bg-[#141414] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden">
          {/* Posts Section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                发布的帖子
              </h2>
              <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                共 {posts.length} 条
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-16 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700" />
                <p className="mt-3 text-sm text-stone-400 dark:text-stone-500">暂无帖子</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={index * 0.05}>
                    <Link href={`/post/${post.id}`}>
                      <article className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 p-5 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md transition-all duration-300 card-shine">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[11px] font-normal cursor-pointer",
                                  categoryStyles[post.category.slug] ?? "border-stone-200 bg-stone-50 text-stone-600 dark:border-stone-700 dark:bg-stone-900/30 dark:text-stone-300"
                                )}
                              >
                                {post.category.name}
                              </Badge>
                              <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500">
                                <Clock className="h-3 w-3" />
                                {formatRelativeTime(post.createdAt)}
                              </span>
                            </div>
                            <h3 className="font-medium text-stone-800 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1.5 line-clamp-1">
                              {post.content.slice(0, 120).replace(/[#*`>]/g, "")}...
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0 text-xs text-stone-400 dark:text-stone-500">
                            <ArrowUpRight className="h-4 w-4 text-stone-300 dark:text-stone-700 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            <div className="flex items-center gap-3 mt-auto">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {post._count.comments}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {post._count.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-stone-200 dark:via-stone-800 to-transparent" />

          {/* Comments Section */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-stone-600 dark:text-stone-400" />
              <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
                发表的评论
              </h2>
              <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                共 {comments.length} 条
              </span>
            </div>

            {comments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-16 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700" />
                <p className="mt-3 text-sm text-stone-400 dark:text-stone-500">暂无评论</p>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment, index) => (
                  <ScrollReveal key={comment.id} delay={index * 0.05}>
                    <Link href={`/post/${comment.post.id}`}>
                      <article className="group rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 p-5 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-stone-400 dark:text-stone-500">评论了</span>
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400 truncate max-w-[300px]">
                            {comment.post.title}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                          {comment.content}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-[11px] text-stone-400 dark:text-stone-500">
                          <Clock className="h-3 w-3" />
                          {formatRelativeTime(comment.createdAt)}
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-20" />
    </div>
  )
}