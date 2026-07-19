"use client"

import { useRouter } from "next/navigation"
import { Heart, MessageCircle, MessageSquareReply, Pin, UserPlus } from "lucide-react"
import { useState, useTransition } from "react"
import { UserAvatar } from "@/components/user/user-avatar"
import { NOTIFICATION_REFRESH_EVENT } from "@/components/notifications/notification-bell"
import { markNotificationRead } from "@/lib/notification-actions"
import { formatRelativeTime } from "@/lib/utils"

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    readAt: Date | string | null
    createdAt: Date | string
    actor: { id: string; name: string | null; image: string | null; role: string } | null
    post: { id: string; title: string } | null
    comment: { id: string } | null
  }
}

const notificationMeta = {
  COMMENT_CREATED: { icon: MessageCircle, label: "评论了你的帖子", color: "bg-[#f3c84b]" },
  COMMENT_REPLIED: { icon: MessageSquareReply, label: "回复了你的评论", color: "bg-[#d9ef61]" },
  POST_LIKED: { icon: Heart, label: "赞了你的帖子", color: "bg-[#ffb4aa]" },
  USER_FOLLOWED: { icon: UserPlus, label: "关注了你", color: "bg-[#b9ddbd]" },
  POST_PINNED: { icon: Pin, label: "将你的帖子设为置顶", color: "bg-[#ff6b43]" },
} as const

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter()
  const [optimisticRead, setOptimisticRead] = useState(Boolean(notification.readAt))
  const [pending, startTransition] = useTransition()
  const meta = notificationMeta[notification.type as keyof typeof notificationMeta] ?? notificationMeta.COMMENT_CREATED
  const Icon = meta.icon
  const actorName = notification.actor?.name ?? "一位校园成员"
  const href = notification.type === "USER_FOLLOWED"
    ? (notification.actor ? `/profile/${notification.actor.id}` : "/notifications")
    : (notification.post
      ? `/post/${notification.post.id}${notification.comment ? `#comment-${notification.comment.id}` : ""}`
      : "/notifications")

  function openNotification() {
    setOptimisticRead(true)
    startTransition(async () => {
      if (!notification.readAt) await markNotificationRead(notification.id)
      window.dispatchEvent(new Event(NOTIFICATION_REFRESH_EVENT))
      router.push(href)
    })
  }

  return (
    <button
      type="button"
      onClick={openNotification}
      disabled={pending}
      className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-[#191914]/15 px-4 py-5 text-left transition-colors last:border-b-0 hover:bg-[#f2eadc] disabled:cursor-wait dark:border-white/15 dark:hover:bg-[#292821] sm:gap-4 sm:px-6"
    >
      <div className="relative">
        <UserAvatar name={notification.actor?.name} image={notification.actor?.image} role={notification.actor?.role} size="md" />
        <span className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center border border-[#191914] text-[#191914] ${meta.color}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm leading-6">
          <span className="font-bold">{actorName}</span> {meta.label}
        </p>
        {notification.post && (
          <p className="mt-1 truncate text-sm text-[#69655d] transition-colors group-hover:text-[#d94d2a] dark:text-[#aaa69c]">
            《{notification.post.title}》
          </p>
        )}
        <p className="mt-2 font-mono text-[9px] font-bold tracking-[0.1em] text-[#918b80]">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${optimisticRead ? "bg-transparent" : "bg-[#ff5b35]"}`} aria-label={optimisticRead ? "已读" : "未读"} />
    </button>
  )
}
