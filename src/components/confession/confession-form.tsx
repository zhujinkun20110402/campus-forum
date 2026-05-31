"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createConfession } from "@/lib/actions"
import { Heart } from "lucide-react"

export function ConfessionForm() {
  const [state, formAction, isPending] = useActionState(createConfession, null)

  return (
    <form action={formAction} className="rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 p-5">
      <div className="mb-4">
        <Textarea
          name="content"
          placeholder="写下你想说的话...（匿名发布）"
          rows={4}
          className="resize-none border-0 bg-transparent p-0 text-sm placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:ring-0"
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
          发布后将匿名显示
        </span>
        <Button type="submit" disabled={isPending} variant="outline" size="sm">
          <Heart className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "发送中..." : "匿名发送"}
        </Button>
      </div>
    </form>
  )
}