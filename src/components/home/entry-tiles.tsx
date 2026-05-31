"use client"

import Link from "next/link"
import { Megaphone, Search, BookOpen, Heart } from "lucide-react"

const entries = [
  {
    slug: "announcement",
    name: "校园公告",
    desc: "学生会 & 校园通知",
    icon: Megaphone,
    color: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-200 dark:hover:border-amber-800",
  },
  {
    slug: "lostfound",
    name: "寻物启事",
    desc: "失物招领 · 互帮互助",
    icon: Search,
    color: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-200 dark:hover:border-emerald-800",
  },
  {
    slug: "problem-discussion",
    name: "难题讨论",
    desc: "功能建设中",
    icon: BookOpen,
    color: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400",
    border: "hover:border-violet-200 dark:hover:border-violet-800",
    disabled: true,
  },
  {
    slug: "confession",
    name: "表白墙",
    desc: "匿名说出你的心声",
    icon: Heart,
    color: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
    border: "hover:border-rose-200 dark:hover:border-rose-800",
    isPage: true,
  },
]

export function EntryTiles() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {entries.map((entry) => {
        const Icon = entry.icon
        const href = entry.isPage ? "/confession" : `/category/${entry.slug}`

        if (entry.disabled) {
          return (
            <div
              key={entry.slug}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-4 sm:p-5 cursor-not-allowed opacity-60"
            >
              <div className={`inline-flex rounded-xl p-3 ${entry.color}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  {entry.name}
                </h3>
                <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500">
                  {entry.desc}
                </p>
              </div>
            </div>
          )
        }

        return (
          <Link
            key={entry.slug}
            href={href}
            className={`group relative flex flex-col items-center gap-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-4 sm:p-5 transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 ${entry.border}`}
          >
            <div className={`inline-flex rounded-xl p-3 ${entry.color}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-stone-800 dark:text-stone-200">
                {entry.name}
              </h3>
              <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {entry.desc}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}