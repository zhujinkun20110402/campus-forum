import Link from "next/link"
import { CalendarClock, Megaphone, Trophy, Users } from "lucide-react"
import { ChallengeForm } from "@/components/challenges/challenge-form"
import { UserAvatar } from "@/components/user/user-avatar"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { publishedCondition } from "@/lib/post-visibility"
import { getFeatureRep, hasFeature } from "@/lib/reputation-milestones"
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

export default async function ChallengesPage() {
  const user = await requireUser("/challenges")
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { raputation: true },
  })
  const reputation = dbUser?.raputation ?? 0
  const canCreate = hasFeature(reputation, "topicChallenge")
  const unlockRep = getFeatureRep("topicChallenge") ?? 6800

  const [active, past] = await Promise.all([
    prisma.topicChallenge.findMany({
      where: { endsAt: { gt: new Date() } },
      orderBy: { endsAt: "asc" },
      include: {
        createdBy: { select: { id: true, name: true, image: true, role: true, raputation: true } },
        _count: { select: { posts: { where: publishedCondition() } } },
      },
    }),
    prisma.topicChallenge.findMany({
      where: { endsAt: { lte: new Date() } },
      orderBy: { endsAt: "desc" },
      take: 6,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { posts: { where: publishedCondition() } } },
      },
    }),
  ])

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="13"
        eyebrow="TOPIC CHALLENGES"
        title="一个话题，把全校拉进同一场对话"
        description="由高声望成员发起，限时进行。发帖时选择对应话题就算参与，结束后按点赞与讨论热度评出热门作品。"
        icon={Megaphone}
        accentClass="bg-[#c8d7ef]"
        compact
      />

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-10">
            <section>
              <EditorialHeading
                index="01"
                eyebrow="ONGOING"
                title="进行中的挑战"
                meta={`${active.length} 个`}
              />
              {active.length === 0 ? (
                <EditorialPanel className="mt-7 p-8 text-center">
                  <CalendarClock className="mx-auto h-9 w-9 text-[#e4532f]" />
                  <p className="mt-3 font-serif text-xl font-bold">暂时没有进行中的挑战</p>
                  <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">
                    等一位高声望的同学发起，或者你自己来当第一个。
                  </p>
                </EditorialPanel>
              ) : (
                <ul className="mt-7 space-y-4">
                  {active.map((challenge) => (
                    <li key={challenge.id}>
                      <Link
                        href={`/challenges/${challenge.id}`}
                        className="group block border-2 border-[#191914] bg-[#fffaf0] p-5 shadow-[5px_5px_0_#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_#f5f0e5]"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="border border-[#191914] bg-[#c8d7ef] px-2 py-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#191914] dark:border-[#f5f0e5]">
                            进行中
                          </span>
                          <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-[#e4532f]">
                            {remainingLabel(challenge.endsAt)}
                          </span>
                          <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">
                            <Users className="h-3 w-3" />
                            {challenge._count.posts} 篇参与
                          </span>
                        </div>
                        <h3 className="mt-3 font-serif text-xl font-bold group-hover:text-[#d44120] dark:group-hover:text-[#ff8a68]">
                          {challenge.title}
                        </h3>
                        {challenge.description && (
                          <p className="mt-2 text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
                            {challenge.description}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-2 border-t border-[#191914]/15 pt-3 dark:border-white/15">
                          <UserAvatar
                            name={challenge.createdBy.name}
                            image={challenge.createdBy.image}
                            role={challenge.createdBy.role}
                            size="sm"
                          />
                          <span className="text-xs text-[#777268] dark:text-[#989389]">
                            {challenge.createdBy.name ?? "未命名用户"} 发起 · 截止 {formatDate(challenge.endsAt)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {past.length > 0 && (
              <section>
                <EditorialHeading index="02" eyebrow="ARCHIVE" title="往期挑战" meta={`${past.length} 个`} />
                <ul className="mt-7 divide-y-2 divide-[#191914]/15 border-2 border-[#191914]/25 dark:divide-white/15 dark:border-white/25">
                  {past.map((challenge) => (
                    <li key={challenge.id}>
                      <Link
                        href={`/challenges/${challenge.id}`}
                        className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f2eadc] dark:hover:bg-[#24231e]"
                      >
                        <Trophy className="h-4 w-4 shrink-0 text-[#918b80]" />
                        <span className="min-w-0 flex-1 truncate font-serif text-base font-bold">
                          {challenge.title}
                        </span>
                        <span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">
                          {challenge._count.posts} 篇 · 已结束
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {canCreate ? (
              <ChallengeForm unlockRep={unlockRep} />
            ) : (
              <div className="border-2 border-[#191914]/30 bg-[#fffaf0] p-5 dark:border-white/30 dark:bg-[#191914]">
                <div className="flex items-center gap-2 border-b-2 border-[#191914]/25 pb-3 dark:border-white/25">
                  <Megaphone className="h-4 w-4 text-[#918b80]" />
                  <h3 className="font-serif text-lg font-bold">发起话题挑战</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-[#777268] dark:text-[#989389]">
                  声望达到 <span className="font-bold text-[#e4532f]">{unlockRep}</span> 解锁发起资格。
                  你当前声望 {reputation}，还差 {Math.max(0, unlockRep - reputation)}。
                </p>
                <Link
                  href="/reputation"
                  className="mt-4 flex h-10 items-center justify-center border-2 border-[#191914] bg-[#f3c84b] font-mono text-[10px] font-bold tracking-[0.12em] text-[#191914] dark:border-[#f5f0e5]"
                >
                  查看声望之路
                </Link>
              </div>
            )}

            <div className="border-2 border-[#191914] bg-[#191914] p-5 text-[#f5f0e5] dark:border-[#f5f0e5]">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#d9ef61]">HOW IT WORKS</p>
              <ol className="mt-4 space-y-3 text-xs leading-6 text-white/60">
                <li>1 · 挑战是限时的，通常几天到几周</li>
                <li>2 · 发帖时在表单里选择话题即算参与</li>
                <li>3 · 结束后按热度整理成往期存档</li>
              </ol>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
