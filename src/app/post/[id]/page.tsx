import Link from "next/link"
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
import { ShareButton } from "@/components/post/share-button"
import { PinButton } from "@/components/post/pin-button"
import { isPostPinned } from "@/lib/pinned-posts"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { UserAvatar } from "@/components/user/user-avatar"
import { LevelBadge } from "@/components/reputation/level-badge"
import { MessageSquare, Clock, ArrowLeft } from "lucide-react"
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

  const [post, session, pinned] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true, role: true, raputation: true },
        },
        category: {
          select: { name: true, slug: true },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, image: true, role: true, raputation: true },
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
    isPostPinned(id),
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
        <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 mb-6">
          <Link href="/" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            首页
          </Link>
          <span>/</span>
          <Link href={`/category/${post.category.slug}`} className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
            {post.category.name}
          </Link>
          <span>/</span>
          <span className="text-stone-300 dark:text-stone-600 truncate max-w-[200px]">
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
            <span className="flex items-center gap-1 text-sm text-stone-400 dark:text-stone-500">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author */}
          {!isConfession && (
            <div className="flex items-center gap-3">
              <UserAvatar
                name={post.author.name}
                image={post.author.image}
                role={post.author.role}
                size="lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-stone-800 dark:text-stone-100">
                    {post.author.name}
                  </p>
                  <LevelBadge raputation={post.author.raputation} role={post.author.role} size="xs" showTitle={false} />
                </div>
                <p className="text-xs text-stone-400 dark:text-stone-500">作者</p>
              </div>
            </div>
          )}

          {isConfession && (
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center ring-2 ring-rose-100 dark:ring-rose-900/30">
                <span className="text-sm text-rose-400">?</span>
              </div>
              <div>
                <p className="font-medium text-stone-500 dark:text-stone-400">
                  匿名同学
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">表白墙</p>
              </div>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Post Content */}
      <ScrollReveal delay={0.1}>
        <article className="prose prose-stone dark:prose-invert max-w-none mb-8 prose-img:rounded-xl prose-a:text-amber-600">
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-5 border-y border-stone-200 dark:border-stone-800 mb-10">
          <LikeButton
            postId={post.id}
            likeCount={post._count.likes}
            isLiked={post.likes.some(
              (like) => like.userId === currentUser?.id
            )}
          />

          <button className="inline-flex items-center gap-2 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">{post._count.comments} 条评论</span>
            <span className="sm:hidden">{post._count.comments}</span>
          </button>

          <ShareButton postId={post.id} title={post.title} />

          {isAdmin && <PinButton postId={post.id} initialPinned={pinned} />}

          {(isAuthor || isAdmin) && (
            <DeleteButton postId={post.id} />
          )}
        </div>
      </ScrollReveal>

      {/* Comments */}
      <div className="mb-8">
        <ScrollReveal>
          <h2 className="font-serif text-xl font-semibold text-stone-800 dark:text-stone-100 mb-6">
            讨论区
            <span className="ml-2 text-sm font-normal text-stone-400 dark:text-stone-500">
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
