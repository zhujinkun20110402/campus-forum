"use client"

import Link from "next/link"
import { Megaphone, Search, BookOpen, Heart, ArrowUpRight } from "lucide-react"

const entries = [
  {
    slug: "announcement",
    name: "校园公告",
    desc: "学生会 & 校园通知",
    icon: Megaphone,
    gradient: "from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-300 dark:hover:border-amber-700",
    accent: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
  },
  {
    slug: "lostfound",
    name: "寻物启事",
    desc: "失物招领 · 互帮互助",
    icon: Search,
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    border: "hover:border-emerald-300 dark:hover:border-emerald-700",
    accent: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
  },
  {
    slug: "problem-discussion",
    name: "难题讨论",
    desc: "功能建设中",
    icon: BookOpen,
    gradient: "from-violet-500/10 to-purple-500/10",
    iconBg: "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
    border: "hover:border-violet-300 dark:hover:border-violet-700",
    accent: "group-hover:text-violet-600 dark:group-hover:text-violet-400",
    disabled: true,
  },
  {
    slug: "confession",
    name: "表白墙",
    desc: "匿名说出你的心声",
    icon: Heart,
    gradient: "from-rose-500/10 to-pink-500/10",
    iconBg: "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
    border: "hover:border-rose-300 dark:hover:border-rose-700",
    accent: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
    isPage: true,
  },
]

export function EntryTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
      {entries.map((entry) => {
        const Icon = entry.icon
        const href = entry.isPage ? "/confession" : `/category/${entry.slug}`

        if (entry.disabled) {
          return (
            <div
              key={entry.slug}
              className="group relative flex flex-col items-start gap-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/30 p-5 sm:p-6 cursor-not-allowed opacity-50"
            >
              <div className={`inline-flex rounded-xl p-3 ${entry.iconBg}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
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
            className={`group relative flex flex-col items-start gap-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden ${entry.border}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${entry.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative">
              <div className={`inline-flex rounded-xl p-3 ${entry.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <div className="relative flex-1">
              <div className="flex items-center gap-1">
                <h3 className={`text-sm font-medium text-stone-800 dark:text-stone-200 transition-colors ${entry.accent}`}>
                  {entry.name}
                </h3>
                <ArrowUpRight className="h-3 w-3 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-y-0.5 translate-x-0.5" />
              </div>
              <p className="mt-1 text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
                {entry.desc}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
