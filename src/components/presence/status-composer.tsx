"use client"

import { Clock3, Globe2, Loader2, Radio, Trash2, UserRoundCheck, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useState, useTransition } from "react"
import { deleteCampusStatus, publishCampusStatus } from "@/lib/presence-actions"
import { STATUS_MOODS, STATUS_VISIBILITIES } from "@/lib/status-constants"
import { cn } from "@/lib/utils"

interface OwnStatus {
  content: string
  mood: string
  visibility: string
  expiresAt: Date | string
}

const visibilityIcons = { PUBLIC: Globe2, FOLLOWERS: Users, MUTUAL: UserRoundCheck }

export function StatusComposer({ currentStatus }: { currentStatus: OwnStatus | null }) {
  const router = useRouter()
  const [content, setContent] = useState(currentStatus?.content ?? "")
  const [mood, setMood] = useState(currentStatus?.mood ?? STATUS_MOODS[0].value)
  const [visibility, setVisibility] = useState(currentStatus?.visibility ?? STATUS_VISIBILITIES[0].value)
  const [state, action, pending] = useActionState(publishCampusStatus, undefined)
  const [deleting, startDelete] = useTransition()

  function removeStatus() {
    startDelete(async () => {
      await deleteCampusStatus()
      setContent("")
      router.refresh()
    })
  }

  return (
    <section className="border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-[#191914]/20 pb-4 dark:border-white/20">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">MY SIGNAL</p>
          <h2 className="mt-2 font-serif text-xl font-bold">此刻的你</h2>
        </div>
        <Radio className="h-5 w-5 text-[#e4532f]" />
      </div>

      <form action={action} className="mt-5">
        <input type="hidden" name="mood" value={mood} />
        <input type="hidden" name="visibility" value={visibility} />

        <label htmlFor="status-content" className="sr-only">24 小时状态内容</label>
        <div className="relative">
          <textarea
            id="status-content"
            name="content"
            required
            maxLength={120}
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="此刻在做什么，或者想遇见怎样的同学？"
            className="w-full resize-none border-2 border-[#191914] bg-[#ece6da] p-4 pb-8 text-sm leading-7 outline-none transition-shadow placeholder:text-[#918b80] focus:shadow-[3px_3px_0_#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f]"
          />
          <span className="absolute bottom-2.5 right-3 font-mono text-[8px] text-[#918b80]">{content.length} / 120</span>
        </div>

        <div className="mt-5">
          <p className="mb-2 font-mono text-[8px] font-bold tracking-[0.13em] text-[#777268] dark:text-[#989389]">CURRENT MODE</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {STATUS_MOODS.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={mood === item.value}
                onClick={() => setMood(item.value)}
                className={cn(
                  "min-h-14 border border-[#191914] px-2 py-2 text-center text-[10px] font-bold transition-transform dark:border-[#f5f0e5]",
                  mood === item.value ? `${item.color} -translate-y-0.5 text-[#191914] shadow-[2px_2px_0_#191914]` : "hover:bg-[#ece6da] dark:hover:bg-[#292821]"
                )}
              >
                <span className="block">{item.label}</span>
                <span className="mt-1 block font-mono text-[7px] tracking-[0.1em] opacity-55">{item.english}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-2 font-mono text-[8px] font-bold tracking-[0.13em] text-[#777268] dark:text-[#989389]">AUDIENCE</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {STATUS_VISIBILITIES.map((item) => {
              const Icon = visibilityIcons[item.value]
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={visibility === item.value}
                  onClick={() => setVisibility(item.value)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 border text-[10px] font-bold dark:border-[#f5f0e5]",
                    visibility === item.value ? "border-[#191914] bg-[#d9ef61] text-[#191914]" : "border-[#191914]/35 hover:border-[#191914] dark:border-white/35"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={pending || !content.trim()} className="inline-flex h-11 flex-1 items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-5 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
            {currentStatus ? "更新状态" : "发布 24 小时状态"}
          </button>
          {currentStatus && (
            <button type="button" disabled={deleting} onClick={removeStatus} aria-label="删除当前状态" className="flex h-11 w-11 items-center justify-center border-2 border-[#191914] bg-[#fffaf0] text-[#777268] hover:bg-[#ffb4aa] hover:text-[#191914] dark:border-[#f5f0e5] dark:bg-[#191914]">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="mt-4 min-h-5 text-xs text-[#777268] dark:text-[#989389]" aria-live="polite">
          {state?.message ?? (currentStatus ? <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />当前状态有效；更新后会重新计时 24 小时</span> : "发布后持续 24 小时；再次发布会覆盖当前状态。")}
        </div>
      </form>
    </section>
  )
}
