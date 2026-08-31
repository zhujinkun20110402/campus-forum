import Link from "next/link"
import { Award, Check, ChevronRight, Gift, Map, Package, Sparkles, Ticket, Zap } from "lucide-react"
import { LevelBadge } from "@/components/reputation/level-badge"
import { EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { getLevelInfo, getLevelProgress } from "@/lib/reputation"
import {
  MILESTONES,
  TITLES,
  getBalances,
  getChestCount,
  getChestThreshold,
  rollChest,
  type MilestoneKind,
} from "@/lib/reputation-milestones"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"
import { requireUser } from "@/lib/session"

const kindMeta: Record<MilestoneKind, { label: string; icon: typeof Zap; chip: string }> = {
  feature: { label: "功能", icon: Zap, chip: "bg-[#ff6b43]" },
  consumable: { label: "消耗", icon: Package, chip: "bg-[#d9ef61]" },
  decorative: { label: "装饰", icon: Award, chip: "bg-[#c8d7ef]" },
  chest: { label: "宝箱", icon: Gift, chip: "bg-[#f3c84b]" },
}

export default async function ReputationPage() {
  const user = await requireUser("/reputation")
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      raputation: true,
      role: true,
      equippedTitle: true,
      pinCardsUsedCount: true,
      anonCardsUsedCount: true,
      inviteQuotaUsed: true,
    },
  })
  if (!dbUser) return null

  const rep = dbUser.raputation
  const level = getLevelInfo(rep, dbUser.role)
  const progress = getLevelProgress(rep, dbUser.role)
  const balances = getBalances(rep, user.id, {
    pinCards: dbUser.pinCardsUsedCount,
    anonCards: dbUser.anonCardsUsedCount,
    inviteQuota: dbUser.inviteQuotaUsed,
  })

  const chestCount = getChestCount(rep)
  const openedChests = Array.from({ length: chestCount }, (_, i) => ({
    index: i + 1,
    reward: rollChest(user.id, i + 1),
  }))
  const nextChestThreshold = getChestThreshold(chestCount + 1)
  const nextMilestone = MILESTONES.find((milestone) => milestone.rep > rep)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="12"
        eyebrow="REPUTATION ROAD"
        title="声望之路"
        description="声望只涨不减：每跨过一个节点就永久解锁一份奖励。发帖、评论、被赞、签到、帮助同学，都能让你在这条路上走得更远。"
        icon={Map}
        accentClass="bg-[#f3c84b]"
        compact
      >
        <div className="flex flex-wrap items-center gap-3">
          <LevelBadge raputation={rep} role={dbUser.role} size="md" />
          {dbUser.equippedTitle && (
            <span className="inline-flex items-center gap-1.5 border border-[#191914] bg-[#fffaf0] px-3 py-1.5 text-xs font-bold dark:border-[#f5f0e5] dark:bg-[#191914]">
              <Award className="h-3.5 w-3.5 text-[#e4532f]" />
              {TITLES.find((title) => title.id === dbUser.equippedTitle)?.name ?? dbUser.equippedTitle}
            </span>
          )}
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* 当前状态 */}
          <EditorialPanel className="p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">CURRENT STATUS</p>
                <p className="mt-2 font-serif text-3xl font-bold">
                  {rep} <span className="text-base font-normal text-[#777268] dark:text-[#989389]">声望</span>
                </p>
              </div>
              <div className="min-w-52 flex-1 sm:max-w-sm">
                <div className="flex items-center justify-between font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">
                  <span>{level.title}</span>
                  <span>{progress.next ? `距下一级 ${progress.remaining}` : "已满级"}</span>
                </div>
                <div className="mt-2 h-3 w-full border border-[#191914] bg-[#ece6da] dark:border-[#f5f0e5] dark:bg-[#292821]">
                  <div className="h-full bg-[#ff6b43]" style={{ width: `${progress.progress}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: "置顶卡", value: balances.pinCards, href: "/", icon: Sparkles },
                { label: "匿名卡", value: balances.anonCards, href: "/post/new", icon: Zap },
                { label: "邀请额度", value: balances.inviteQuota, href: "/invites", icon: Ticket },
              ].map(({ label, value, href, icon: Icon }) => (
                <Link key={label} href={href} className="group border-2 border-[#191914] bg-[#fffaf0] p-4 text-[#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]">
                  <div className="flex items-center justify-between">
                    <Icon className="h-4 w-4 text-[#e4532f]" />
                    <ChevronRight className="h-3.5 w-3.5 text-[#918b80] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-3 font-mono text-2xl font-bold">{value}</p>
                  <p className="mt-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">{label}</p>
                </Link>
              ))}
            </div>

            <p className="mt-5 text-xs leading-relaxed text-[#777268] dark:text-[#989389]">
              下一个节点：{nextMilestone ? (
                <>
                  <span className="font-bold text-[#191914] dark:text-[#f5f0e5]">{nextMilestone.rep} 声望</span>
                  · {nextMilestone.name} · 还差 <span className="font-bold text-[#d44120] dark:text-[#ff8a68]">{nextMilestone.rep - rep}</span>
                </>
              ) : (
                "你已经走完了全部节点，接下来每 2000 声望获得一个宝箱"
              )}
            </p>
          </EditorialPanel>

          {/* 时间轴 */}
          <section className="mt-12">
            <h2 className="flex items-center gap-3 border-b-2 border-[#191914] pb-4 font-serif text-2xl font-bold dark:border-[#f5f0e5]">
              <Map className="h-5 w-5 text-[#e4532f]" />
              完整路程
              <span className="ml-auto font-mono text-[9px] font-bold tracking-[0.12em] text-[#918b80]">
                {MILESTONES.filter((m) => m.rep <= rep).length} / {MILESTONES.length} 已解锁
              </span>
            </h2>

            <ol className="relative mt-10">
              {/* 链绳轨道 */}
              <div aria-hidden className="absolute bottom-6 left-[25px] top-6 border-l-2 border-dashed border-[#191914]/30 dark:border-white/30 sm:left-[29px]" />

              {MILESTONES.map((milestone, index) => {
                const reached = rep >= milestone.rep
                const meta = kindMeta[milestone.kind]
                const isNext = nextMilestone?.id === milestone.id
                // 宝箱序号：只数宝箱节点，避免与固定节点混排错位
                const chestNumber =
                  milestone.kind === "chest"
                    ? MILESTONES.slice(0, index + 1).filter((node) => node.kind === "chest").length
                    : 0
                const chestRolled =
                  milestone.kind === "chest" && reached
                    ? openedChests.find((chest) => chest.index === chestNumber)?.reward ?? null
                    : null

                return (
                  <li
                    key={milestone.id}
                    className="animate-chain-drop relative grid grid-cols-[52px_minmax(0,1fr)] gap-4 py-3 sm:grid-cols-[60px_minmax(0,1fr)] sm:gap-6 sm:py-3.5"
                    style={{ animationDelay: `${Math.min(index * 55, 900)}ms` }}
                  >
                    {/* 链节（菱形链环，铆钉移到上下连接点，不遮挡数字） */}
                    <div className="relative flex items-center justify-center">
                      <span
                        aria-hidden
                        className="absolute -top-1 left-1/2 z-0 h-2 w-2 -translate-x-1/2 rounded-full border border-[#191914]/45 bg-[#fffaf0] dark:border-white/45 dark:bg-[#191914]"
                      />
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-1/2 z-0 h-2 w-2 -translate-x-1/2 rounded-full border border-[#191914]/45 bg-[#fffaf0] dark:border-white/45 dark:bg-[#191914]"
                      />
                      <span
                        className={cn(
                          "relative z-10 flex h-11 w-11 rotate-45 items-center justify-center border-2 sm:h-12 sm:w-12",
                          reached
                            ? cn("border-[#191914] dark:border-[#f5f0e5]", meta.chip)
                            : "border-[#191914]/40 bg-[#e5ded1] dark:border-white/40 dark:bg-[#292821]",
                          isNext && "animate-chain-glow"
                        )}
                      >
                        <span
                          className={cn(
                            "-rotate-45 font-mono text-[11px] font-bold leading-none sm:text-xs",
                            reached ? "text-[#191914]" : "text-[#777268] dark:text-[#989389]"
                          )}
                        >
                          {milestone.kind === "chest" ? <Gift className="h-4 w-4" aria-hidden /> : milestone.rep}
                        </span>
                      </span>
                    </div>

                    {/* 节点卡 */}
                    <div
                      className={cn(
                        "relative border-2 p-4 sm:p-5",
                        reached
                          ? "border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]"
                          : "border-[#191914]/25 bg-transparent dark:border-white/25"
                      )}
                    >
                      {reached && (
                        <span
                          aria-hidden
                          className="animate-stamp-in absolute -right-1.5 -top-2.5 inline-flex rotate-[-8deg] items-center gap-1 border-2 border-[#326b42] bg-[#b9ddbd] px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.1em] text-[#275836] dark:border-[#b9ddbd] dark:bg-[#213426] dark:text-[#b9ddbd]"
                        >
                          <Check className="h-3 w-3" /> 已解锁
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-2 pr-16">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 border border-[#191914] px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-[#191914] dark:border-[#f5f0e5]",
                            meta.chip
                          )}
                        >
                          <meta.icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        <h3 className="font-serif text-base font-bold sm:text-lg">{milestone.name}</h3>
                        {isNext && (
                          <span className="animate-chain-glow inline-flex items-center gap-1 border-2 border-[#ff6b43] bg-[#ff6b43] px-2 py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-[#191914]">
                            NEXT · 还差 {milestone.rep - rep}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#69655d] dark:text-[#aaa69c]">
                        {milestone.description}
                      </p>
                      {chestRolled && (
                        <p className="mt-2 inline-flex items-center gap-1.5 border border-[#191914]/30 bg-[#f3c84b]/40 px-2 py-1 font-mono text-[9px] font-bold tracking-[0.08em] text-[#191914] dark:border-white/30 dark:text-[#f5f0e5]">
                          <Gift className="h-3 w-3" />
                          开出：{chestRolled.label}
                        </p>
                      )}
                      {!reached && !isNext && (
                        <p className="mt-2 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
                          还差 {milestone.rep - rep} 声望
                        </p>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>

            <p className="mt-8 text-center font-mono text-[9px] font-bold tracking-[0.12em] text-[#918b80]">
              {chestCount >= MILESTONES.filter((m) => m.kind === "chest").length
                ? `下一个宝箱：${nextChestThreshold} 声望 · 每 2000 声望永续循环`
                : `下一宝箱在 ${nextChestThreshold} 声望`}
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
