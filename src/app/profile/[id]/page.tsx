import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Crown,
  FileText,
  Heart,
  HeartHandshake,
  Link2,
  LockKeyhole,
  Mail,
  MessageSquare,
  Settings,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react"
import { CountUp } from "@/components/effects/count-up"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { LevelBadge } from "@/components/reputation/level-badge"
import { ReputationBar } from "@/components/reputation/reputation-bar"
import { UserBadges } from "@/components/reputation/user-badges"
import { ChampionCrown } from "@/components/reputation/champion-crown"
import { FollowButton } from "@/components/social/follow-button"
import { ReputationGiftButton } from "@/components/social/reputation-gift-button"
import { ProfileStatus } from "@/components/presence/profile-status"
import { EditorialHeading, EditorialPanel } from "@/components/ui/editorial"
import { SafeImage } from "@/components/ui/safe-image"
import { prisma } from "@/lib/prisma"
import { cn, formatDate, formatRelativeTime } from "@/lib/utils"
import { requireUser } from "@/lib/session"
import { getSuccessfulInviteCount } from "@/lib/invitations"
import { getCompetitiveRank, getFollowSummary } from "@/lib/social"
import { getVisibleCampusStatusByUser } from "@/lib/campus-status"
import { getReputationGiftState } from "@/lib/reputation-gifts"
import { getStatusTextColor } from "@/lib/status-constants"
import { TITLES } from "@/lib/reputation-milestones"
import { getLevel, getLevelTitle, getRelationshipType } from "@/lib/relationship-config"
import { getRelationshipState, getRelationshipsForUser, isMutualFollow } from "@/lib/relationships"

