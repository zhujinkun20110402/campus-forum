"use client"

import { CalendarCheck, Flame, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { checkInToday } from "@/lib/presence-actions"
import { cn } from "@/lib/utils"

interface DailyCheckInCardProps {
  initialStatus: { checkedIn: boolean; streak: number; total: number }
  compact?: boolean
}

export function DailyCheckInCard({ initialStatus, compact = false }: DailyCheckInCardProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [message, setMessage] = useState(initialStatus.checkedIn ? "今天已经留下足迹" : "签到可获得 1 点声望")
  const [pending, startTransition] = useTransition()

  function handleCheckIn() {
    if (status.checkedIn || pending) return
    startTransition(async () => {
      try {
        const result = await checkInToday()
        setStatus({ checkedIn: true, streak: result.streak, total: result.total })
        setMessage(result.alreadyCheckedIn ? "今天已经签到" : `签到成功 · 声望 +${result.reward}`)
        router.refresh()
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "签到失败，请稍后重试")
      }
    })
  }

  return (
    <section className={cn(
      "border-2 border-[#191914] bg-[#f3c84b] text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5]",
      compact ? "p-5" : "p-6"
    )}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[0.16em]">DAILY CHECK-IN</p>
          <h2 className={cn("mt-2 font-serif font-bold", compact ? "text-xl" : "text-2xl")}>今天也在校园</h2>
        </div>
        <CalendarCheck className="h-6 w-6" />
      </div>

      <div className="mt-5 grid grid-cols-2 border-y border-[#191914]/25 py-3 text-center">
        <div>
          <p className="flex items-center justify-center gap-1 font-mono text-lg font-bold"><Flame className="h-4 w-4 text-[#d44120]" />{status.streak}</p>
          <p className="mt-1 text-[9px] text-[#665c40]">连续天数</p>
        </div>
        <div className="border-l border-[#191914]/20">
          <p className="font-mono text-lg font-bold">{status.total}</p>
          <p className="mt-1 text-[9px] text-[#665c40]">累计签到</p>
        </div>
      </div>

      <button
        type="button"
        disabled={status.checkedIn || pending}
        onClick={handleCheckIn}
        className={cn(
          "mt-5 flex h-11 w-full items-center justify-center gap-2 border-2 border-[#191914] text-sm font-bold transition-transform",
          status.checkedIn
            ? "cursor-default bg-[#fffaf0]/55 text-[#665c40]"
            : "bg-[#191914] text-[#f5f0e5] shadow-[3px_3px_0_#ff6b43] hover:-translate-y-0.5"
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
        {status.checkedIn ? "今日已签到" : "签到"}
      </button>
      <p className="mt-3 text-center text-[10px] text-[#665c40]" aria-live="polite">{message}</p>
    </section>
  )
}
