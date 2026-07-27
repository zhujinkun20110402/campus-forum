import { Radio, Sparkles } from "lucide-react"
import { CampusStatusCard } from "@/components/presence/campus-status-card"
import { DailyCheckInCard } from "@/components/presence/daily-check-in-card"
import { StatusComposer } from "@/components/presence/status-composer"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { getOwnCampusStatus, getVisibleCampusStatuses } from "@/lib/campus-status"
import { getCheckInStatus } from "@/lib/daily-check-in"
import { requireUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function StatusPage() {
  const user = await requireUser("/status")
  const [statuses, currentStatus, checkInStatus] = await Promise.all([
    getVisibleCampusStatuses(user.id, 50),
    getOwnCampusStatus(user.id),
    getCheckInStatus(user.id),
  ])

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero index="13" eyebrow="CAMPUS PRESENCE" title="今天，你在校园的哪一刻？" description="留下一条只存在 24 小时的状态。分享此刻、寻找同伴，也允许自己安静地经过。" icon={Radio} accentClass="bg-[#b9ddbd]" compact>
        <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.12em] dark:border-[#f5f0e5] dark:bg-[#191914]"><Sparkles className="h-3.5 w-3.5 text-[#e4532f]" />{statuses.length} SIGNALS ONLINE</span>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-24">
            <DailyCheckInCard initialStatus={checkInStatus} />
            <StatusComposer currentStatus={currentStatus} />
          </aside>

          <section>
            <EditorialHeading index="01" eyebrow="LIVE SIGNALS" title="校园此刻" meta="按最新状态排列" />
            {statuses.length ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">{statuses.map((status) => <CampusStatusCard key={status.id} status={status} viewerId={user.id} />)}</div>
            ) : (
              <EditorialPanel className="mt-7 py-20 text-center"><Radio className="mx-auto h-10 w-10 text-[#e4532f]" /><p className="mt-4 font-serif text-2xl font-bold">校园信号暂时安静</p><p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">你的状态可以成为今天的第一束信号。</p></EditorialPanel>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
