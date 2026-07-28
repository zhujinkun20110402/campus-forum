"use client"

import { Gift, Loader2 } from "lucide-react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { giftReputation } from "@/lib/reputation-gift-actions"

export function ReputationGiftButton({ targetUserId, initialAvailable, reward }: { targetUserId: string; initialAvailable: boolean; reward: number }) {
  const router = useRouter()
  const [available, setAvailable] = useState(initialAvailable)
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  function sendGift() {
    setMessage("")
    startTransition(async () => {
      const result = await giftReputation(targetUserId)
      setMessage(result.message)
      if (result.success) {
        setAvailable(false)
        router.refresh()
      }
    })
  }

  return (
    <div className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={sendGift}
        disabled={pending || !available}
        className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#f3c84b] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#e5ded1] disabled:text-[#777268] disabled:shadow-none dark:border-[#f5f0e5]"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
        {available ? `送 +${reward} 声望` : "今日已赠送"}
      </button>
      {message && <span className="mt-1 max-w-48 text-[10px] font-bold text-[#777268] dark:text-[#aaa69c]" role="status">{message}</span>}
    </div>
  )
}
