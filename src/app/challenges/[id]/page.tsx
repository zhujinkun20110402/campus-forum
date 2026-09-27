import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, CalendarClock, Megaphone, PenLine } from "lucide-react"
import { PostList } from "@/components/post/post-list"
import { UserAvatar } from "@/components/user/user-avatar"
import { EditorialHeading, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { publishedCondition } from "@/lib/post-visibility"
import { requireUser } from "@/lib/session"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

function remainingLabel(endsAt: Date) {
  const ms = endsAt.getTime() - Date.now()
  if (ms <= 0) return "已结束"
  const days = Math.floor(ms / 86_400_000)
  const hours = Math.floor((ms % 86_400_000) / 3_600_000)
  if (days > 0) return `还有 ${days} 天 ${hours} 小时`
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `还有 ${hours} 小时 ${minutes} 分`
}

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireUser(`/challenges/${id}`)

  const challenge = await prisma.topicChallenge.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true, image: true, role: true, raputation: true } },
      posts: {
        where: publishedCondition(),
        orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
        include: {
          author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  })

  if (!challenge) notFound()

  const ended = challenge.endsAt.getTime() <= Date.now()

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <section className="campus-paper border-b-2 border-[#191914] px-4 pb-12 pt-28 dark:border-[#f5f0e5] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <nav className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]" aria-label="面包屑">
            <Link href="/challenges" className="inline-flex items-center gap-1 hover:text-[#e4532f]">
              <ArrowLeft className="h-3 w-3" />挑战列表
            </Link>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span
              className={
                ended
                  ? "border border-[#191914]/40 px-2 py-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:border-white/40 dark:text-[#989389]"
                  : "border border-[#191914] bg-[#c8d7ef] px-2 py-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#191914] dark:border-[#f5f0e5]"
              }
            >
              {ended ? "已结束" : "进行中"}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#e4532f]">
              <CalendarClock className="h-3.5 w-3.5" />
              {ended ? `结束于 ${formatDate(challenge.endsAt)}` : remainingLabel(challenge.endsAt)}
            </span>
          </div>

          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
            {challenge.title}
          </h1>
          {challenge.description && (
            <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5c54] dark:text-[#aaa69c]">
              {challenge.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={`/profile/${challenge.createdBy.id}`} className="flex items-center gap-2">
              <UserAvatar
                name={challenge.createdBy.name}
                image={challenge.createdBy.image}
                role={challenge.createdBy.role}
                size="sm"
              />
              <span className="text-sm font-bold">
                {challenge.createdBy.name ?? "未命名用户"}
                <span className="ml-2 font-mono text-[9px] font-normal tracking-[0.1em] text-[#918b80]">发起人</span>
              </span>
            </Link>

            {!ended && (
              <Link
                href={`/post/new?challenge=${challenge.id}`}
                className="inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
              >
                <PenLine className="h-4 w-4" />
                发帖参与
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EditorialHeading
            index="01"
            eyebrow="ENTRIES"
            title="参与作品"
            meta={`${challenge.posts.length} 篇 · 按热度排序`}
          />
          <div className="mt-7">
            {challenge.posts.length > 0 ? (
              <PostList posts={challenge.posts} />
            ) : (
              <EditorialPanel className="p-8 text-center">
                <Megaphone className="mx-auto h-9 w-9 text-[#e4532f]" />
                <p className="mt-3 font-serif text-xl font-bold">还没有人参与</p>
                <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">
                  发帖时选择这个话题，你的作品就会出现在这里。
                </p>
              </EditorialPanel>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
