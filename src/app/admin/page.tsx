import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { CountUp } from "@/components/effects/count-up"
import { BanUserButton } from "@/components/admin/ban-user-button"
import {
  Users,
  FileText,
  MessageSquare,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-indigo-950">
        <div className="text-center px-4">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-950/40 dark:to-pink-950/20 text-rose-500 dark:text-rose-400 mb-6 shadow-lg">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-serif font-semibold text-slate-800 dark:text-slate-100 mb-3">
            没有权限访问
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            您需要管理员权限才能访问此页面。如有疑问，请联系系统管理员。
          </p>
        </div>
      </div>
    )
  }

  const [users, posts, totalUsers, totalPosts, totalComments, totalLikes] =
    await Promise.all([
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
        take: 10,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.like.count(),
    ])

  const stats = [
    {
      label: "总用户数",
      value: totalUsers,
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
      textColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "总帖子数",
      value: totalPosts,
      icon: FileText,
      color: "from-gold-400 to-gold-500",
      bgColor: "bg-gold-50 dark:bg-gold-950/20",
      textColor: "text-gold-600 dark:text-gold-400",
    },
    {
      label: "总评论数",
      value: totalComments,
      icon: MessageSquare,
      color: "from-sky-500 to-sky-600",
      bgColor: "bg-sky-50 dark:bg-sky-950/20",
      textColor: "text-sky-600 dark:text-sky-400",
    },
    {
      label: "总点赞数",
      value: totalLikes,
      icon: TrendingUp,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-950/20",
      textColor: "text-rose-600 dark:text-rose-400",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-indigo-950">
      {/* Admin Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-28 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  管理员仪表盘
                </h1>
                <p className="text-sm text-indigo-300/50">北京二中经开区学校 · 校园论坛管理后台</p>
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
                className="rounded-2xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-indigo-800/40 px-2 py-0.5 rounded-full">
                    实时
                  </span>
                </div>
                <div className={`text-3xl font-mono font-bold ${stat.textColor}`}>
                  <CountUp end={stat.value} duration={2000} />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Users Management */}
        <ScrollReveal delay={0.1}>
          <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-indigo-800/40">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">用户管理</h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                  共 {users.length} 位用户
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-indigo-800/40 bg-slate-50/50 dark:bg-indigo-950/30">
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      用户
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      邮箱
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      角色
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">
                      注册时间
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300 hidden lg:table-cell">
                      活跃
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-indigo-800/30">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-indigo-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 text-indigo-700 dark:text-indigo-200">
                              {(user.name ?? user.email ?? "U").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-100 block">
                              {user.name ?? "未命名"}
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 sm:hidden">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            user.role === "ADMIN"
                              ? "border-gold-400/40 bg-gold-50 dark:bg-gold-950/20 text-gold-600 dark:text-gold-400 text-[11px]"
                              : "border-slate-200 dark:border-indigo-700 text-slate-600 dark:text-slate-300 text-[11px]"
                          }
                        >
                          {user.role === "ADMIN" ? "管理员" : "学生"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(user.createdAt).split(" ")[0]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
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

        {/* Recent Posts */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-indigo-800/40">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">最近帖子</h2>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                  最近 10 条
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-indigo-800/40 bg-slate-50/50 dark:bg-indigo-950/30">
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      标题
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                      作者
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      分类
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300 hidden md:table-cell">
                      互动
                    </th>
                    <th className="text-left px-6 py-4 font-medium text-slate-600 dark:text-slate-300 hidden lg:table-cell">
                      发布时间
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-indigo-800/30">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-indigo-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <a
                          href={`/post/${post.id}`}
                          className="font-medium text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate block max-w-[200px] sm:max-w-xs"
                        >
                          <span className="flex items-center gap-1">
                            {post.title}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                          </span>
                        </a>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.image ?? undefined} />
                            <AvatarFallback className="text-[10px] bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200">
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
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">
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
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {formatDate(post.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ScrollReveal>

        {/* System Status */}
        <ScrollReveal delay={0.2}>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 border border-indigo-800/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-gold-400" />
              <h3 className="text-sm font-semibold text-white">系统状态</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xs text-indigo-300/50 mb-1">数据库状态</div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-emerald-400">正常</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-indigo-300/50 mb-1">用户活跃度</div>
                <span className="text-sm text-white">{totalUsers > 0 ? "活跃" : "-"}</span>
              </div>
              <div className="text-center">
                <div className="text-xs text-indigo-300/50 mb-1">内容健康度</div>
                <span className="text-sm text-white">良好</span>
              </div>
              <div className="text-center">
                <div className="text-xs text-indigo-300/50 mb-1">系统版本</div>
                <span className="text-sm text-white font-mono">v1.0.0</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
