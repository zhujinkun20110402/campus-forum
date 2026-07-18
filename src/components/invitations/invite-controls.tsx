"use client"

import { useActionState, useState } from "react"
import { Check, Copy, Loader2, TicketPlus } from "lucide-react"
import { generateAdminInviteCodes } from "@/lib/invite-actions"

export function InviteCopyButton({ code, compact = false }: { code: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt("复制邀请码", code)
    }
  }

  return (
    <button
      type="button"
      onClick={copyCode}
      className={compact
        ? "inline-flex h-8 items-center gap-1.5 border border-[#191914] bg-[#fffaf0] px-2.5 text-[10px] font-bold text-[#191914] hover:bg-[#d9ef61] dark:border-[#f5f0e5]"
        : "inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 hover:bg-[#d9ef61] dark:border-[#f5f0e5]"
      }
      aria-label={`复制邀请码 ${code}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "已复制" : "复制"}
    </button>
  )
}

export function AdminInviteGenerator() {
  const [state, formAction, pending] = useActionState(generateAdminInviteCodes, null)

  return (
    <div className="border-2 border-[#191914] bg-[#f3c84b] p-5 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:p-6">
      <p className="font-mono text-[9px] font-bold tracking-[0.16em]">ADMIN ISSUE DESK</p>
      <h3 className="mt-2 font-serif text-2xl font-bold">生成永久邀请码</h3>
      <p className="mt-2 text-sm leading-6 text-[#191914]/65">管理员可按需批量生成。邀请码一经创建永久有效，每枚仅能注册一个账号。</p>

      <form action={formAction} className="mt-5 flex items-stretch gap-3">
        <label className="sr-only" htmlFor="invite-count">生成数量</label>
        <input
          id="invite-count"
          name="count"
          type="number"
          min={1}
          max={25}
          defaultValue={3}
          required
          className="h-11 min-w-0 flex-1 border-2 border-[#191914] bg-[#fffaf0] px-3 font-mono text-sm font-bold outline-none focus:ring-2 focus:ring-[#ff6b43]"
        />
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#191914] px-4 text-sm font-bold text-[#f5f0e5] disabled:opacity-60">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TicketPlus className="h-4 w-4" />}
          {pending ? "生成中" : "生成"}
        </button>
      </form>

      {state?.message && (
        <p className={`mt-4 border px-3 py-2 text-sm font-bold ${state.success ? "border-[#326b42] bg-[#b9ddbd] text-[#275836]" : "border-[#b52f1e] bg-[#ffb4aa] text-[#8f2518]"}`} aria-live="polite">
          {state.message}
        </p>
      )}

      {state?.success && state.codes && (
        <div className="mt-4 space-y-2">
          {state.codes.map((code) => (
            <div key={code} className="flex items-center justify-between gap-3 border border-[#191914] bg-[#fffaf0] p-2.5">
              <code className="min-w-0 truncate font-mono text-xs font-bold tracking-[0.06em]">{code}</code>
              <InviteCopyButton code={code} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
