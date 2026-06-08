"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createConfession } from "@/lib/actions"
import { Heart, Send } from "lucide-react"

export function ConfessionForm() {
  const [state, formAction, isPending] = useActionState(createConfession, null)

  return (
    <form
      action={formAction}
      className="relative rounded-2xl border border-rose-200 dark:border-rose-800/50 bg-white dark:bg-stone-900 p-6 shadow-sm shadow-rose-100/50 dark:shadow-rose-900/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Heart className="h-4 w-4 text-rose-400" />
        <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
          写下你想说的话
        </span>
      </div>

      <div className="mb-4">
        <Textarea
          name="content"
          placeholder="在这里匿名表达你的心声..."
          rows={4}
          className="resize-none border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:ring-rose-300 dark:focus-visible:ring-rose-700 focus-visible:ring-offset-0"
        />
      </div>

      {state && "message" in state && state.message && (
        <p className="mb-3 text-sm text-red-500">{state.message}</p>
      )}
      {state && "errors" in state && state.errors?.content && (
        <p className="mb-3 text-sm text-red-500">{state.errors.content[0]}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-stone-400 dark:text-stone-500">
          发布后将匿名显示，请保持友善
        </span>
        <Button
          type="submit"
          disabled={isPending}
          variant="outline"
          size="sm"
          className="border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "发送中..." : "匿名发送"}
        </Button>
      </div>
    </form>
  )
}
