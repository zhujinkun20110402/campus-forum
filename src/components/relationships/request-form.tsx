"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, HeartHandshake, Loader2, Send } from "lucide-react"
import { RELATIONSHIP_TYPES, RELATIONSHIP_TYPE_CODES } from "@/lib/relationship-config"
import { sendRelationshipRequest } from "@/lib/relationship-actions"
import { cn } from "@/lib/utils"

interface MutualOption {
  id: string
  name: string | null
  image: string | null
  role: string
}

interface RequestFormProps {
  mutuals: MutualOption[]
  presetTargetId?: string
  presetType?: string
  /** 当前用户已占用的关系类型，禁用对应选项 */
  boundTypeCodes: string[]
}

export function RequestForm({ mutuals, presetTargetId, presetType, boundTypeCodes }: RequestFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(sendRelationshipRequest, null)
  const [selectedType, setSelectedType] = useState(() => {
    if (presetType && !boundTypeCodes.includes(presetType) && RELATIONSHIP_TYPES[presetType]) return presetType
    return RELATIONSHIP_TYPE_CODES.find((code) => !boundTypeCodes.includes(code)) ?? ""
  })

  const success = state && "success" in state && state.success
  const errorMessage = state && "message" in state && !state.success ? state.message : null
  const successMessage = state && "success" in state && state.success ? state.message : null

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => router.refresh(), 900)
    return () => window.clearTimeout(timer)
  }, [success, router])

  return (
    <form action={formAction} className="relative border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-[#191914] pb-4 dark:border-[#f5f0e5]">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">BIND A BOND</p>
          <span className="mt-1 block font-serif text-xl font-bold">发起一段新关系</span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#191914] dark:border-[#f5f0e5]">
          <HeartHandshake className="h-5 w-5" />
        </div>
      </div>

      {presetTargetId && <input type="hidden" name="targetId" value={presetTargetId} />}

      <label htmlFor="relationship-target" className="mb-1.5 block text-xs font-bold">
        选择互关好友
      </label>
      <select
        id="relationship-target"
        name="targetId"
        defaultValue={presetTargetId ?? ""}
        disabled={Boolean(presetTargetId)}
        className="mb-4 h-11 w-full rounded-none border-2 border-[#191914] bg-white px-3 text-sm font-medium text-[#191914] focus-visible:outline-[#ff6b43] disabled:cursor-not-allowed disabled:opacity-70 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      >
        <option value="" disabled>选择一位互相关注的成员…</option>
        {mutuals.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name ?? "未命名用户"}
          </option>
        ))}
      </select>

      <p className="mb-1.5 text-xs font-bold">
        选择关系
        <span className="ml-2 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">同一种关系只能绑定一位</span>
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RELATIONSHIP_TYPE_CODES.map((code) => {
          const config = RELATIONSHIP_TYPES[code]
          const bound = boundTypeCodes.includes(code)
          const selected = selectedType === code
          return (
            <button
              key={code}
              type="button"
              disabled={bound}
              aria-pressed={selected}
              onClick={() => setSelectedType(code)}
              className={cn(
                "relative flex min-h-[72px] flex-col items-start justify-between border-2 border-[#191914] p-2.5 text-left transition-colors disabled:cursor-not-allowed dark:border-[#f5f0e5]",
                bound
                  ? "opacity-45"
                  : selected
                    ? "bg-[#191914] text-[#fffaf0] dark:bg-[#f5f0e5] dark:text-[#191914]"
                    : cn(config.surface, "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#191914] dark:hover:shadow-[3px_3px_0_#f5f0e5]")
              )}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <span aria-hidden className="text-base leading-none">{config.emoji}</span>
                <span className="font-mono text-[8px] font-bold tracking-[0.1em] text-[#e4532f]">{config.english}</span>
              </span>
              <span className="mt-1.5 block text-xs font-bold leading-tight">{config.name}</span>
              <span className="mt-0.5 line-clamp-1 text-[9px] leading-4 text-[#191914]/55 dark:text-[#f5f0e5]/55">{bound ? "已绑定" : config.desc}</span>
              {selected && !bound && (
                <span aria-hidden className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center border border-[#191914] bg-[#d9ef61] text-[#191914] dark:border-[#f5f0e5]">
                  <Check className="h-3 w-3" />
                </span>
              )}
            </button>
          )
        })}
      </div>
      <input type="hidden" name="type" value={selectedType} />

      <label htmlFor="relationship-message" className="mb-1.5 mt-4 block text-xs font-bold">
        给对方留句话（可选）
      </label>
      <input
        id="relationship-message"
        name="message"
        type="text"
        maxLength={120}
        placeholder="例如：从高一到现在，终于等到互关了……"
        className="h-11 w-full rounded-none border-2 border-[#191914] bg-white px-3 text-sm text-[#191914] placeholder:text-[#918b80] focus-visible:outline-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      />

      {errorMessage && (
        <p className="mt-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm font-medium text-[#b52f1e]" role="alert">
          {errorMessage}
        </p>
      )}
      {successMessage && (
        <p className="mt-3 border-l-4 border-[#3f8450] bg-[#b9ddbd]/40 px-3 py-2 text-sm font-medium text-[#2c5c3b]" role="status">
          {successMessage}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="max-w-sm text-xs leading-5 text-[#777268] dark:text-[#989389]">
          仅互关好友可见申请；对方同意后即可开始互动升级，任何一方随时可以解除。
        </span>
        <button
          type="submit"
          disabled={isPending || !selectedType || mutuals.length === 0}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border-2 border-[#191914] bg-[#ffb4aa] px-5 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#f5f0e5] dark:bg-[#ffb4aa] dark:shadow-[3px_3px_0_#f5f0e5]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isPending ? "发送中…" : "发出绑定申请"}
        </button>
      </div>
    </form>
  )
}