const categoryStyles: Record<string, string> = {
  announcement: "bg-[#ff6b43]",
  lostfound: "bg-[#d9ef61]",
  study: "bg-[#f3c84b]",
  confession: "bg-[#ffb4aa]",
  activity: "bg-[#b9ddbd]",
  secondhand: "bg-[#f2d0b2]",
  feedback: "bg-[#c8d7ef]",
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

  const [likeReceivedCount, pinnedPostCount, successfulInviteCount, followSummary, competitiveRank, campusStatus, giftState, posts, comments, targetRelationships, relationState, mutual] = await Promise.all([
    prisma.like.count({ where: { post: { authorId: id } } }),
    prisma.post.count({ where: { authorId: id, pinned: true } }),
    getSuccessfulInviteCount(id),
    getFollowSummary(currentUser.id, id),
    getCompetitiveRank(id),
    getVisibleCampusStatusByUser(currentUser.id, id),
    getReputationGiftState(currentUser.id),
    prisma.post.findMany({
      where: { authorId: id, category: { slug: { not: "confession" } } },
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
    getRelationshipsForUser(id),
    isOwnProfile ? Promise.resolve({ bonds: [] as { id: string; type: string; xp: number; createdAt: Date }[], pending: null }) : getRelationshipState(currentUser.id, id),
    isOwnProfile ? Promise.resolve(false) : isMutualFollow(currentUser.id, id),
  ])
  const hasPinnedPost = pinnedPostCount > 0
  const isChampion = competitiveRank === 1

  // 主页主题（声望 600 解锁）：只影响页面底色与装饰色
  const themeStyles: Record<string, { page: string; accent: string }> = {
    paper: { page: "bg-[#ece6da] dark:bg-[#10100e]", accent: "bg-[#d9ef61]" },
    cream: { page: "bg-[#f4e8d0] dark:bg-[#10100e]", accent: "bg-[#f2d0b2]" },
    ink: { page: "bg-[#ded9cd] dark:bg-[#10100e]", accent: "bg-[#c8d7ef]" },
  }
  const activeTheme = themeStyles[user.profileTheme ?? ""] ?? themeStyles.paper

  const stats = [
    { label: "帖子", value: user._count.posts, icon: FileText },
    { label: "评论", value: user._count.comments, icon: MessageSquare },
    { label: "关注者", value: followSummary.followers, icon: !isOwnProfile && user.hideFollowers ? LockKeyhole : Users, href: `/profile/${id}/connections?tab=followers` },
    { label: "正在关注", value: followSummary.following, icon: !isOwnProfile && user.hideFollowing ? LockKeyhole : UserPlus, href: `/profile/${id}/connections?tab=following` },
    { label: "获赞", value: likeReceivedCount, icon: Heart },
    { label: "声望", value: user.role === "ADMIN" ? null : user.raputation, icon: Crown },
  ]
  const badgeStats = {
    postCount: user._count.posts,
    commentCount: user._count.comments,
    likeReceivedCount,
    successfulInviteCount,
    totalCheckIns: user.totalCheckIns,
    hasPinnedPost,
    role: user.role,
  }

  return (
    <div className={cn("min-h-screen", activeTheme.page)}>
      <section className={cn("campus-paper relative overflow-hidden border-b-2 border-[#191914] px-4 pb-14 pt-28 dark:border-[#f5f0e5] sm:px-6 sm:pb-18 lg:px-8", isChampion && "bg-[#fff7dc] dark:bg-[#171713]")}>
        <div aria-hidden className={cn("absolute -right-12 top-24 h-40 w-40 rotate-12 border-2 border-[#191914] dark:border-[#f5f0e5]", isChampion ? "bg-[#f3c84b]" : activeTheme.accent)} />
        {isChampion && <div aria-hidden className="champion-spark absolute left-[8%] top-36 h-5 w-5 rotate-12 border-2 border-[#191914] bg-[#ffb4aa] dark:border-[#f5f0e5]" />}
        <div className="relative mx-auto max-w-6xl">
          <ScrollReveal>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#e4532f]">PROFILE / CAMPUS MEMBER</p>
            <div className="mt-6 grid items-center gap-7 md:grid-cols-[auto_minmax(0,1fr)]">
              <div className="relative mx-auto md:mx-0">
                <div
                  className={cn("relative h-28 w-28 overflow-hidden border-2 border-[#191914] bg-[#191914] shadow-[7px_7px_0_#ff6b43] dark:border-[#f5f0e5] sm:h-32 sm:w-32", isChampion && "champion-frame")}
                  style={campusStatus ? { borderColor: campusStatus.color, boxShadow: `7px 7px 0 ${campusStatus.color}` } : undefined}
                >
                  {user.image ? (
                    <SafeImage src={user.image} alt={user.name ?? "用户头像"} fill sizes="128px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#f3c84b] font-serif text-4xl font-bold text-[#191914]">
                      {(user.name ?? "U").charAt(0)}
                    </div>
                  )}
                </div>
                {isChampion && <ChampionCrown className="absolute -right-8 -top-10" />}
                {campusStatus?.emoji && (
                  <span className="absolute -bottom-3 -left-3 z-20 flex min-h-9 min-w-9 items-center justify-center border-2 border-[#191914] px-1 text-lg leading-none dark:border-[#f5f0e5]" style={{ backgroundColor: campusStatus.color, color: getStatusTextColor(campusStatus.color) }} title="当前 24 小时状态">
                    {campusStatus.emoji}
                  </span>
                )}
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
                  {user.equippedTitle && (
                    <span className="inline-flex items-center gap-1.5 border border-[#191914] bg-[#c8d7ef] px-2 py-1 font-mono text-[9px] font-bold text-[#191914] dark:border-[#f5f0e5]">
                      <Award className="h-3 w-3" />
                      {TITLES.find((title) => title.id === user.equippedTitle)?.name ?? user.equippedTitle}
                    </span>
                  )}
                  {isChampion && <span className="inline-flex items-center gap-1.5 border-2 border-[#191914] bg-[#191914] px-2.5 py-1 font-mono text-[9px] font-bold text-[#d9ef61] dark:border-[#f5f0e5]"><Trophy className="h-3.5 w-3.5" />RANK #01</span>}
                  <LevelBadge raputation={user.raputation} role={user.role} size="sm" />
                </div>
                <p className="mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] tracking-[0.1em] text-[#777268] dark:text-[#989389] md:justify-start">
                  <Calendar className="h-3.5 w-3.5 text-[#e4532f]" /> JOINED {formatDate(user.createdAt).split(" ")[0]}
                </p>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#5f5c54] dark:text-[#aaa69c]">
                  {user.bio || "还没有写个人简介，也许一句话就能让大家更了解你。"}
                </p>
                {campusStatus && <ProfileStatus status={campusStatus} isOwnProfile={isOwnProfile} />}
                <div className="mt-5 flex flex-wrap items-start justify-center gap-3 md:justify-start">
                  {isOwnProfile ? (
                    <>
                      <Link href="/profile/settings" className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 text-sm font-bold shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[3px_3px_0_#f5f0e5]"><Settings className="h-4 w-4 text-[#e4532f]" /> 编辑个人资料</Link>
                      <Link href={`/profile/${id}/connections`} className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#b9ddbd] px-4 text-sm font-bold text-[#191914] dark:border-[#f5f0e5]"><Users className="h-4 w-4" /> 我的关注</Link>
                      <Link href="/relationships" className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"><HeartHandshake className="h-4 w-4" /> 我的关系{targetRelationships.length > 0 ? ` · ${targetRelationships.length}` : ""}</Link>
                      <Link href="/postcards" className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#ffb4aa] px-4 text-sm font-bold text-[#191914] dark:border-[#f5f0e5]"><Mail className="h-4 w-4" /> 我的明信片</Link>
                    </>
                  ) : (
                    <>
                      <FollowButton targetUserId={id} initialFollowing={followSummary.isFollowing} />
                      {followSummary.isFollowing && <ReputationGiftButton targetUserId={id} initialAvailable={giftState.available} reward={giftState.reward} />}
                      <Link href={`/postcards?to=${encodeURIComponent(id)}`} className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#ffb4aa] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"><Mail className="h-4 w-4" /> 写明信片</Link>
                      {relationState.bonds.length > 0 ? (
                        <Link
                          href="/relationships"
                          className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#191914] px-4 text-sm font-bold text-[#fffaf0] shadow-[3px_3px_0_#ffb4aa] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:bg-[#f5f0e5] dark:text-[#191914]"
                        >
                          <HeartHandshake className="h-4 w-4" />
                          {relationState.bonds.map((bond) => `${getRelationshipType(bond.type)?.emoji ?? ""}${getRelationshipType(bond.type)?.name ?? bond.type} LV${getLevel(bond.xp)}`).join(" · ")}
                          <span className="font-mono text-[9px]">管理</span>
                        </Link>
                      ) : relationState.pending ? (
                        relationState.pending.fromUserId === currentUser.id ? (
                          <Link href="/relationships" className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#f3c84b] px-4 text-sm font-bold text-[#191914] dark:border-[#f5f0e5]">
                            <HeartHandshake className="h-4 w-4" /> 已申请「{getRelationshipType(relationState.pending.type)?.name ?? "关系"}」· 等待回应
                          </Link>
                        ) : (
                          <Link href="/relationships" className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#ffb4aa] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
                            <HeartHandshake className="h-4 w-4" /> TA 想和你绑定「{getRelationshipType(relationState.pending.type)?.name ?? "关系"}」
                          </Link>
                        )
                      ) : mutual ? (
                        <Link
                          href={`/relationships?with=${encodeURIComponent(id)}`}
                          className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
                        >
                          <HeartHandshake className="h-4 w-4" /> 绑定关系
                        </Link>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-10 grid grid-cols-2 gap-px border-2 border-[#191914] bg-[#191914] dark:border-[#f5f0e5] dark:bg-[#f5f0e5] sm:grid-cols-3 lg:grid-cols-6">
              {stats.map((stat, index) => (
                <ProfileStat key={stat.label} stat={stat} index={index} />
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
            <EditorialPanel className="p-5">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">RELATIONSHIPS</p>
              <h3 className="mt-1.5 flex items-center gap-2 font-serif text-lg font-bold">
                <Link2 className="h-4 w-4 text-[#e4532f]" /> 关系
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {targetRelationships.length === 0 ? (
                  <p className="text-xs leading-5 text-[#777268] dark:text-[#989389]">
                    还没有绑定关系{isOwnProfile ? "，去和互关好友绑定一段吧" : ""}。
                  </p>
                ) : (
                  targetRelationships.map((rel) => {
                    const partner = rel.userA.id === id ? rel.userB : rel.userA
                    const config = getRelationshipType(rel.type)
                    const level = getLevel(rel.xp)
                    return (
                      <Link
                        key={rel.id}
                        href={`/profile/${partner.id}`}
                        title={`${config?.name ?? rel.type} · ${getLevelTitle(rel.type, level)}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 border border-[#191914] px-2 py-1 text-[10px] font-bold text-[#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5]",
                          config?.surface ?? "bg-[#e5ded1]"
                        )}
                      >
                        <span aria-hidden>{config?.emoji}</span>
                        <span>{config?.name ?? rel.type}</span>
                        <span className="max-w-24 truncate">· {partner.name ?? "同学"}</span>
                        <span className="font-mono text-[8px] tracking-[0.08em]">LV{level}</span>
                      </Link>
                    )
                  })
                )}
              </div>
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

function ProfileStat({ stat, index }: { stat: { label: string; value: number | null; icon: React.ComponentType<{ className?: string }>; href?: string }; index: number }) {
  const content = (
    <>
      <stat.icon className="mx-auto h-4 w-4 text-[#e4532f]" />
      <div className="mt-2 font-mono text-2xl font-bold">{stat.value === null ? "MAX" : <CountUp end={stat.value} duration={1500} />}</div>
      <div className="mt-1 text-xs text-[#777268] dark:text-[#989389]">{stat.label}</div>
    </>
  )
  const className = cn("bg-[#fffaf0] p-4 text-center dark:bg-[#191914] sm:p-5", stat.href && "transition-colors hover:bg-[#d9ef61] hover:text-[#191914] dark:hover:bg-[#d9ef61] dark:hover:text-[#191914]", index === 0 && "")
  return stat.href ? <Link href={stat.href} className={className}>{content}</Link> : <div className={className}>{content}</div>
}
