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
      className={`inline-flex h-9 items-center gap-1.5 border px-3 text-sm font-bold transition-colors ${
        copied
          ? "border-[#326b42] bg-[#b9ddbd] text-[#275836]"
          : "border-[#191914] bg-[#fffaf0] text-[#191914] hover:bg-[#d9ef61] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:bg-[#d9ef61] dark:hover:text-[#191914]"
      }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      <span className="hidden sm:inline">{copied ? "已复制" : "分享"}</span>
    </button>
  )
}
