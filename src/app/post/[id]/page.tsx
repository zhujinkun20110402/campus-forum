import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { LikeButton } from "@/components/post/like-button"
import { CommentList } from "@/components/comment/comment-list"
import { CommentForm } from "@/components/comment/comment-form"
import { DeleteButton } from "@/components/post/delete-button"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { MessageSquare, Share2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const categoryStyles: Record<string, string> = {
  announcement: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-950/60",
  lostfound: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60",
  confession: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/60",
  study: "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-950/60",
  activity: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/60",
  secondhand: "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-950/60",
}

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
  const isConfession = post.category.slug === "confession"

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <ScrollReveal>
        <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-6">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            首页
          </Link>
          <span>/</span>
          <Link href={`/category/${post.category.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            {post.category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-300 dark:text-slate-600 truncate max-w-[200px]">
            {post.title}
          </span>
        </div>
      </ScrollReveal>

      {/* Post Header */}
      <ScrollReveal delay={0.05}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Link href={`/category/${post.category.slug}`}>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-normal cursor-pointer transition-colors",
                  categoryStyles[post.category.slug] ?? "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                )}
              >
                {post.category.name}
              </Badge>
            </Link>
            <span className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          {!isConfession && (
            <div className="flex items-center gap-3">
              {post.author.image ? (
                <div className="relative h-11 w-11 rounded-full overflow-hidden ring-2 ring-slate-100 dark:ring-indigo-800">
                  <Image
                    src={post.author.image}
                    alt={post.author.name ?? ""}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 flex items-center justify-center ring-2 ring-slate-100 dark:ring-indigo-800">
                  <span className="text-sm font-medium text-indigo-700 dark:text-indigo-200">
                    {post.author.name?.charAt(0) ?? "?"}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-100">
                  {post.author.name}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">作者</p>
              </div>
            </div>
          )}

          {isConfession && (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center ring-2 ring-rose-100 dark:ring-rose-900/30">
                <span className="text-sm text-rose-400">?</span>
              </div>
              <div>
                <p className="font-medium text-slate-500 dark:text-slate-400">
                  匿名同学
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">表白墙</p>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Post Content */}
      <ScrollReveal delay={0.1}>
        <article className="prose prose-slate dark:prose-invert max-w-none mb-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </article>
      </ScrollReveal>

      {/* Actions Bar */}
      <ScrollReveal delay={0.15}>
        <div className="flex items-center gap-3 py-5 border-t border-b border-slate-200 dark:border-indigo-800/50 mb-10">
          <LikeButton
            postId={post.id}
            likeCount={post._count.likes}
            isLiked={post.likes.some(
              (like) => like.userId === currentUser?.id
            )}
          />

          <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-indigo-700 bg-white dark:bg-indigo-900/40 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-indigo-800/50 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span>{post._count.comments} 条评论</span>
          </button>

          <button
            onClick={async () => {
              "use client"
              try {
                await navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
                // Could add toast here
              } catch {}
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-indigo-700 bg-white dark:bg-indigo-900/40 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-indigo-800/50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>分享</span>
          </button>

          {(isAuthor || isAdmin) && (
            <DeleteButton postId={post.id} />
          )}
        </div>
      </ScrollReveal>

      {/* Comments */}
      <div className="mb-8">
        <ScrollReveal>
          <h2 className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-100 mb-6">
            讨论区
            <span className="ml-2 text-sm font-normal text-slate-400 dark:text-slate-500">
              ({post._count.comments})
            </span>
          </h2>
        </ScrollReveal>

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
