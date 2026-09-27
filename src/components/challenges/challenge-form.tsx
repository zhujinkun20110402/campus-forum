"use client"

import { useActionState } from "react"
import { Loader2, Megaphone } from "lucide-react"
import { createChallenge } from "@/lib/challenge-actions"

/** 发起话题挑战表单（仅声望达标的用户可见） */
export function ChallengeForm({ unlockRep }: { unlockRep: number }) {
  const [state, formAction, isPending] = useActionState(createChallenge, null)

  return (
    <form action={formAction} className="border-2 border-[#191914] bg-[#fffaf0] p-5 shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_#f5f0e5]">
      <div className="flex items-center gap-2 border-b-2 border-[#191914] pb-3 dark:border-[#f5f0e5]">
        <Megaphone className="h-4 w-4 text-[#e4532f]" />
        <h3 className="font-serif text-lg font-bold">发起话题挑战</h3>
        <span className="ml-auto font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
          {unlockRep}+
        </span>
      </div>

      <label htmlFor="challenge-title" className="mt-4 block text-sm font-bold">
        话题
      </label>
      <input
        id="challenge-title"
        name="title"
        maxLength={60}
        required
        placeholder="例如：晒晒你的课桌"
        className="mt-2 h-11 w-full border-2 border-[#191914] bg-white px-3 text-sm font-medium text-[#191914] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      />

      <label htmlFor="challenge-description" className="mt-4 block text-sm font-bold">
        说明<span className="ml-2 font-mono text-[9px] font-medium tracking-[0.1em] text-[#989389]">OPTIONAL</span>
      </label>
      <textarea
        id="challenge-description"
        name="description"
        maxLength={200}
        rows={3}
        placeholder="想让大家怎么参与？一句话说清楚"
        className="mt-2 w-full resize-y border-2 border-[#191914] bg-white p-3 text-sm leading-6 text-[#191914] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      />

      <label htmlFor="challenge-ends" className="mt-4 block text-sm font-bold">
        结束时间
      </label>
      <input
        id="challenge-ends"
        name="endsAt"
        type="datetime-local"
        required
        className="mt-2 h-11 w-full border-2 border-[#191914] bg-white px-3 text-sm font-medium text-[#191914] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
      />
      <p className="mt-1.5 font-mono text-[9px] font-bold tracking-[0.08em] text-[#918b80]">
        1-30 天 · 每人同时只能有一个进行中的挑战
      </p>

      {state && "message" in state && state.message && (
        <p className="mt-3 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] text-sm font-bold text-[#191914] disabled:opacity-50 dark:border-[#f5f0e5]"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
        发布挑战
      </button>
    </form>
  )
}
