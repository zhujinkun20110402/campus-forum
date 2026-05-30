import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { PostList } from "@/components/post/post-list"
import {
  BookOpen,
  ShoppingBag,
  Search,
  CalendarDays,
  TrendingUp,
  MessageCircle,
  Users,
  ArrowRight,
} from "lucide-react"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  study: <BookOpen className="h-6 w-6" />,
  secondhand: <ShoppingBag className="h-6 w-6" />,
  lostfound: <Search className="h-6 w-6" />,
  activity: <CalendarDays className="h-6 w-6" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  study: "from-blue-500 to-indigo-600",
  secondhand: "from-orange-400 to-rose-500",
  lostfound: "from-emerald-400 to-teal-600",
  activity: "from-purple-400 to-violet-600",
}

const CATEGORY_DESC: Record<string, string> = {
  study: "分享学习资料，探讨知识难题",
  secondhand: "闲置物品交易，物尽其用",
  lostfound: "失物招领，互帮互助",
  activity: "校园活动发布与报名",
}

export default async function HomePage() {
  const [posts, categories, totalStats] = await Promise.all([
    prisma.post.findMany({
      take: 12,
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
    }),
    prisma.category.findMany(),
    prisma.$transaction([
      prisma.post.count(),
      prisma.comment.count(),
      prisma.user.count(),
    ]),
  ])

  const [totalPosts, totalComments, totalUsers] = totalStats

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-950 dark:via-indigo-950 dark:to-gray-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              北京二中经开区学校论坛
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100 dark:text-blue-200">
              学习交流 · 二手交易 · 失物招领 · 校园活动
            </p>
            <div className="mt-8 flex items-center justify-center gap-6 sm:gap-10">
              <div className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">
                  {totalPosts}
                </div>
                <div className="mt-1 text-sm text-blue-200 dark:text-blue-300">
                  帖子
                </div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">
                  {totalComments}
                </div>
                <div className="mt-1 text-sm text-blue-200 dark:text-blue-300">
                  评论
                </div>
              </div>
              <div className="h-10 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl">
                  {totalUsers}
                </div>
                <div className="mt-1 text-sm text-blue-200 dark:text-blue-300">
                  成员
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                href="/post/new"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl dark:bg-gray-100 dark:text-blue-800 dark:hover:bg-white"
              >
                发布新帖
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              版块导航
            </h2>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            探索你感兴趣的内容
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className={`mb-3 inline-flex rounded-xl bg-gradient-to-br ${
                  CATEGORY_COLORS[category.slug] ?? "from-gray-400 to-gray-600"
                } p-3 text-white`}
              >
                {CATEGORY_ICONS[category.slug] ?? (
                  <MessageCircle className="h-6 w-6" />
                )}
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {CATEGORY_DESC[category.slug] ?? "查看相关内容"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                最新帖子
              </h2>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              看看大家都在讨论什么
            </p>
          </div>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 py-20 text-center">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-4 text-gray-500 dark:text-gray-400 text-lg">
              还没有帖子，快来发布第一条吧！
            </p>
            <Link
              href="/post/new"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              开始发帖
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <PostList posts={posts} />
        )}
      </section>
    </div>
  )
}