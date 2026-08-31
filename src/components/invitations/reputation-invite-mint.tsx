"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Ticket } from "lucide-react"
import { mintReputationInviteCode } from "@/lib/reputation-actions"

/** 声望邀请额度铸造：每次铸造 1 枚永久邀请码 */
export function ReputationInviteMint({ quota }: { quota: number }) {
  const router = useRouter()
  const [message, setMessage] = useState<string | null>(null)
  const [minted, setMinted] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleMint = () => {
    setMessage(null)
    setMinted(null)
    startTransition(async () => {
      const result = await mintReputationInviteCode()
      if (result && "message" in result) {
        setMessage(result.message ?? null)
      } else if (result && "code" in result) {
        setMinted(result.code)
        router.refresh()
      }
    })
  }

  return (
    <div className="border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5]">
      <div className="flex items-center justify-between gap-3 border-b border-[#191914]/25 pb-4 dark:border-white/25">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-[#e4532f]" />
          <h3 className="font-serif text-lg font-bold">声望邀请额度</h3>
        </div>
        <span className="font-mono text-2xl font-bold text-[#e4532f]">{quota}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
        通过「声望之路」获得的邀请额度。每次铸造生成 1 枚永久有效的邀请码。
      </p>
      <button
        type="button"
        onClick={handleMint}
        disabled={isPending || quota <= 0}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] text-sm font-bold text-[#191914] disabled:opacity-50 dark:border-[#f5f0e5]"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
        铸造 1 枚邀请码
      </button>
      {quota <= 0 && (
        <p className="mt-3 text-xs leading-relaxed text-[#777268] dark:text-[#989389]">
          暂无额度。到 <Link href="/reputation" className="font-bold text-[#d44120] underline decoration-2 underline-offset-2 dark:text-[#ff8a68]">声望之路</Link> 看看下一个奖励还差多少。
        </p>
      )}
      {message && (
        <p className="mt-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">
          {message}
        </p>
      )}
      {minted && (
        <div className="mt-3 border border-[#326b42] bg-[#b9ddbd]/60 p-3 dark:bg-[#213426]/60">
          <p className="font-mono text-[9px] font-bold tracking-[0.1em] text-[#275836] dark:text-[#b9ddbd]">NEW CODE READY</p>
          <code className="mt-1 block break-all font-mono text-base font-bold">{minted}</code>
        </div>
      )}
    </div>
  )
}
