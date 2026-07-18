import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Clock,
  Crown,
  FileText,
  Heart,
  MessageSquare,
  Settings,
} from "lucide-react"
import { CountUp } from "@/components/effects/count-up"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { LevelBadge } from "@/components/reputation/level-badge"
import { ReputationBar } from "@/components/reputation/reputation-bar"
import { UserBadges } from "@/components/reputation/user-badges"
import { EditorialHeading, EditorialPanel } from "@/components/ui/editorial"
import { SafeImage } from "@/components/ui/safe-image"
import { prisma } from "@/lib/prisma"
import { cn, formatDate, formatRelativeTime } from "@/lib/utils"
import { requireUser } from "@/lib/session"
import { getSuccessfulInviteCount } from "@/lib/invitations"

const categoryStyles: Record<string, string> = {
  announcement: "bg-[#ff6b43]",
  lostfound: "bg-[#d9ef61]",
  study: "bg-[#f3c84b]",
  confession: "bg-[#ffb4aa]",
  activity: "bg-[#b9ddbd]",
  secondhand: "bg-[#f2d0b2]",
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const currentUser = await requireUser(`/profile/${id}`)
  const isOwnProfile = currentUser.id === id

  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { posts: true, comments: true, likes: true } } },
  })

  if (!user) notFound()

  const [likeReceivedCount, pinnedPostCount, successfulInviteCount, posts, comments] = await Promise.all([
    prisma.like.count({ where: { post: { authorId: id } } }),
    prisma.post.count({ where: { authorId: id, pinned: true } }),
    getSuccessfulInviteCount(id),
    prisma.post.findMany({
      where: { authorId: id },
      include: { category: true, _count: { select: { comments: true, likes: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.comment.findMany({
      where: { authorId: id },
      include: { post: { select: { id: true, title: true, category: { select: { slug: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ])
  const hasPinnedPost = pinnedPostCount > 0

  const stats = [
    { label: "帖子", value: user._count.posts, icon: FileText },
    { label: "评论", value: user._count.comments, icon: MessageSquare },
    { label: "获赞", value: likeReceivedCount, icon: Heart },
    { label: "声望", value: user.role === "ADMIN" ? null : user.raputation, icon: Crown },
  ]
  const badgeStats = {
    postCount: user._count.posts,
    commentCount: user._count.comments,
    likeReceivedCount,
    successfulInviteCount,
    hasPinnedPost,
    role: user.role,
  }

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <section className="campus-paper relative overflow-hidden border-b-2 border-[#191914] px-4 pb-14 pt-28 dark:border-[#f5f0e5] sm:px-6 sm:pb-18 lg:px-8">
        <div aria-hidden className="absolute -right-12 top-24 h-40 w-40 rotate-12 border-2 border-[#191914] bg-[#d9ef61] dark:border-[#f5f0e5]" />
        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#e4532f]">PROFILE / CAMPUS MEMBER</p>
            <div className="mt-6 grid items-center gap-7 md:grid-cols-[auto_minmax(0,1fr)]">
              <div className="relative mx-auto md:mx-0">
                <div className="relative h-28 w-28 overflow-hidden border-2 border-[#191914] bg-[#191914] shadow-[7px_7px_0_#ff6b43] dark:border-[#f5f0e5] sm:h-32 sm:w-32">
                  {user.image ? (
                    <SafeImage src={user.image} alt={user.name ?? "用户头像"} fill sizes="128px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#f3c84b] font-serif text-4xl font-bold text-[#191914]">
                      {(user.name ?? "U").charAt(0)}
                    </div>
                  )}
                </div>
                {user.role === "ADMIN" && (
                  <div className="absolute -bottom-3 -right-3 flex h-9 w-9 items-center justify-center border-2 border-[#191914] bg-[#f3c84b] text-[#191914] dark:border-[#f5f0e5]">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="min-w-0 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">{user.name ?? "未命名用户"}</h1>
                  {user.role === "ADMIN" && <span className="border border-[#191914] bg-[#f3c84b] px-2 py-1 font-mono text-[9px] font-bold text-[#191914] dark:border-[#f5f0e5]">ADMIN</span>}
                  <LevelBadge raputation={user.raputation} role={user.role} size="sm" />
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#777268] dark:text-[#989389] md:justify-start">
                  <Calendar className="h-3.5 w-3.5 text-[#e4532f]" /> JOINED {formatDate(user.createdAt).split(" ")[0]}
                </p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5f5c54] dark:text-[#aaa69c]">
                  {user.bio || "还没有写个人简介，也许一句话就能让大家更了解你。"}
                </p>
                {isOwnProfile && (
                  <Link href="/profile/settings" className="mt-5 inline-flex items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 py-2.5 text-sm font-bold shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[3px_3px_0_#f5f0e5]">
                    <Settings className="h-4 w-4 text-[#e4532f]" /> 编辑个人资料
                  </Link>
                )}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-10 grid grid-cols-2 border-2 border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914] sm:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={stat.label} className={cn(
                  "p-4 text-center sm:p-5",
                  index % 2 === 1 && "border-l border-[#191914]/20 dark:border-white/20",
                  index >= 2 && "border-t border-[#191914]/20 dark:border-white/20 sm:border-t-0",
                  index > 0 && "sm:border-l sm:border-[#191914]/20 dark:sm:border-white/20"
                )}>
                  <stat.icon className="mx-auto h-4 w-4 text-[#e4532f]" />
                  <div className="mt-2 font-mono text-2xl font-bold">
                    {stat.value === null ? "MAX" : <CountUp end={stat.value} duration={1500} />}
                  </div>
                  <div className="mt-1 text-xs text-[#777268] dark:text-[#989389]">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-7 lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-24">
            <ReputationBar raputation={user.raputation} role={user.role} className="rounded-none border-2 border-[#191914] bg-[#f3c84b] text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#292821] dark:shadow-[5px_5px_0_#f5f0e5]" />
            <EditorialPanel className="p-5">
              <UserBadges stats={badgeStats} />
            </EditorialPanel>
          </aside>

          <div className="min-w-0 space-y-7">
            <EditorialPanel className="p-5 sm:p-7">
              <EditorialHeading index="01" eyebrow="POSTS" title="发布的帖子" meta={`${posts.length} 条`} />
              {posts.length === 0 ? (
                <EmptyState icon={BookOpen} text="暂时还没有发布帖子" />
              ) : (
                <div className="mt-5">
                  {posts.map((post, index) => (
                    <ScrollReveal key={post.id} delay={index * 0.04}>
                      <Link href={`/post/${post.id}`} className="group grid gap-3 border-b border-[#191914]/15 py-4 last:border-b-0 dark:border-white/15 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("border border-[#191914] px-2 py-0.5 font-mono text-[9px] font-bold text-[#191914] dark:border-[#f5f0e5]", categoryStyles[post.category.slug] ?? "bg-[#e5ded1]")}>{post.category.name}</span>
                            <span className="flex items-center gap-1 font-mono text-[9px] text-[#918b80]"><Clock className="h-3 w-3" />{formatRelativeTime(post.createdAt)}</span>
                          </div>
                          <h3 className="mt-2 truncate font-serif text-lg font-bold transition-colors group-hover:text-[#d44120]">{post.title}</h3>
                          <p className="mt-1 line-clamp-1 text-sm text-[#777268] dark:text-[#aaa69c]">{post.content.slice(0, 120).replace(/[#*`>]/g, "")}...</p>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-[10px] text-[#777268] dark:text-[#aaa69c]">
                          <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post._count.comments}</span>
                          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{post._count.likes}</span>
                          <ArrowUpRight className="h-4 w-4 text-[#e4532f] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </EditorialPanel>

            <EditorialPanel className="p-5 sm:p-7">
              <EditorialHeading index="02" eyebrow="COMMENTS" title="参与的讨论" meta={`${comments.length} 条`} />
              {comments.length === 0 ? (
                <EmptyState icon={MessageSquare} text="暂时还没有发表评论" />
              ) : (
                <div className="mt-5">
                  {comments.map((comment, index) => (
                    <ScrollReveal key={comment.id} delay={index * 0.04}>
                      <Link href={`/post/${comment.post.id}`} className="group block border-b border-[#191914]/15 py-4 last:border-b-0 dark:border-white/15">
                        <p className="text-xs text-[#918b80]">回应了 <span className="font-bold text-[#d44120] dark:text-[#ff8a68]">{comment.post.title}</span></p>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5f5c54] dark:text-[#c0bbb1]">{comment.content}</p>
                        <p className="mt-2 flex items-center gap-1 font-mono text-[9px] text-[#918b80]"><Clock className="h-3 w-3" />{formatRelativeTime(comment.createdAt)}</p>
                      </Link>
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </EditorialPanel>
          </div>
        </div>
      </main>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="mt-5 border-2 border-dashed border-[#191914]/35 py-14 text-center dark:border-white/30">
      <Icon className="mx-auto h-9 w-9 text-[#e4532f]" />
      <p className="mt-3 text-sm text-[#777268] dark:text-[#989389]">{text}</p>
    </div>
  )
}
