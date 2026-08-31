"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Award, Check, Loader2, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { equipTitle, setProfileTheme } from "@/lib/reputation-actions"

interface TitleOption {
  id: string
  name: string
  description: string
}

interface ThemeOption {
  id: string
  name: string
  description: string
}

interface ReputationRewardsSettingsProps {
  equippedTitle: string | null
  profileTheme: string | null
  unlockedTitles: TitleOption[]
  themeUnlocked: boolean
  themeUnlockRep: number
  themes: ThemeOption[]
}

/** 声望之路奖励设置：称号装备 + 主页主题 */
export function ReputationRewardsSettings({
  equippedTitle,
  profileTheme,
  unlockedTitles,
  themeUnlocked,
  themeUnlockRep,
  themes,
}: ReputationRewardsSettingsProps) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const runAction = (key: string, action: () => Promise<{ message?: string } | { success?: boolean }>) => {
    setMessage(null)
    setPendingAction(key)
    startTransition(async () => {
      const result = await action()
      if (result && "message" in result) {
        setMessage(result.message ?? null)
      } else {
        router.refresh()
      }
      setPendingAction(null)
    })
  }

  const handleEquipTitle = (titleId: string | null) => {
    runAction(`title-${titleId ?? "none"}`, async () => {
      const formData = new FormData()
      if (titleId) formData.append("titleId", titleId)
      return equipTitle(formData)
    })
  }

  const handleSetTheme = (themeId: string) => {
    runAction(`theme-${themeId}`, async () => {
      const formData = new FormData()
      formData.append("themeId", themeId)
      return setProfileTheme(formData)
    })
  }

  return (
    <div className="space-y-8">
      {/* 称号 */}
      <div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#e4532f]" />
          <h3 className="text-sm font-bold">我的称号</h3>
        </div>
        {unlockedTitles.length === 0 ? (
          <p className="mt-3 border border-[#191914]/25 bg-[#ece6da]/50 px-4 py-3 text-xs leading-relaxed text-[#777268] dark:border-white/25 dark:bg-[#292821]/50 dark:text-[#989389]">
            还没有解锁任何称号。第一枚「自习室常客」在声望 1200 解锁，去
            <a href="/reputation" className="mx-1 font-bold text-[#d44120] underline decoration-2 underline-offset-2 dark:text-[#ff8a68]">声望之路</a>
            看看进度。
          </p>
        ) : (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {unlockedTitles.map((title) => {
              const equipped = equippedTitle === title.id
              return (
                <button
                  key={title.id}
                  type="button"
                  onClick={() => handleEquipTitle(equipped ? null : title.id)}
                  disabled={isPending}
                  title={title.description}
                  className={cn(
                    "flex items-center justify-between gap-2 border-2 p-3 text-left transition-colors disabled:opacity-60",
                    equipped
                      ? "border-[#191914] bg-[#d9ef61] text-[#191914] dark:border-[#f5f0e5]"
                      : "border-[#191914]/40 bg-[#fffaf0] text-[#191914] hover:bg-[#ece6da] dark:border-white/40 dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#292821]"
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-base font-bold">{title.name}</span>
                    <span className="mt-0.5 block truncate text-[11px] text-[#777268] dark:text-[#989389]">{title.description}</span>
                  </span>
                  <span aria-hidden className="shrink-0">
                    {equipped ? (
                      <Check className="h-4 w-4" />
                    ) : pendingAction === `title-${title.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {equippedTitle && unlockedTitles.length > 0 && (
          <button
            type="button"
            onClick={() => handleEquipTitle(null)}
            disabled={isPending}
            className="mt-2 text-xs font-bold text-[#777268] underline decoration-1 underline-offset-2 hover:text-[#d44120] disabled:opacity-60 dark:text-[#989389] dark:hover:text-[#ff8a68]"
          >
            卸下称号
          </button>
        )}
      </div>

      {/* 主页主题 */}
      <div>
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#e4532f]" />
          <h3 className="text-sm font-bold">主页背景与主题</h3>
        </div>
        {!themeUnlocked ? (
          <p className="mt-3 border border-[#191914]/25 bg-[#ece6da]/50 px-4 py-3 text-xs leading-relaxed text-[#777268] dark:border-white/25 dark:bg-[#292821]/50 dark:text-[#989389]">
            声望达到 {themeUnlockRep} 解锁主页主题定制。
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {themes.map((theme) => {
              const active = profileTheme === theme.id
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSetTheme(theme.id)}
                  disabled={isPending}
                  title={theme.description}
                  className={cn(
                    "border-2 p-3 text-center transition-colors disabled:opacity-60",
                    active
                      ? "border-[#191914] bg-[#d9ef61] text-[#191914] dark:border-[#f5f0e5]"
                      : "border-[#191914]/40 bg-[#fffaf0] text-[#191914] hover:bg-[#ece6da] dark:border-white/40 dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#292821]"
                  )}
                >
                  <span className="block font-serif text-sm font-bold">{theme.name}</span>
                  <span className="mt-1 block text-[10px] leading-snug text-[#777268] dark:text-[#989389]">{theme.description}</span>
                  {active && (
                    <span className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] font-bold">
                      <Check className="h-3 w-3" /> 使用中
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {message && (
        <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">
          {message}
        </p>
      )}
    </div>
  )
}
