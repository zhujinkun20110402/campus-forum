import { CalendarClock, CheckCircle2, Clock3, LockKeyhole, Shield, Ticket, Users } from "lucide-react"
import { AdminInviteGenerator, InviteCopyButton } from "@/components/invitations/invite-controls"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { getInviteCenterData } from "@/lib/invitations"
import { requireUser } from "@/lib/session"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

function remainingLabel(unlockAt: Date) {
  const remaining = Math.max(0, unlockAt.getTime() - Date.now())
  const hours = Math.ceil(remaining / (60 * 60 * 1000))
  if (hours <= 24) return `约 ${hours} 小时后解锁`
  return `约 ${Math.ceil(hours / 24)} 天后解锁`
}

export default async function InvitesPage() {
  const user = await requireUser("/invites")
  const isAdmin = user.role === "ADMIN"
  const data = await getInviteCenterData(user.id, isAdmin)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="11"
        eyebrow="INVITATION DESK"
        title="把校园社区交给可信任的人"
        description="邀请码是进入社区的唯一入口。每枚仅限一人使用、永久有效；请只分享给你认识并愿意为其负责的同学。"
        icon={Ticket}
        accentClass="bg-[#d9ef61]"
        compact
      >
        <div className="inline-grid grid-cols-3 border-2 border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]">
          {[
            [data.ownedStats.total, "我创建的"],
            [data.ownedStats.available, "尚未使用"],
            [data.ownedStats.used, "成功邀请"],
          ].map(([value, label], index) => (
            <div key={String(label)} className={index > 0 ? "border-l border-[#191914]/20 px-4 py-3 text-center dark:border-white/20 sm:px-6" : "px-4 py-3 text-center sm:px-6"}>
              <p className="font-mono text-xl font-bold">{value}</p>
              <p className="mt-1 text-[10px] text-[#777268] dark:text-[#989389]">{label}</p>
            </div>
          ))}
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <EditorialHeading
            index="01"
            eyebrow="MY INVITATIONS"
            title="我的邀请码"
            meta={data.grant.eligible ? "三日邀请权限已解锁" : remainingLabel(data.grant.unlockAt)}
          />

          {!data.grant.eligible ? (
            <EditorialPanel className="mt-7 grid gap-5 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-8">
              <div className="flex h-16 w-16 items-center justify-center border-2 border-[#191914] bg-[#f3c84b] text-[#191914] dark:border-[#f5f0e5]">
                <LockKeyhole className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold">邀请权限将在注册满三天后自动解锁</h3>
                <p className="mt-2 text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
                  解锁时间：{formatDate(data.grant.unlockAt)}。届时进入本页即可获得 3 枚永久邀请码。
                </p>
              </div>
            </EditorialPanel>
          ) : data.ownedCodes.length > 0 ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.ownedCodes.map((invite, index) => (
                <article key={invite.id} className={`border-2 border-[#191914] p-5 text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5] ${invite.usedAt ? "bg-[#e5ded1]" : index % 2 === 0 ? "bg-[#d9ef61]" : "bg-[#b9ddbd]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] font-bold tracking-[0.14em]">{invite.source === "ADMIN" ? "ADMIN ISSUED" : "MEMBER GRANT"}</span>
                    <span className={`border border-[#191914] px-2 py-1 font-mono text-[8px] font-bold ${invite.usedAt ? "bg-[#ffb4aa]" : "bg-[#fffaf0]"}`}>
                      {invite.usedAt ? "USED" : "AVAILABLE"}
                    </span>
                  </div>
                  <code className="mt-7 block break-all font-mono text-lg font-bold tracking-[0.06em]">{invite.code}</code>
                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#191914]/25 pt-4">
                    <div className="text-[10px] leading-5 text-[#191914]/55">
                      <p>创建于 {formatDate(invite.createdAt).split(" ")[0]}</p>
                      <p>{invite.usedAt ? `使用于 ${formatDate(invite.usedAt).split(" ")[0]}` : "永久有效 · 单次使用"}</p>
                    </div>
                    {!invite.usedAt && <InviteCopyButton code={invite.code} />}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EditorialPanel className="mt-7 p-8 text-center">
              <Clock3 className="mx-auto h-9 w-9 text-[#e4532f]" />
              <p className="mt-3 font-serif text-xl font-bold">邀请码正在发放，请刷新页面</p>
            </EditorialPanel>
          )}

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              [CalendarClock, "三日后解锁", "新账号需要先熟悉社区，注册满三天后获得邀请资格。"],
              [Users, "每人三枚", "普通成员仅自动获得一次，共 3 枚邀请码。"],
              [CheckCircle2, "单次且永久", "邀请码没有过期时间，但成功注册后立即失效。"],
            ].map(([Icon, title, description]) => {
              const RuleIcon = Icon as React.ComponentType<{ className?: string }>
              return (
                <div key={String(title)} className="border-t-2 border-[#191914] pt-4 dark:border-[#f5f0e5]">
                  <RuleIcon className="h-5 w-5 text-[#e4532f]" />
                  <h3 className="mt-3 font-serif text-lg font-bold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">{description as string}</p>
                </div>
              )
            })}
          </div>

          {isAdmin && data.adminStats && data.recentCodes && (
            <section className="mt-16">
              <EditorialHeading index="02" eyebrow="ADMIN CONTROL" title="邀请码管理" meta={`全站共 ${data.adminStats.total} 枚`} />
              <div className="mt-7 grid items-start gap-7 lg:grid-cols-[330px_minmax(0,1fr)]">
                <aside className="space-y-5 lg:sticky lg:top-24">
                  <AdminInviteGenerator />
                  <div className="border-2 border-[#191914] bg-[#191914] p-5 text-[#f5f0e5] dark:border-[#f5f0e5]">
                    <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.14em] text-[#d9ef61]"><Shield className="h-4 w-4" />GLOBAL STATUS</div>
                    <dl className="mt-4 space-y-3 text-sm">
                      <div className="flex justify-between"><dt className="text-white/50">邀请码总数</dt><dd className="font-mono font-bold">{data.adminStats.total}</dd></div>
                      <div className="flex justify-between"><dt className="text-white/50">尚未使用</dt><dd className="font-mono font-bold text-[#d9ef61]">{data.adminStats.available}</dd></div>
                      <div className="flex justify-between"><dt className="text-white/50">已完成注册</dt><dd className="font-mono font-bold text-[#ff8a68]">{data.adminStats.used}</dd></div>
                    </dl>
                  </div>
                </aside>

                <EditorialPanel className="overflow-hidden">
                  <div className="border-b-2 border-[#191914] p-5 dark:border-[#f5f0e5]">
                    <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">LATEST 100 CODES</p>
                    <h3 className="mt-1 font-serif text-xl font-bold">最近签发记录</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-[#ece6da] font-mono text-[9px] tracking-[0.1em] dark:bg-[#292821]">
                        <tr><th className="px-4 py-3">邀请码</th><th className="px-4 py-3">来源</th><th className="px-4 py-3">签发者</th><th className="px-4 py-3">状态 / 使用者</th><th className="px-4 py-3">创建时间</th></tr>
                      </thead>
                      <tbody>
                        {data.recentCodes.map((invite) => (
                          <tr key={invite.id} className="border-t border-[#191914]/15 dark:border-white/15">
                            <td className="px-4 py-3"><code className="font-mono font-bold">{invite.code}</code></td>
                            <td className="px-4 py-3">{invite.source === "ADMIN" ? "管理员" : "成员自动发放"}</td>
                            <td className="px-4 py-3">{invite.createdBy?.name ?? invite.createdBy?.email ?? "已删除用户"}</td>
                            <td className="px-4 py-3">{invite.usedAt ? `已使用 · ${invite.usedBy?.name ?? invite.usedBy?.email ?? "用户已删除"}` : "可使用"}</td>
                            <td className="px-4 py-3">{formatDate(invite.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </EditorialPanel>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
