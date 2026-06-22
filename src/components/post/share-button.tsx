"use client"

import { useState } from "react"
import { Share2, Check } from "lucide-react"

interface ShareButtonProps {
  postId: string
  title?: string
}

export function ShareButton({ postId, title }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? `${window.location.origin}/post/${postId}` : `/post/${postId}`

  const handleShare = async () => {
    const shareData = {
      title: title || "校园论坛帖子",
      text: title ? `来看看：${title}` : "来看看这条帖子",
      url,
    }

    // 优先使用系统原生分享（移动端有效）
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // 用户取消或分享失败，回退到剪贴板
        if ((err as Error).name === "AbortError") return
      }
    }

    // 回退：复制链接到剪贴板
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 最后的兜底：尝试通过临时 textarea 复制
      try {
        const textarea = document.createElement("textarea")
        textarea.value = url
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        alert("复制失败，请手动复制链接")
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-2.5 py-1.5 sm:px-4 sm:py-2 text-sm transition-colors ${
        copied
          ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400"
          : "border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
      }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span className="hidden sm:inline">{copied ? "已复制" : "分享"}</span>
    </button>
  )
}
