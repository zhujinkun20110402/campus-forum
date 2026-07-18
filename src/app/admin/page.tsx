import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { CountUp } from "@/components/effects/count-up"
import { BanUserButton } from "@/components/admin/ban-user-button"
import { ReputationAdjustButton } from "@/components/admin/reputation-adjust-button"
import { LevelBadge } from "@/components/reputation/level-badge"
import { getPhotosPreview } from "@/lib/album-store"
import { EditorialHero } from "@/components/ui/editorial"
import { SafeImage } from "@/components/ui/safe-image"
import { requireUser } from "@/lib/session"
import {
  Users,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  TrendingUp,
  Images,
  Activity,
  Server,
  CheckCircle2,
  Award,
  TicketPlus,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const currentUser = await requireUser("/admin")

  if (currentUser.role !== "ADMIN") {
    return (
      <div className="campus-paper flex min-h-screen items-center justify-center bg-[#f4efe4] px-4 dark:bg-[#11110f]">
        <div className="border-2 border-[#191914] bg-[#fffaf0] px-8 py-12 text-center shadow-[7px_7px_0_#ff6b43] dark:border-[#f5f0e5] dark:bg-[#191914]">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#b52f1e] dark:border-[#f5f0e5]">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="mb-3 font-serif text-2xl font-bold">
            没有权限访问
          </h1>
          <p className="mx-auto max-w-sm leading-relaxed text-[#777268] dark:text-[#989389]">
            您需要管理员权限才能访问此页面。如有疑问，请联系系统管理员。
          </p>
        </div>
      </div>
    )
  }

  const [
    users,
    posts,
    recentComments,
    totalUsers,
    totalPosts,
    totalComments,
    totalLikes,
    photos,
    categoryStats,
  ] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        category: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true, image: true } },
        post: { select: { id: true, title: true } },
      },
    }),
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
    prisma.like.count(),
    getPhotosPreview(16),
    prisma.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: "desc" } },
    }),
  ])

  const stats = [
    {
      label: "总用户数",
      value: totalUsers,
      icon: Users,
      bgColor: "bg-stone-100 dark:bg-stone-800",
      textColor: "text-stone-700 dark:text-stone-300",
    },
    {
      label: "总帖子数",
      value: totalPosts,
      icon: FileText,
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "总评论数",
      value: totalComments,
      icon: MessageSquare,
      bgColor: "bg-sky-50 dark:bg-sky-950/30",
      textColor: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "总点赞数",
      value: totalLikes,
      icon: TrendingUp,
      bgColor: "bg-rose-50 dark:bg-rose-950/30",
      textColor: "text-rose-600 dark:text-rose-400",
    },
  ]

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c._count.posts), 1)

  // 声望排行榜（排除管理员）
  const reputationLeaderboard = [...users]
    .filter((u) => u.role !== "ADMIN")
    .sort((a, b) => b.raputation - a.raputation)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="10"
        eyebrow="CONTROL ROOM"
        title="校园社区管理台"
        description="查看社区运行状态、内容趋势与成员数据，保持校园论坛健康、有序地运转。"
        icon={Shield}
        accentClass="bg-[#f3c84b]"
        compact
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.14em] dark:border-[#f5f0e5] dark:bg-[#191914]">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#326b42]" /> SYSTEM ONLINE
          </span>
          <Link href="/invites" className="inline-flex items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-3 py-2 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
            <TicketPlus className="h-4 w-4" /> 管理邀请码
          </Link>
        </div>
      </EditorialHero>

      <div className="campus-dot-grid mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Stats Grid */}
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-2 border-[#191914] bg-[#fffaf0] p-5 shadow-[4px_4px_0_rgba(25,25,20,0.16)] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[4px_4px_0_rgba(245,240,229,0.12)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center border border-[#191914]/25 ${stat.bgColor} dark:border-white/25`}>
                    <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                  <span className="border border-[#191914]/20 px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-[#777268] dark:border-white/20 dark:text-[#989389]">
                    LIVE
                  </span>
                </div>
                <div className={`text-3xl font-mono font-bold ${stat.textColor}`}>
                  <CountUp end={stat.value} duration={2000} />
                </div>
                <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Reputation Leaderboard */}
        <ScrollReveal delay={0.05}>
          <div className="border-2 border-[#191914] bg-[#fffaf0] p-6 shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_#f5f0e5]">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Award className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">声望排行榜</h2>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">社区贡献度 Top 5</p>
              </div>
            </div>
            <div className="space-y-2">
              {reputationLeaderboard.map((user, index) => (
                <div
                  key={user.id}
                className="flex items-center gap-3 border-b border-[#191914]/15 p-3 last:border-b-0 dark:border-white/15"
                >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center border border-[#191914]/25 text-xs font-bold ${
                    index === 0
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                      : index === 1
                      ? "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                      : index === 2
                      ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                  }`}>
                    {index + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                    <AvatarFallback className="text-xs bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                      {(user.name ?? user.email ?? "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate block">
                      {user.name ?? "未命名"}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <LevelBadge raputation={user.raputation} role={user.role} size="xs" showTitle={false} />
                      <span className="text-[11px] text-stone-400 dark:text-stone-500">
                        {user._count.posts} 帖 · {user._count.comments} 评
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                    {user.raputation}
                  </span>
                </div>
              ))}
              {reputationLeaderboard.length === 0 && (
                <div className="text-center py-8 text-sm text-stone-400 dark:text-stone-500">
                  暂无用户数据
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Category Distribution + System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <ScrollReveal delay={0.05} className="lg:col-span-2">
            <div className="border-2 border-[#191914] bg-[#fffaf0] p-6 shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.1)]">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">分类分布</h2>
              </div>
              <div className="space-y-3">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-sm text-stone-600 dark:text-stone-400 w-14 sm:w-20 shrink-0 truncate">
                      {cat.name}
                    </span>
                    <div className="h-6 flex-1 overflow-hidden border border-[#191914]/20 bg-[#ece6da] dark:border-white/20 dark:bg-[#292821]">
                      <div
                        className="h-full bg-[#ff6b43] transition-all duration-700"
                        style={{ width: `${(cat._count.posts / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-stone-500 dark:text-stone-400 w-6 sm:w-8 shrink-0 text-right">
                      {cat._count.posts}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* System Status */}
          <ScrollReveal delay={0.1}>
            <div className="border-2 border-[#191914] bg-[#191914] p-6 text-[#f5f0e5] shadow-[5px_5px_0_#d9ef61] dark:border-[#f5f0e5]">
              <div className="flex items-center gap-2 mb-5">
                <Server className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">系统状态</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">数据库</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">正常</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">图床服务</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-sm text-emerald-400">在线</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">照片墙</span>
                  <a href="/album" className="text-sm text-amber-400 hover:underline">查看 →</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400">版本</span>
                  <span className="text-sm text-white font-mono">v2.0.0</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Photo Wall Preview */}
        <ScrollReveal delay={0.1}>
          <div className="overflow-hidden border-2 border-[#191914] bg-[#fffaf0] shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.1)]">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">照片墙</h2>
                <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                  最近 {photos.length} 张
                </span>
                <a
                  href="/album"
                  className="ml-3 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  前往管理 →
                </a>
              </div>
            </div>
            {photos.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {photos.slice(0, 16).map((photo) => (
                    <div
                      key={photo.url}
                      className="group relative aspect-square overflow-hidden border border-[#191914]/20 dark:border-white/20"
                    >
                      <SafeImage
                        src={photo.thumb || photo.url}
                        alt={photo.caption ?? ""}
                        fill
                        sizes="(min-width: 1024px) 12vw, 25vw"
                        className="object-cover"
                      />
                      {photo.caption && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-end p-1.5 transition-opacity">
                          <p className="text-[9px] text-white/80 line-clamp-2 leading-tight">
                            {photo.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {photos.length === 16 && (
                  <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-4">
                    前往照片墙查看全部
                  </p>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Images className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-700" />
                <p className="mt-3 text-sm text-stone-400 dark:text-stone-500">
                  照片墙暂无照片，前往添加
                </p>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* Users Management */}
        <ScrollReveal delay={0.15}>
          <div className="overflow-hidden border-2 border-[#191914] bg-[#fffaf0] shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.1)]">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">用户管理</h2>
                <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                  共 {users.length} 位用户
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300">用户</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden sm:table-cell">邮箱</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300">角色</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden md:table-cell">声望</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden lg:table-cell">注册时间</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden xl:table-cell">活跃</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                            <AvatarFallback className="text-xs bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                              {(user.name ?? user.email ?? "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-stone-800 dark:text-stone-100 block">
                              {user.name ?? "未命名"}
                            </span>
                            <span className="text-xs text-stone-400 dark:text-stone-500 sm:hidden">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600 dark:text-stone-300 hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === "ADMIN"
                              ? "border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[11px]"
                              : user.role === "BANNED"
                              ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[11px]"
                              : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px]"
                          }
                        >
                          {user.role === "ADMIN" ? "管理员" : user.role === "BANNED" ? "已封禁" : "学生"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <LevelBadge raputation={user.raputation} role={user.role} size="xs" showTitle={false} />
                          <span className="font-mono text-xs text-stone-600 dark:text-stone-300">
                            {user.role === "ADMIN" ? "9999" : user.raputation}
                          </span>
                          {user.role !== "ADMIN" && (
                            <div className="flex items-center gap-1 ml-1">
                              <ReputationAdjustButton userId={user.id} delta={10} />
                              <ReputationAdjustButton userId={user.id} delta={-10} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(user.createdAt).split(" ")[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400 hidden xl:table-cell">
                        <div className="flex items-center gap-3 text-xs">
                          <span>{user._count.posts} 帖</span>
                          <span>{user._count.comments} 评</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== "ADMIN" && (
                          <BanUserButton
                            userId={user.id}
                            userName={user.name ?? user.email ?? "未知用户"}
                            isBanned={user.role === "BANNED"}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Posts + Recent Comments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <ScrollReveal delay={0.2} className="lg:col-span-2">
            <div className="overflow-hidden border-2 border-[#191914] bg-[#fffaf0] shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.1)]">
              <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                  <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">最近帖子</h2>
                  <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">最近 8 条</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                      <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300">标题</th>
                      <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden sm:table-cell">作者</th>
                      <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300">分类</th>
                      <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden md:table-cell">互动</th>
                      <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden lg:table-cell">时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <a
                            href={`/post/${post.id}`}
                            className="font-medium text-stone-800 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate block max-w-[200px] sm:max-w-xs"
                          >
                            {post.title}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-stone-600 dark:text-stone-300 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.image ?? undefined} />
                              <AvatarFallback className="text-[10px] bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                                {(post.author.name ?? "U").slice(0, 1).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[100px]">
                              {post.author.name ?? post.author.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[11px]">
                            {post.category.name}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-stone-500 dark:text-stone-400 hidden md:table-cell">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post._count.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {post._count.likes}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-stone-500 dark:text-stone-400 hidden lg:table-cell">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(post.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>

          {/* Recent Comments */}
          <ScrollReveal delay={0.25}>
            <div className="overflow-hidden border-2 border-[#191914] bg-[#fffaf0] shadow-[5px_5px_0_rgba(25,25,20,0.16)] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_rgba(245,240,229,0.1)]">
              <div className="p-6 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                  <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">最新评论</h2>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {recentComments.map((comment) => (
                  <a
                    key={comment.id}
                    href={`/post/${comment.post.id}`}
                    className="block border-b border-[#191914]/15 p-3 transition-colors last:border-b-0 hover:bg-[#d9ef61]/25 dark:border-white/15 dark:hover:bg-[#292821]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={comment.author.image ?? undefined} />
                        <AvatarFallback className="text-[9px] bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                          {(comment.author.name ?? "U").slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-200">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">
                        {formatRelativeTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {comment.content}
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 truncate">
                      ↳ {comment.post.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
