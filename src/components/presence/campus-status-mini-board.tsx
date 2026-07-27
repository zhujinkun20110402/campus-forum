import Link from "next/link"
import { ArrowRight, Radio } from "lucide-react"
import { CampusStatusCard, type CampusStatusData } from "@/components/presence/campus-status-card"

export function CampusStatusMiniBoard({ statuses, viewerId }: { statuses: CampusStatusData[]; viewerId: string }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between border-b-2 border-[#191914] pb-3 dark:border-[#f5f0e5]">
        <div><p className="font-mono text-[8px] font-bold tracking-[0.14em] text-[#e4532f]">LIVE FOR 24H</p><h3 className="mt-1 font-serif text-lg font-bold">此刻在场</h3></div>
        <Radio className="h-5 w-5 text-[#e4532f]" />
      </div>
      {statuses.length ? (
        <div className="space-y-3">{statuses.slice(0, 3).map((status) => <CampusStatusCard key={status.id} status={status} viewerId={viewerId} compact />)}</div>
      ) : (
        <div className="border-2 border-dashed border-[#191914] bg-[#fffaf0] p-5 text-center dark:border-[#f5f0e5] dark:bg-[#191914]"><p className="text-xs text-[#777268] dark:text-[#989389]">还没有同学发出状态。</p></div>
      )}
      <Link href="/status" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#d44120] hover:text-[#7a9130]">进入今日在场 <ArrowRight className="h-3.5 w-3.5" /></Link>
    </section>
  )
}
