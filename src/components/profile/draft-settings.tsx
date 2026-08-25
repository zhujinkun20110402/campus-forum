"use client"

import { useSyncExternalStore } from "react"
import { FileText, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  clearDraft,
  getAutosaveSnapshot,
  getDraftSnapshot,
  setAutosaveEnabled,
  subscribeAutosave,
  subscribeDraft,
} from "@/lib/draft-store"

/** 写作偏好：草稿自动保存开关 + 当前草稿状态/清空 */
export function DraftSettings() {
  const autosave = useSyncExternalStore(subscribeAutosave, getAutosaveSnapshot, () => true)
  const draft = useSyncExternalStore(subscribeDraft, getDraftSnapshot, () => null)

  const savedAtLabel = draft
    ? new Date(draft.savedAt).toLocaleString("zh-CN", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : ""

  return (
    <div className="space-y-4">
      <button
        type="button"
        role="switch"
        aria-checked={autosave}
        onClick={() => setAutosaveEnabled(!autosave)}
        className="flex w-full items-center justify-between gap-4 border-2 border-[#191914] bg-[#ece6da]/70 p-4 text-left transition-colors hover:bg-[#ece6da] dark:border-[#f5f0e5] dark:bg-[#292821]/70 dark:hover:bg-[#292821]"
      >
        <span className="min-w-0">
          <span className="block text-sm font-bold">草稿自动保存</span>
          <span className="mt-1 block text-xs leading-relaxed text-[#777268] dark:text-[#989389]">
            写帖子时自动把内容保存在本机浏览器，刷新或误关页面后可恢复；不会上传到服务器。
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "flex h-7 w-12 shrink-0 items-center border-2 border-[#191914] px-0.5 transition-colors dark:border-[#f5f0e5]",
            autosave ? "justify-end bg-[#d9ef61]" : "justify-start bg-[#e5ded1] dark:bg-[#11110f]"
          )}
        >
          <span className="h-5 w-5 border border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]" />
        </span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#191914]/35 px-4 py-3 dark:border-white/35">
        <span className="flex min-w-0 items-center gap-2 text-xs text-[#777268] dark:text-[#989389]">
          <FileText className="h-3.5 w-3.5 shrink-0 text-[#e4532f]" />
          {draft ? `当前有一份本地草稿（${savedAtLabel} 保存）` : "当前没有本地草稿"}
        </span>
        {draft && (
          <button
            type="button"
            onClick={clearDraft}
            className="flex shrink-0 items-center gap-1 border border-[#191914] px-2.5 py-1.5 text-xs font-bold text-[#191914] transition-colors hover:bg-[#ffb4aa] dark:border-[#f5f0e5] dark:text-[#f5f0e5]"
          >
            <Trash2 className="h-3 w-3" /> 清空草稿
          </button>
        )}
      </div>
    </div>
  )
}
