import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { CountUp } from "@/components/effects/count-up"
import { BanUserButton } from "@/components/admin/ban-user-button"
import { getPhotos } from "@/lib/album-store"
import {
  Users,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  Images,
  Activity,
  Server,
  CheckCircle2,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] dark:bg-[#0a0a0a]">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 dark:text-rose-400 mb-6 shadow-lg">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-stone-800 dark:text-stone-100 mb-3">
            没有权限访问
          </h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
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
    getPhotos(),
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

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0a0a]">
      {/* Admin Header */}
      <section className="relative overflow-hidden bg-stone-900 pt-28 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  管理员仪表盘
                </h1>
                <p className="text-sm text-stone-400">北京二中经开区学校 · 校园论坛管理后台</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="relative -mt-8 mx-auto max-w-7xl px-4 sm:px-6 space-y-8 pb-20">
        {/* Stats Grid */}
        <ScrollReveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                    实时
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

        {/* Category Distribution + System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <ScrollReveal delay={0.05} >
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-sm p-6">
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
                    <div className="flex-1 h-6 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
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
            <div className="rounded-3xl bg-stone-900 border border-stone-800 p-6">
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
                  <span className="text-sm text-white font-mono">{photos.length} 张</span>
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
          <div className="rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Images className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">照片墙</h2>
                <span className="text-xs text-stone-400 dark:text-stone-500 ml-auto">
                  {photos.length} 张照片
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
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={photo.thumb || photo.url}
                        alt={photo.caption ?? ""}
                        className="h-full w-full object-cover"
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
                {photos.length > 16 && (
                  <p className="text-center text-xs text-stone-400 dark:text-stone-500 mt-4">
                    还有 {photos.length - 16} 张照片，前往照片墙查看全部
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
          <div className="rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
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
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden md:table-cell">注册时间</th>
                    <th className="text-left px-6 py-4 font-medium text-stone-600 dark:text-stone-300 hidden lg:table-cell">活跃</th>
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
                              : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-[11px]"
                          }
                        >
                          {user.role === "ADMIN" ? "管理员" : "学生"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400 hidden md:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(user.createdAt).split(" ")[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-stone-500 dark:text-stone-400 hidden lg:table-cell">
                        <div className="flex items-center gap-3 text-xs">
                          <span>{user._count.posts} 帖</span>
                          <span>{user._count.comments} 评</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== "ADMIN" && (
                          <BanUserButton userId={user.id} userName={user.name ?? user.email ?? "未知用户"} />
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
          <ScrollReveal delay={0.2}>
            <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
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
            <div className="rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
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
                    className="block rounded-xl border border-stone-100 dark:border-stone-800 p-3 hover:border-stone-200 dark:hover:border-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors"
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
