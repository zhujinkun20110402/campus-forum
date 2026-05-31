import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { BanUserButton } from "@/components/admin/ban-user-button"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">没有权限访问</h1>
        <p className="text-gray-500 mt-2">您需要管理员权限才能访问此页面。</p>
      </div>
    )
  }

  const [users, posts, totalUsers, totalPosts, totalComments] =
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
            },
          },
          category: true,
        },
      }),
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
    ])

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">管理员仪表盘</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总用户数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalUsers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总帖子数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalPosts}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总评论数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalComments}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    用户
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    邮箱
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    角色
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    注册时间
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name ?? ""}
                          />
                          <AvatarFallback className="text-xs">
                            {(user.name ?? user.email ?? "U").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">
                          {user.name ?? "未命名"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          user.role === "ADMIN" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "ADMIN" && (
                        <BanUserButton userId={user.id} userName={user.name ?? user.email ?? "未知用户"} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近帖子</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    标题
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    作者
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    分类
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">
                    发布时间
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <a
                        href={`/post/${post.id}`}
                        className="font-medium text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {post.title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {post.author.name ?? post.author.email}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{post.category.name}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(post.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}