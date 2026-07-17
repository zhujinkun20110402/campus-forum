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
      className="relative border-2 border-[#191914] bg-[#fffaf0] p-6 text-[#191914] shadow-[6px_6px_0_#ffb4aa] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] sm:p-8"
    >
      <div className="mb-5 flex items-center justify-between gap-4 border-b-2 border-[#191914] pb-4 dark:border-[#f5f0e5]">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">WRITE ANONYMOUSLY</p>
          <span className="mt-1 block font-serif text-xl font-bold">写下你想说的话</span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#191914] dark:border-[#f5f0e5]">
          <Heart className="h-5 w-5" />
        </div>
      </div>

      <div className="mb-4">
        <Textarea
          name="content"
          placeholder="在这里匿名表达你的心声..."
          rows={4}
          className="min-h-36 resize-none rounded-none border-2 border-[#191914] bg-white p-4 text-sm leading-7 text-[#191914] placeholder:text-[#918b80] focus-visible:ring-[#ff6b43] focus-visible:ring-offset-0 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
      </div>

      {state && "message" in state && state.message && (
        <p className="mb-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{state.message}</p>
      )}
      {state && "errors" in state && state.errors?.content && (
        <p className="mb-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{state.errors.content[0]}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="max-w-xs text-xs leading-5 text-[#777268] dark:text-[#989389]">
          发布后将匿名显示，请保持友善
        </span>
        <Button
          type="submit"
          disabled={isPending}
          size="sm"
          className="h-10 rounded-none border-2 border-[#191914] bg-[#ffb4aa] px-4 font-bold text-[#191914] shadow-[3px_3px_0_#191914] hover:bg-[#ffb4aa] dark:border-[#f5f0e5] dark:bg-[#ffb4aa] dark:text-[#191914] dark:shadow-[3px_3px_0_#f5f0e5]"
        >
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "发送中..." : "匿名发送"}
        </Button>
      </div>
    </form>
  )
}
