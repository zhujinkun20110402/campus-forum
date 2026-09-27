"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { votePoll } from "@/lib/poll-actions"
import type { PollOption } from "@/lib/poll"

interface PollBlockProps {
  postId: string
  options: PollOption[]
  counts: Record<string, number>
  myVote: string | null
}

/** 投票帖选项区：未投票时可点击投票，投出后展示结果（每人一票） */
export function PollBlock({ postId, options, counts, myVote }: PollBlockProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [pendingOption, setPendingOption] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const voted = myVote !== null
  const totalVotes = options.reduce((sum, option) => sum + (counts[option.id] ?? 0), 0)

  const handleVote = (optionId: string) => {
    if (voted || isPending) return
    setMessage(null)
    setPendingOption(optionId)
    startTransition(async () => {
      const result = await votePoll(postId, optionId)
      if (result && "message" in result) {
        setMessage(result.message ?? null)
      } else {
        router.refresh()
      }
      setPendingOption(null)
    })
  }

  return (
    <div className="mt-8 border-2 border-[#191914] bg-[#f6f1e6] p-4 dark:border-[#f5f0e5] dark:bg-[#191914] sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b-2 border-[#191914] pb-3 dark:border-[#f5f0e5]">
        <p className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.14em] text-[#e4532f]">
          <BarChart3 className="h-3.5 w-3.5" />
          POLL · 投票
        </p>
        <p className="font-mono text-[9px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">
          {totalVotes} 票
        </p>
      </div>

      <ul className="mt-4 space-y-2.5">
        {options.map((option) => {
          const count = counts[option.id] ?? 0
          const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const isMine = myVote === option.id

          if (!voted) {
            return (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => handleVote(option.id)}
                  disabled={isPending}
                  className="flex w-full items-center justify-between gap-3 border-2 border-[#191914] bg-[#fffaf0] px-4 py-3 text-left text-sm font-bold text-[#191914] transition-transform hover:-translate-y-0.5 disabled:opacity-60 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
                >
                  <span className="min-w-0 truncate">{option.text}</span>
                  {pendingOption === option.id ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#e4532f]" />
                  ) : (
                    <span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
                      投这一项
                    </span>
                  )}
                </button>
              </li>
            )
          }

          return (
            <li key={option.id}>
              <div
                className={cn(
                  "relative overflow-hidden border-2 px-4 py-3",
                  isMine
                    ? "border-[#191914] bg-[#d9ef61] text-[#191914] dark:border-[#f5f0e5]"
                    : "border-[#191914]/30 bg-[#fffaf0] text-[#191914] dark:border-white/30 dark:bg-[#11110f] dark:text-[#f5f0e5]"
                )}
              >
                {/* 结果条 */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-0 left-0",
                    isMine ? "bg-[#c3dd45]" : "bg-[#191914]/10 dark:bg-white/10"
                  )}
                  style={{ width: `${percent}%` }}
                />
                <span className="relative flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
                    {isMine && <Check className="h-3.5 w-3.5 shrink-0" />}
                    <span className="truncate">{option.text}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] font-bold">
                    {percent}% · {count}
                  </span>
                </span>
              </div>
            </li>
          )
        })}
      </ul>

      {!voted && (
        <p className="mt-3 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
          每人一票 · 投出后不可修改
        </p>
      )}

      {message && (
        <p className="mt-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
