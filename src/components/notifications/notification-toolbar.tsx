"use client"

import { CheckCheck, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { NOTIFICATION_REFRESH_EVENT } from "@/components/notifications/notification-bell"
import { clearReadNotifications, markAllNotificationsRead } from "@/lib/notification-actions"

export function NotificationToolbar({ unreadCount, readCount }: { unreadCount: number; readCount: number }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action()
      window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT))
      router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={pending || unreadCount === 0}
        onClick={() => run(markAllNotificationsRead)}
        className="inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-4 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
      >
        <CheckCheck className="h-4 w-4" /> 全部已读
      </button>
      <button
        type="button"
        disabled={pending || readCount === 0}
        onClick={() => run(clearReadNotifications)}
        className="inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 text-xs font-bold text-[#191914] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]"
      >
        <Trash2 className="h-4 w-4" /> 清理已读
      </button>
    </div>
  )
}
