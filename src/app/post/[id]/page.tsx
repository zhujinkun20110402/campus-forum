import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { LikeButton } from "@/components/post/like-button"
import { CommentList } from "@/components/comment/comment-list"
import { CommentForm } from "@/components/comment/comment-form"
import { DeleteButton } from "@/components/post/delete-button"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [post, session] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
        },
        likes: true,
        _count: {
          select: { comments: true, likes: true },
        },
      },
    }),
    auth(),
  ])

  if (!post) {
    notFound()
  }

  const currentUser = session?.user
  const isAuthor = currentUser?.id === post.author.id
  const isAdmin = currentUser?.role === "ADMIN"

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href={`/category/${post.category.slug}`}>
            <Badge>{post.category.name}</Badge>
          </Link>
          <span className="text-sm text-gray-500">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 mb-8">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={post.author.image ?? undefined}
              alt={post.author.name ?? ""}
            />
            <AvatarFallback>
              {post.author.name?.charAt(0) ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{post.author.name}</p>
            <p className="text-sm text-gray-500">作者</p>
          </div>
        </div>
      </div>

      <article className="prose prose-gray max-w-none mb-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 mb-8">
        <LikeButton
          postId={post.id}
          likeCount={post._count.likes}
          isLiked={post.likes.some(
            (like) => like.userId === currentUser?.id
          )}
        />
        <span className="text-sm text-gray-500">
          {post._count.comments} 条评论
        </span>

        {(isAuthor || isAdmin) && (
          <DeleteButton postId={post.id} />
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          评论 ({post._count.comments})
        </h2>

        <CommentList
          comments={post.comments}
          currentUserId={currentUser?.id}
          isAdmin={isAdmin}
          postId={post.id}
        />

        <div className="mt-8">
          <CommentForm postId={post.id} />
        </div>
      </div>
    </div>
  )
}