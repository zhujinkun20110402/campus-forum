"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UserCheck, UserPlus } from "lucide-react"
import { toggleFollowUser } from "@/lib/social-actions"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
  compact?: boolean
  className?: string
}

export function FollowButton({ targetUserId, initialFollowing, compact = false, className }: FollowButtonProps) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [message, setMessage] = useState("")
  const [pending, startTransition] = useTransition()

  function toggle() {
    setMessage("")
    startTransition(async () => {
      const result = await toggleFollowUser(targetUserId)
      if (!result.success) {
        setMessage(result.message)
        return
      }
      setFollowing(result.following)
      router.refresh()
    })
  }

  return (
    <div className={cn("inline-flex flex-col items-start", className)}>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={following}
        className={cn(
          "inline-flex items-center justify-center border-2 border-[#191914] font-bold text-[#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60 dark:border-[#f5f0e5]",
          compact ? "h-9 gap-1.5 px-3 text-xs" : "h-11 gap-2 px-5 text-sm shadow-[3px_3px_0_#191914] dark:shadow-[3px_3px_0_#f5f0e5]",
          following ? "bg-[#fffaf0] dark:bg-[#292821] dark:text-[#f5f0e5]" : "bg-[#d9ef61]",
        )}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
        {pending ? "处理中" : following ? "已关注" : "关注"}
      </button>
      {message && <span className="mt-1 text-[10px] font-bold text-[#b52f1e]" role="alert">{message}</span>}
    </div>
  )
}
