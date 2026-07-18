import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Clock, MessageSquare } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"
import { CommentForm } from "@/components/comment/comment-form"
import { CommentList } from "@/components/comment/comment-list"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { DeleteButton } from "@/components/post/delete-button"
import { LikeButton } from "@/components/post/like-button"
import { PinButton } from "@/components/post/pin-button"
import { ShareButton } from "@/components/post/share-button"
import { LevelBadge } from "@/components/reputation/level-badge"
import { EditorialHeading, EditorialPanel } from "@/components/ui/editorial"
import { UserAvatar } from "@/components/user/user-avatar"
import { prisma } from "@/lib/prisma"
import { cn, formatRelativeTime } from "@/lib/utils"
import { requireUser } from "@/lib/session"

const categoryStyles: Record<string, string> = {
  announcement: "bg-[#ff6b43]",
  lostfound: "bg-[#d9ef61]",
  confession: "bg-[#ffb4aa]",
  study: "bg-[#f3c84b]",
  activity: "bg-[#b9ddbd]",
  secondhand: "bg-[#f2d0b2]",
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const currentUser = await requireUser(`/post/${id}`)
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
      category: { select: { name: true, slug: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true, image: true, role: true, raputation: true } } },
      },
      likes: true,
      _count: { select: { comments: true, likes: true } },
    },
  })

  if (!post) notFound()

  const isAuthor = currentUser.id === post.author.id
  const isAdmin = currentUser.role === "ADMIN"
  const isConfession = post.category.slug === "confession"
  const pinned = post.pinned

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <section className="campus-paper border-b-2 border-[#191914] px-4 pb-14 pt-28 dark:border-[#f5f0e5] sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <nav className="flex min-w-0 items-center gap-2 font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]" aria-label="面包屑">
              <Link href="/" className="inline-flex shrink-0 items-center gap-1 hover:text-[#e4532f]"><ArrowLeft className="h-3 w-3" />HOME</Link>
              <span>/</span>
              <Link href={`/category/${post.category.slug}`} className="shrink-0 hover:text-[#e4532f]">{post.category.name}</Link>
              <span>/</span>
              <span className="truncate">ARTICLE</span>
            </nav>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href={`/category/${post.category.slug}`} className={cn("border-2 border-[#191914] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#191914] dark:border-[#f5f0e5]", categoryStyles[post.category.slug] ?? "bg-[#e5ded1]")}>
                {post.category.name}
              </Link>
              <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] text-[#777268] dark:text-[#989389]"><Clock className="h-3.5 w-3.5 text-[#e4532f]" />{formatRelativeTime(post.createdAt)}</span>
              {pinned && <span className="border border-[#191914] bg-[#f3c84b] px-2 py-1 font-mono text-[8px] font-bold text-[#191914] dark:border-[#f5f0e5]">PINNED</span>}
            </div>

            <h1 className="mt-6 max-w-4xl font-serif text-4xl font-bold leading-[1.12] tracking-[-0.045em] text-[#191914] dark:text-[#f5f0e5] sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            <div className="mt-8 flex items-center gap-3">
              {isConfession ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#191914] bg-[#ffb4aa] font-bold text-[#191914] dark:border-[#f5f0e5]">?</div>
              ) : (
                <Link href={`/profile/${post.author.id}`}><UserAvatar name={post.author.name} image={post.author.image} role={post.author.role} size="lg" /></Link>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{isConfession ? "匿名同学" : (post.author.name ?? "未命名用户")}</p>
                  {!isConfession && <LevelBadge raputation={post.author.raputation} role={post.author.role} size="xs" showTitle={false} />}
                </div>
                <p className="mt-1 font-mono text-[8px] tracking-[0.14em] text-[#918b80]">{isConfession ? "ANONYMOUS VOICE" : "CAMPUS AUTHOR"}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <EditorialPanel className="p-6 sm:p-10 lg:p-12">
              <article className="prose prose-stone max-w-none dark:prose-invert prose-a:text-[#d44120] prose-img:rounded-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{post.content}</ReactMarkdown>
              </article>

              <div className="mt-10 flex flex-wrap items-center gap-2 border-t-2 border-[#191914] pt-6 dark:border-[#f5f0e5]">
                <LikeButton postId={post.id} likeCount={post._count.likes} isLiked={post.likes.some((like) => like.userId === currentUser.id)} />
                <span className="inline-flex h-9 items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 text-sm font-bold dark:border-[#f5f0e5] dark:bg-[#191914]">
                  <MessageSquare className="h-4 w-4 text-[#e4532f]" /> {post._count.comments} 条评论
                </span>
                <ShareButton postId={post.id} title={post.title} />
                {isAdmin && <PinButton postId={post.id} initialPinned={pinned} />}
                {(isAuthor || isAdmin) && <DeleteButton postId={post.id} />}
              </div>
            </EditorialPanel>
          </ScrollReveal>

          <section className="mt-14">
            <EditorialHeading index="02" eyebrow="DISCUSSION" title="讨论区" meta={`${post._count.comments} 条回应`} />
            <div className="mt-7">
              <CommentList comments={post.comments} currentUserId={currentUser.id} isAdmin={isAdmin} postId={post.id} />
            </div>
            <EditorialPanel className="mt-7 p-5 sm:p-7">
              <p className="mb-4 font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">LEAVE A RESPONSE</p>
              <CommentForm postId={post.id} />
            </EditorialPanel>
          </section>
        </div>
      </main>
    </div>
  )
}
