import Link from "next/link"
import { ArrowUpRight, Crown, Medal, MessageSquare, NotebookPen, Trophy, Users } from "lucide-react"
import { ChampionCrown } from "@/components/reputation/champion-crown"
import { LevelBadge } from "@/components/reputation/level-badge"
import { FollowButton } from "@/components/social/follow-button"
import { UserAvatar } from "@/components/user/user-avatar"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { getCompetitiveRank, getLeaderboard } from "@/lib/social"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const viewer = await requireUser("/leaderboard")
  const [leaders, viewerRank] = await Promise.all([getLeaderboard(50), getCompetitiveRank(viewer.id)])
  const followed = leaders.length
    ? await prisma.follow.findMany({
        where: { followerId: viewer.id, followingId: { in: leaders.map((user) => user.id) } },
        select: { followingId: true },
      })
    : []
  const followedIds = new Set(followed.map((item) => item.followingId))
  const podium = leaders.slice(0, 3)
  const remaining = leaders.slice(3)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="12"
        eyebrow="CAMPUS REPUTATION"
        title="校园声望排行榜"
        description="记录持续创作、认真回应与真实互动。管理员不参与普通成员排名，让每一位同学都在同一套规则下成长。"
        icon={Trophy}
        accentClass="bg-[#f3c84b]"
        compact
      >
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.12em] dark:border-[#f5f0e5] dark:bg-[#191914]"><Users className="h-3.5 w-3.5 text-[#e4532f]" />TOP {leaders.length}</span>
          <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#191914] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.12em] text-[#f5f0e5] dark:border-[#f5f0e5]">{viewerRank ? `MY RANK #${String(viewerRank).padStart(2, "0")}` : "ADMIN / HONORARY"}</span>
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <EditorialHeading index="01" eyebrow="THE PODIUM" title="本期领跑者" meta="按声望降序 · 同分先到者优先" />

          {podium.length ? (
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {podium.map((user, index) => {
                const rank = index + 1
                const champion = rank === 1
                return (
                  <ScrollReveal key={user.id} delay={index * 0.08} className={cn(champion && "lg:-translate-y-3")}>
                    <article className={cn(
                      "relative h-full overflow-hidden border-2 border-[#191914] p-6 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5]",
                      champion ? "bg-[#191914] text-[#f5f0e5]" : rank === 2 ? "bg-[#fffaf0] dark:bg-[#292821] dark:text-[#f5f0e5]" : "bg-[#f2d0b2]"
                    )}>
                      <div className="flex items-start justify-between gap-4">
                        <span className={cn("font-mono text-4xl font-bold", champion ? "text-[#d9ef61]" : "text-[#d44120]")}>#{String(rank).padStart(2, "0")}</span>
                        {champion ? <ChampionCrown /> : <Medal className={cn("h-8 w-8", rank === 2 ? "text-[#777268] dark:text-[#c0bbb1]" : "text-[#d44120]")} />}
                      </div>
                      <Link href={`/profile/${user.id}`} className="mt-6 flex w-fit items-center gap-3">
                        <div className={cn(champion && "champion-frame rounded-full")}><UserAvatar name={user.name} image={user.image} size="xl" /></div>
                      </Link>
                      <Link href={`/profile/${user.id}`} className={cn("mt-5 block font-serif text-2xl font-bold", champion ? "hover:text-[#d9ef61]" : "hover:text-[#d44120]")}>{user.name ?? "未命名用户"}</Link>
                      <LevelBadge raputation={user.raputation} size="xs" />
                      <p className={cn("mt-3 line-clamp-2 min-h-10 text-xs leading-5", champion ? "text-white/50" : "text-[#69655d] dark:text-[#aaa69c]")}>{user.bio || "持续参与，让认真表达被更多人看见。"}</p>
                      <div className={cn("mt-5 grid grid-cols-3 border-y py-3 text-center font-mono text-[9px]", champion ? "border-white/20" : "border-[#191914]/20 dark:border-white/20")}>
                        <span><strong className="block text-base">{user.raputation}</strong>声望</span>
                        <span><strong className="block text-base">{user._count.posts}</strong>帖子</span>
                        <span><strong className="block text-base">{user._count.followers}</strong>粉丝</span>
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-2">
                        {viewer.id !== user.id ? <FollowButton targetUserId={user.id} initialFollowing={followedIds.has(user.id)} compact /> : <span className="font-mono text-[9px] font-bold">THIS IS YOU</span>}
                        <Link href={`/profile/${user.id}`} className={cn("flex h-9 w-9 items-center justify-center border", champion ? "border-white/40 hover:bg-[#d9ef61] hover:text-[#191914]" : "border-[#191914] hover:bg-[#f3c84b] dark:border-[#f5f0e5]")} aria-label="查看主页"><ArrowUpRight className="h-4 w-4" /></Link>
                      </div>
                    </article>
                  </ScrollReveal>
                )
              })}
            </div>
          ) : <EditorialPanel className="mt-8 py-20 text-center"><Crown className="mx-auto h-10 w-10 text-[#e4532f]" /><p className="mt-4 font-serif text-xl font-bold">排行榜正在等待第一位成员</p></EditorialPanel>}

          {remaining.length > 0 && (
            <section className="mt-16">
              <EditorialHeading index="02" eyebrow="FULL STANDINGS" title="完整排名" meta={`展示前 ${leaders.length} 名`} />
              <EditorialPanel className="mt-7 overflow-hidden">
                {remaining.map((user, index) => (
                  <div key={user.id} className="grid gap-4 border-b border-[#191914]/15 p-4 last:border-b-0 dark:border-white/15 sm:grid-cols-[48px_auto_minmax(0,1fr)_auto] sm:items-center sm:px-6">
                    <span className="font-mono text-lg font-bold text-[#918b80]">#{String(index + 4).padStart(2, "0")}</span>
                    <Link href={`/profile/${user.id}`}><UserAvatar name={user.name} image={user.image} size="md" /></Link>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><Link href={`/profile/${user.id}`} className="font-bold hover:text-[#d44120]">{user.name ?? "未命名用户"}</Link><LevelBadge raputation={user.raputation} size="xs" /></div>
                      <div className="mt-1 flex gap-3 font-mono text-[9px] text-[#918b80]"><span className="flex items-center gap-1"><NotebookPen className="h-3 w-3" />{user._count.posts}</span><span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{user._count.comments}</span><span className="flex items-center gap-1"><Users className="h-3 w-3" />{user._count.followers}</span></div>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end"><strong className="font-mono text-lg">{user.raputation}</strong>{viewer.id !== user.id && <FollowButton targetUserId={user.id} initialFollowing={followedIds.has(user.id)} compact />}</div>
                  </div>
                ))}
              </EditorialPanel>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
