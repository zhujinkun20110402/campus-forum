"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Ban, Loader2, ShieldX, Trash2 } from "lucide-react"
import {
  dismissReport,
  resolveReportByBan,
  resolveReportByDelete,
} from "@/lib/report-actions"
import { cn } from "@/lib/utils"

interface ReportReviewButtonsProps {
  reportId: string
  targetType: string
  targetId: string
  hasAuthor: boolean
}

type ReviewAction = "delete" | "ban" | "dismiss"

/** 管理员举报处理按钮：删除内容 / 封禁作者 / 驳回。 */
export function ReportReviewButtons({ reportId, targetType, targetId, hasAuthor }: ReportReviewButtonsProps) {
  const router = useRouter()
  const [pending, setPending] = useState<ReviewAction | null>(null)
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()

  function run(action: ReviewAction) {
    setMessage("")
    setPending(action)
    startTransition(async () => {
      const result =
        action === "delete"
          ? await resolveReportByDelete(reportId)
          : action === "ban"
            ? await resolveReportByBan(reportId)
            : await dismissReport(reportId)
      if (!result.success) {
        setMessage(result.message)
      } else {
        setMessage(result.message)
        router.refresh()
      }
      setPending(null)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <a
        href={targetType === "POST" ? `/post/${targetId}` : "#"}
        onClick={targetType === "COMMENT" ? (event) => event.preventDefault() : undefined}
        className={cn(
          "inline-flex h-8 items-center border border-[#191914] bg-[#fffaf0] px-2.5 text-[10px] font-bold text-[#191914] transition-colors hover:bg-[#f3c84b] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]",
          targetType === "COMMENT" && "cursor-not-allowed opacity-40"
        )}
        title={targetType === "COMMENT" ? "评论需在对应帖子的讨论区查看" : "查看被举报内容"}
      >
        查看
      </a>
      <button
        type="button"
        onClick={() => run("delete")}
        disabled={isPending}
        className="inline-flex h-8 items-center gap-1 border-2 border-[#191914] bg-[#ff6b43] px-2.5 text-[10px] font-bold text-[#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:border-[#f5f0e5]"
      >
        {pending === "delete" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        删除内容
      </button>
      {hasAuthor && (
        <button
          type="button"
          onClick={() => run("ban")}
          disabled={isPending}
          className="inline-flex h-8 items-center gap-1 border-2 border-[#191914] bg-[#191914] px-2.5 text-[10px] font-bold text-[#fffaf0] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:border-[#f5f0e5] dark:bg-[#f5f0e5] dark:text-[#191914]"
        >
          {pending === "ban" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
          封禁作者
        </button>
      )}
      <button
        type="button"
        onClick={() => run("dismiss")}
        disabled={isPending}
        className="inline-flex h-8 items-center gap-1 border border-[#191914]/60 px-2.5 text-[10px] font-bold text-[#777268] transition-colors hover:bg-[#ffb4aa] hover:text-[#191914] disabled:cursor-wait disabled:opacity-60 dark:border-[#f5f0e5]/60 dark:text-[#aaa69c]"
      >
        {pending === "dismiss" ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldX className="h-3 w-3" />}
        驳回
      </button>
      {message && <span className="w-full text-[10px] font-bold text-[#b52f1e]" role="status">{message}</span>}
    </div>
  )
}
