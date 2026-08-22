"use client"

import { useActionState, useState } from "react"
import { Check, Flag, Loader2, Send, X } from "lucide-react"
import { REPORT_REASONS } from "@/lib/report-config"
import { submitReport } from "@/lib/report-actions"
import { cn } from "@/lib/utils"

interface ReportButtonProps {
  targetType: "POST" | "COMMENT"
  targetId: string
  /** 评论行内使用小尺寸图标按钮 */
  iconOnly?: boolean
  className?: string
}

/** 举报入口：按钮 + 举报弹窗（选择原因、补充说明、提交）。 */
export function ReportButton({ targetType, targetId, iconOnly = false, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)

  function openModal() {
    setFormKey((key) => key + 1)
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        title="举报"
        aria-label="举报此内容"
        className={cn(
          "inline-flex items-center justify-center border border-[#191914] text-[#777268] transition-colors hover:border-[#d44120] hover:bg-[#ffb4aa] hover:text-[#b52f1e] dark:border-[#f5f0e5] dark:text-[#aaa69c] dark:hover:bg-[#3a2624]",
          iconOnly ? "h-7 gap-1 px-2" : "h-9 gap-1.5 px-3",
          className
        )}
      >
        <Flag className="h-3.5 w-3.5" aria-hidden />
        {!iconOnly && <span className="text-xs font-bold">举报</span>}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div
            aria-hidden
            className="absolute inset-0 bg-[#191914]/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden border-2 border-[#191914] bg-[#fffaf0] text-[#191914] shadow-[8px_8px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[8px_8px_0_#f5f0e5]">
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#191914] bg-[#191914] px-4 py-3 text-[#f5f0e5] dark:border-[#f5f0e5] sm:px-5">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.16em] text-[#d9ef61]">
                <Flag className="h-4 w-4" aria-hidden /> REPORT · 内容举报
              </span>
              <button
                type="button"
                aria-label="关闭举报窗口"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center border border-transparent transition-colors hover:border-[#f5f0e5] hover:bg-[#2a2924]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ReportForm
              key={formKey}
              targetType={targetType}
              targetId={targetId}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}

function ReportForm({
  targetType,
  targetId,
  onClose,
}: {
  targetType: "POST" | "COMMENT"
  targetId: string
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState(submitReport, null)
  const [reason, setReason] = useState("")

  const success = state && "success" in state && state.success
  const errorMessage = state && "message" in state && !state.success ? state.message : null
  const successMessage = state && "success" in state && state.success ? state.message : null

  return (
    <form action={formAction} className="flex min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">
        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-[#191914] bg-[#b9ddbd] text-[#191914] dark:border-[#f5f0e5]">
              <Check className="h-5 w-5" />
            </div>
            <p className="mt-4 font-serif text-xl font-bold">举报已提交</p>
            <p className="mt-2 text-sm leading-6 text-[#777268] dark:text-[#989389]">{successMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex h-10 items-center border-2 border-[#191914] bg-[#ff6b43] px-6 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
            >
              完成
            </button>
          </div>
        ) : (
          <>
            <input type="hidden" name="targetType" value={targetType} />
            <input type="hidden" name="targetId" value={targetId} />
            <input type="hidden" name="reason" value={reason} />

            <p className="text-sm font-bold">举报原因</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {REPORT_REASONS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  aria-pressed={reason === item.code}
                  onClick={() => setReason(item.code)}
                  className={cn(
                    "h-10 border-2 border-[#191914] text-xs font-bold transition-colors dark:border-[#f5f0e5]",
                    reason === item.code
                      ? "bg-[#191914] text-[#fffaf0] dark:bg-[#f5f0e5] dark:text-[#191914]"
                      : cn(item.surface, "text-[#191914] hover:-translate-y-0.5")
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <label htmlFor="report-detail" className="mt-4 block text-sm font-bold">
              补充说明（可选）
            </label>
            <textarea
              id="report-detail"
              name="detail"
              rows={3}
              maxLength={500}
              placeholder="请简要描述具体情况，帮助管理员更快核实…"
              className="mt-2 w-full resize-none rounded-none border-2 border-[#191914] bg-white p-3 text-base leading-6 text-[#191914] placeholder:text-[#918b80] focus-visible:outline-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5] sm:text-sm"
            />

            {errorMessage && (
              <p className="mt-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm font-medium text-[#b52f1e]" role="alert">
                {errorMessage}
              </p>
            )}
            <p className="mt-3 text-xs leading-5 text-[#777268] dark:text-[#989389]">
              举报将提交给管理员核实处理；请勿恶意举报，否则可能被限制使用。
            </p>
          </>
        )}
      </div>

      {!success && (
        <div className="flex items-center justify-end gap-2 border-t-2 border-[#191914] bg-[#ece6da] px-4 py-3 dark:border-[#f5f0e5] dark:bg-[#171713] sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center border-2 border-[#191914] bg-[#fffaf0] px-4 text-xs font-bold text-[#191914] transition-colors hover:bg-[#ece6da] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isPending || !reason}
            className="inline-flex h-10 items-center gap-1.5 border-2 border-[#191914] bg-[#ff6b43] px-5 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                提交中…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden />
                提交举报
              </>
            )}
          </button>
        </div>
      )}
    </form>
  )
}
