"use client"

import Link from "next/link"
import { useSyncExternalStore, useState } from "react"
import { ArrowRight, Bird, CalendarHeart, Heart, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * 七夕（农历七月初七）对应的公历日期表。
 * 动态取“下一个即将到来”的日期做倒计时，避免硬编码当前年份。
 */
const QIXI_DATES = [
  "2025-08-29",
  "2026-08-19",
  "2027-08-08",
  "2028-08-26",
  "2029-08-16",
  "2030-08-05",
]

const DISMISS_KEY = "qixi-banner-dismissed"
const DISMISS_DURATION = 24 * 60 * 60 * 1000

function getQixiCountdown(now: Date): { message: string } | null {
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  for (const raw of QIXI_DATES) {
    const [year, month, day] = raw.split("-").map(Number)
    const qixi = new Date(year, month - 1, day)
    if (qixi.getTime() < todayMidnight.getTime()) continue

    const days = Math.round((qixi.getTime() - todayMidnight.getTime()) / 86400000)
    if (days > 60) return null
    if (days === 0) return { message: "就是今天 · 祝有情人终成眷属" }
    if (days === 1) return { message: "明天七夕 · 别再让话烂在心里" }
    return { message: `距离七夕还有 ${days} 天` }
  }
  return null
}

const SERVER_SNAPSHOT = { dismissed: false, countdown: null as { message: string } | null }

let cachedSnapshot: typeof SERVER_SNAPSHOT | null = null

function readSnapshot() {
  let dismissed = false
  try {
    const saved = localStorage.getItem(DISMISS_KEY)
    if (saved) {
      const then = Number(saved)
      dismissed = Number.isFinite(then) && Date.now() - then < DISMISS_DURATION
    }
  } catch {
    // localStorage 不可用时忽略，横幅照常显示
  }

  const countdown = getQixiCountdown(new Date())
  const next = { dismissed, countdown }
  if (
    cachedSnapshot &&
    cachedSnapshot.dismissed === next.dismissed &&
    cachedSnapshot.countdown?.message === next.countdown?.message
  ) {
    return cachedSnapshot
  }
  cachedSnapshot = next
  return next
}

/** 其他标签页修改 localStorage、或窗口重新聚焦（跨天）时重新读取。 */
function subscribeToStore(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener("focus", onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("focus", onChange)
  }
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT
}

export function QixiBanner() {
  const [forceDismissed, setForceDismissed] = useState(false)
  const { dismissed, countdown } = useSyncExternalStore(subscribeToStore, readSnapshot, getServerSnapshot)

  if (dismissed || forceDismissed) return null

  function handleDismiss() {
    setForceDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // 忽略写入失败
    }
  }

  return (
    <section
      aria-label="七夕特别企划"
      className="relative z-30 px-3 pt-20 sm:px-5 sm:pt-24 lg:px-8"
    >
      <div className="relative mx-auto max-w-7xl overflow-hidden border-2 border-[#191914] bg-[#ffb4aa] text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#ffb4aa]">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -right-6 h-24 w-24 rotate-12 border-2 border-[#191914] bg-[#d9ef61] dark:border-[#f5f0e5] dark:bg-[#22221d]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-3 -top-3 h-12 w-12 rotate-12 border-2 border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#22221d]"
        />

        <div className="relative grid gap-5 p-5 pr-11 sm:p-6 sm:pr-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-8 lg:p-7 lg:pr-14">
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] font-bold tracking-[0.2em] text-[#e4532f]">
              <CalendarHeart className="h-3.5 w-3.5" aria-hidden />
              QIXI SPECIAL · 七夕特别企划
            </p>
            <h2 className="mt-3 font-serif text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              七夕快到啦，把没说出口的话
              <span className="relative mx-1 inline-block whitespace-nowrap px-1">
                写进表白墙
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-[0.06em] h-[0.3em] -rotate-1 bg-[#fffaf0]/85 dark:bg-[#ff6b43]"
                />
              </span>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#191914]/60 dark:text-[#f5f0e5]/60">
              匿名写下此刻心声，也许 TA 正在墙的那头等你。认真表达，也温柔回应。
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 md:flex-col md:items-stretch lg:flex-row lg:items-center">
            <div
              className={cn(
                "flex items-center gap-3 border-2 border-[#191914] bg-[#fffaf0] px-4 py-2.5 shadow-[3px_3px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#171713] dark:shadow-[3px_3px_0_#f5f0e5]",
                !countdown && "invisible"
              )}
            >
              <Heart className="h-4 w-4 shrink-0 animate-qixi-heartbeat text-[#e4532f]" aria-hidden />
              <span className="whitespace-nowrap font-mono text-xs font-bold tracking-[0.12em]">
                {countdown ? countdown.message : "距离七夕还有 1 天"}
              </span>
            </div>

            <Link
              href="/confession"
              className="group inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[#191914] bg-[#191914] px-5 py-2.5 text-sm font-bold text-[#fffaf0] shadow-[3px_3px_0_#d9ef61] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:bg-[#f5f0e5] dark:text-[#191914] dark:shadow-[3px_3px_0_#d9ef61]"
            >
              去表白墙看看
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute bottom-3 right-12 hidden rotate-6 text-[#191914]/15 md:block dark:text-[#f5f0e5]/15"
          >
            <Bird className="h-9 w-9" />
          </div>
        </div>

        <button
          type="button"
          aria-label="收起七夕横幅"
          onClick={handleDismiss}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center border border-transparent text-[#191914]/55 transition-colors hover:border-[#191914] hover:bg-[#fffaf0] hover:text-[#191914] dark:text-[#f5f0e5]/55 dark:hover:border-[#f5f0e5] dark:hover:bg-[#171713] dark:hover:text-[#f5f0e5]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  )
}
