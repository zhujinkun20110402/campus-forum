import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { formatDate } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

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
  })

  const comments = await prisma.comment.findMany({
    where: { authorId: id },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback className="text-lg dark:bg-blue-900 dark:text-blue-300">
                {(user.name ?? user.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user.name ?? "未命名用户"}
                </h1>
                {isOwnProfile && (
                  <Link href="/profile/settings">
                    <Button variant="outline" size="sm" className="shrink-0 dark:border-gray-700 dark:hover:bg-gray-800">
                      <Settings className="mr-1 h-3.5 w-3.5" />
                      编辑资料
                    </Button>
                  </Link>
                )}
              </div>
              {isOwnProfile && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                加入于 {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-6 mt-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user._count.posts}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">帖子</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {user._count.comments}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">评论</div>
            </div>
          </div>
          {user.bio && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {user.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="flex gap-2 mb-6">
          <Link
            href={`/profile/${id}?tab=posts`}
            className="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            我的帖子
          </Link>
          <Link
            href={`/profile/${id}?tab=comments`}
            className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            我的评论
          </Link>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">我的帖子</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              暂无帖子
            </p>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary">
                            {post.category.name}
                          </Badge>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        <span>{post._count.comments} 评论</span>
                        <span>{post._count.likes} 赞</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        <div className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">我的评论</h2>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              暂无评论
            </p>
          ) : (
            comments.map((comment) => (
              <Link key={comment.id} href={`/post/${comment.post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-900 dark:border-gray-800 dark:hover:border-gray-700">
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                      评论了帖子
                    </p>
                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                      {comment.post.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                      {comment.content}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {formatDate(comment.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}