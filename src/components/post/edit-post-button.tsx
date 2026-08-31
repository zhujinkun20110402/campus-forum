"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil, X } from "lucide-react"
import { updatePost } from "@/lib/reputation-actions"

interface EditPostButtonProps {
  postId: string
  title: string
  content: string
  createdAt: Date | string
}

const EDIT_WINDOW_MS = 30 * 60 * 1000

/**
 * 帖子编辑入口：仅作者可见，发布 30 分钟内可编辑
 * （声望 ≥ 150 的门槛由服务端 updatePost 兜底校验）
 */
export function EditPostButton({ postId, title, content, createdAt }: EditPostButtonProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [titleValue, setTitleValue] = useState(title)
  const [contentValue, setContentValue] = useState(content)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const createdTime = typeof createdAt === "string" ? new Date(createdAt).getTime() : createdAt.getTime()
  const inWindow = Date.now() - createdTime < EDIT_WINDOW_MS

  if (!inWindow) return null

  const handleSave = () => {
    setError(null)
    const formData = new FormData()
    formData.append("postId", postId)
    formData.append("title", titleValue)
    formData.append("content", contentValue)

    startTransition(async () => {
      const result = await updatePost(null, formData)
      if (result && "message" in result) {
        setError(result.message ?? null)
      } else {
        setEditing(false)
        router.refresh()
      }
    })
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex h-9 items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 text-sm font-bold transition-colors hover:bg-[#f3c84b] dark:border-[#f5f0e5] dark:bg-[#191914]"
      >
        <Pencil className="h-4 w-4" /> 编辑
      </button>
    )
  }

  return (
    <div className="w-full border-2 border-[#191914] bg-[#fffaf0] p-4 dark:border-[#f5f0e5] dark:bg-[#191914]">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#e4532f]">
          EDIT · 发布 30 分钟内可修改
        </p>
        <button
          type="button"
          onClick={() => setEditing(false)}
          aria-label="取消编辑"
          className="-m-1 p-1 text-[#777268] hover:text-[#e4532f] dark:text-[#989389]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <input
        value={titleValue}
        onChange={(event) => setTitleValue(event.target.value)}
        placeholder="标题"
        className="mt-3 h-11 w-full border-2 border-[#191914] bg-white px-3 text-sm font-medium text-[#191914] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      />
      <textarea
        value={contentValue}
        onChange={(event) => setContentValue(event.target.value)}
        rows={8}
        placeholder="正文（支持 Markdown）"
        className="mt-2 w-full resize-y border-2 border-[#191914] bg-white p-3 font-mono text-sm leading-7 text-[#191914] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      />
      {error && (
        <p className="mt-2 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">
          {error}
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-4 text-sm font-bold text-[#191914] disabled:opacity-50 dark:border-[#f5f0e5]"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
          保存修改
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="h-10 border-2 border-[#191914] bg-[#fffaf0] px-4 text-sm font-bold text-[#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]"
        >
          取消
        </button>
      </div>
    </div>
  )
}
