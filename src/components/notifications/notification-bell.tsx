"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export const NOTIFICATION_REFRESH_EVENT = "campus:notifications-refresh"

/** 轮询间隔：3 分钟（节约服务端函数调用额度） */
const POLL_INTERVAL_MS = 180_000

export function NotificationBell() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread", { cache: "no-store" })
      if (!response.ok) return
      const data = (await response.json()) as { count?: number }
      setUnreadCount(Math.max(0, Number(data.count) || 0))
    } catch {
      // A transient connection issue should not disturb the rest of the header.
    }
  }, [])

  useEffect(() => {
    let interval: number | undefined

    const startPolling = () => {
      if (interval !== undefined) return
      interval = window.setInterval(refresh, POLL_INTERVAL_MS)
    }
    const stopPolling = () => {
      if (interval !== undefined) {
        window.clearInterval(interval)
        interval = undefined
      }
    }

    const initialRefresh = window.setTimeout(refresh, 0)
    // 标签页可见时才轮询；切到后台立即暂停，回到前台刷新一次并恢复
    if (!document.hidden) startPolling()

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling()
      } else {
        void refresh()
        startPolling()
      }
    }
    const handleRefresh = () => void refresh()

    window.addEventListener("focus", handleRefresh)
    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.clearTimeout(initialRefresh)
      stopPolling()
      window.removeEventListener("focus", handleRefresh)
      window.removeEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [pathname, refresh])

  return (
    <Link
      href="/notifications"
      aria-label={unreadCount > 0 ? `通知中心，${unreadCount} 条未读` : "通知中心"}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center border transition-colors",
        pathname === "/notifications"
          ? "border-[#191914] bg-[#191914] text-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#f5f0e5] dark:text-[#191914]"
          : "border-transparent hover:border-[#191914] hover:bg-[#ffb4aa] hover:text-[#191914] dark:hover:border-[#f5f0e5]"
      )}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-h-4 min-w-4 items-center justify-center border border-[#191914] bg-[#ff5b35] px-1 font-mono text-[8px] font-bold leading-none text-white dark:border-[#f5f0e5]">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
