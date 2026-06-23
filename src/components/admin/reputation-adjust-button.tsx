"use client"

import { useTransition } from "react"
import { Plus, Minus, Loader2 } from "lucide-react"
import { adjustUserRaputation } from "@/lib/actions"
import { cn } from "@/lib/utils"

interface ReputationAdjustButtonProps {
  userId: string
  delta: number
  disabled?: boolean
}

export function ReputationAdjustButton({ userId, delta, disabled }: ReputationAdjustButtonProps) {
  const [isPending, startTransition] = useTransition()

  const isPositive = delta > 0

  function handleClick() {
    startTransition(async () => {
      await adjustUserRaputation(userId, delta)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || disabled}
      className={cn(
        "inline-flex items-center justify-center h-7 w-7 rounded-lg border transition-colors disabled:opacity-50",
        isPositive
          ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          : "border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
      )}
      title={isPositive ? `增加 ${delta} 声望` : `扣除 ${Math.abs(delta)} 声望`}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isPositive ? (
        <Plus className="h-3.5 w-3.5" />
      ) : (
        <Minus className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
