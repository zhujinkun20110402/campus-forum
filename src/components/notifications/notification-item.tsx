"use client"

import { useRouter } from "next/navigation"
import { Ban, Flag, Gift, Heart, HeartHandshake, Mail, MessageCircle, MessageSquareReply, Pin, ShieldCheck, Sparkles, Trash2, UserPlus } from "lucide-react"
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
    post: { id: string; title: string; category?: { slug: string } | null } | null
    comment: { id: string } | null
  }
}

const notificationMeta = {
  COMMENT_CREATED: { icon: MessageCircle, label: "评论了你的帖子", color: "bg-[#f3c84b]" },
  COMMENT_REPLIED: { icon: MessageSquareReply, label: "回复了你的评论", color: "bg-[#d9ef61]" },
  POST_LIKED: { icon: Heart, label: "赞了你的帖子", color: "bg-[#ffb4aa]" },
  USER_FOLLOWED: { icon: UserPlus, label: "关注了你", color: "bg-[#b9ddbd]" },
  POST_PINNED: { icon: Pin, label: "将你的帖子设为置顶", color: "bg-[#ff6b43]" },
  REPUTATION_GIFT: { icon: Gift, label: "送给你一份 +2 声望礼物", color: "bg-[#f3c84b]" },
  POSTCARD_RECEIVED: { icon: Mail, label: "给你寄来一封七日明信片", color: "bg-[#ffb4aa]" },
  RELATIONSHIP_REQUEST: { icon: HeartHandshake, label: "想和你绑定关系", color: "bg-[#ffb4aa]" },
  RELATIONSHIP_ACCEPTED: { icon: HeartHandshake, label: "接受了你的关系申请", color: "bg-[#d9ef61]" },
  RELATIONSHIP_DECLINED: { icon: HeartHandshake, label: "婉拒了你的关系申请", color: "bg-[#ece6da]" },
  RELATIONSHIP_DISSOLVED: { icon: HeartHandshake, label: "解除了你们的关系", color: "bg-[#ff6b43]" },
  RELATIONSHIP_LEVEL_UP: { icon: Sparkles, label: "你们的关系升级啦", color: "bg-[#f3c84b]" },
  REPORT_CREATED: { icon: Flag, label: "提交了内容举报", color: "bg-[#f3c84b]" },
  REPORT_RESOLVED: { icon: ShieldCheck, label: "处理了你的举报", color: "bg-[#b9ddbd]" },
  REPORT_DISMISSED: { icon: ShieldCheck, label: "审核了你的举报：未构成违规", color: "bg-[#ece6da]" },
  REPORT_CONTENT_DELETED: { icon: Trash2, label: "删除了你被举报的内容", color: "bg-[#ff6b43]" },
  REPORT_USER_BANNED: { icon: Ban, label: "你的账号因违规被暂时封禁", color: "bg-[#ff6b43]" },
} as const

const RELATIONSHIP_NOTIFICATION_TYPES = new Set([
  "RELATIONSHIP_REQUEST",
  "RELATIONSHIP_ACCEPTED",
  "RELATIONSHIP_DECLINED",
  "RELATIONSHIP_DISSOLVED",
  "RELATIONSHIP_LEVEL_UP",
])

const REPORT_NOTIFICATION_TYPES = new Set([
  "REPORT_CREATED",
  "REPORT_RESOLVED",
  "REPORT_DISMISSED",
  "REPORT_CONTENT_DELETED",
  "REPORT_USER_BANNED",
])

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter()
  const [optimisticRead, setOptimisticRead] = useState(Boolean(notification.readAt))
  const [pending, startTransition] = useTransition()
  const meta = notificationMeta[notification.type as keyof typeof notificationMeta] ?? notificationMeta.COMMENT_CREATED
  const Icon = meta.icon
  // 表白墙匿名通知：actor 为 null 且帖子属于表白墙时，一律显示为“匿名同学”
  const isAnonymous = !notification.actor && notification.post?.category?.slug === "confession"
  const actorName = isAnonymous ? "匿名同学" : notification.actor?.name ?? "一位校园成员"
  const href = RELATIONSHIP_NOTIFICATION_TYPES.has(notification.type)
    ? "/relationships"
    : REPORT_NOTIFICATION_TYPES.has(notification.type)
    ? (notification.type === "REPORT_CREATED" ? "/admin#reports" : "/notifications")
    : notification.type === "POSTCARD_RECEIVED"
    ? "/postcards"
    : notification.type === "USER_FOLLOWED" || notification.type === "REPUTATION_GIFT"
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
        {isAnonymous ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#191914] bg-[#ffb4aa] text-sm font-bold text-[#191914] dark:border-[#f5f0e5]">
            ?
          </div>
        ) : (
          <UserAvatar name={notification.actor?.name} image={notification.actor?.image} role={notification.actor?.role} size="md" />
        )}
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
