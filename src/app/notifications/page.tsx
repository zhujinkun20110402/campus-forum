import Link from "next/link"
import { Bell, CheckCheck, Search, Users } from "lucide-react"
import { NotificationItem } from "@/components/notifications/notification-item"
import { NotificationToolbar } from "@/components/notifications/notification-toolbar"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { getNotificationCenter } from "@/lib/notifications"
import { requireUser } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  const user = await requireUser("/notifications")
  const { notifications, unreadCount, readCount } = await getNotificationCenter(user.id)
  const unread = notifications.filter((notification) => !notification.readAt)
  const earlier = notifications.filter((notification) => notification.readAt)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="12"
        eyebrow="NOTIFICATION DESK"
        title="与你有关的校园回声"
        description="回复、点赞、关注与管理动态集中在这里。通知只保留必要的关联信息，已读内容可以随时清理。"
        icon={Bell}
        accentClass="bg-[#f3c84b]"
        compact
      >
        <div className="inline-flex items-center gap-3 border-2 border-[#191914] bg-[#fffaf0] px-4 py-3 dark:border-[#f5f0e5] dark:bg-[#191914]">
          <span className="font-mono text-2xl font-bold text-[#e4532f]">{unreadCount}</span>
          <span className="text-xs font-bold">条未读通知</span>
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EditorialHeading
            index="01"
            eyebrow="INBOX"
            title="通知中心"
            meta={<NotificationToolbar unreadCount={unreadCount} readCount={readCount} />}
          />

          {notifications.length === 0 ? (
            <EditorialPanel className="mt-7 px-6 py-16 text-center sm:py-20">
              <CheckCheck className="mx-auto h-11 w-11 text-[#7a9130]" />
              <h2 className="mt-5 font-serif text-2xl font-bold">暂时没有新消息</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
                参与讨论、关注同学后，与你有关的互动会及时出现在这里。
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link href="/search" className="inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#f3c84b] px-4 text-xs font-bold text-[#191914] dark:border-[#f5f0e5]">
                  <Search className="h-4 w-4" /> 搜索校园内容
                </Link>
                <Link href="/leaderboard" className="inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 text-xs font-bold text-[#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5]">
                  <Users className="h-4 w-4" /> 发现校园同学
                </Link>
              </div>
            </EditorialPanel>
          ) : (
            <div className="mt-7 space-y-8">
              {unread.length > 0 && (
                <section>
                  <p className="mb-3 font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">NEW / {unread.length}</p>
                  <EditorialPanel>
                    {unread.map((notification) => <NotificationItem key={notification.id} notification={notification} />)}
                  </EditorialPanel>
                </section>
              )}
              {earlier.length > 0 && (
                <section>
                  <p className="mb-3 font-mono text-[9px] font-bold tracking-[0.16em] text-[#777268] dark:text-[#989389]">EARLIER / {earlier.length}</p>
                  <EditorialPanel>
                    {earlier.map((notification) => <NotificationItem key={notification.id} notification={notification} />)}
                  </EditorialPanel>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
