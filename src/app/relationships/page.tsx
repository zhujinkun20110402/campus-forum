import Link from "next/link"
import { HeartHandshake, Inbox, Link2, Send, Users } from "lucide-react"
import { RelationshipCard } from "@/components/relationships/relationship-card"
import { RequestForm } from "@/components/relationships/request-form"
import { RequestInboxItem } from "@/components/relationships/request-inbox-item"
import { SentRequestItem } from "@/components/relationships/sent-request-item"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { MAX_ACTIVE_RELATIONSHIPS } from "@/lib/relationship-config"
import {
  getIncomingRelationshipRequests,
  getMutualFollowers,
  getOutgoingRelationshipRequests,
  getRelationshipsForUser,
} from "@/lib/relationships"
import { requireUser } from "@/lib/session"

export default async function RelationshipsPage({ searchParams }: { searchParams: Promise<{ with?: string; type?: string }> }) {
  const user = await requireUser("/relationships")
  const params = await searchParams

  const [relationships, incoming, outgoing, mutuals] = await Promise.all([
    getRelationshipsForUser(user.id),
    getIncomingRelationshipRequests(user.id),
    getOutgoingRelationshipRequests(user.id),
    getMutualFollowers(user.id),
  ])

  const boundTypeCodes = relationships.map((row) => row.type)
  const presetTargetId = params.with && mutuals.some((mutual) => mutual.id === params.with) ? params.with : undefined
  const presetType = params.type ?? undefined

  const bonds = relationships.map((row) => ({
    id: row.id,
    type: row.type,
    xp: row.xp,
    createdAt: row.createdAt,
    partner: row.userA.id === user.id ? row.userB : row.userA,
  }))

  return (
    <div className="min-h-screen bg-[#f3e7e3] dark:bg-[#10100e]">
      <EditorialHero
        index="14"
        eyebrow="RELATIONSHIP DESK"
        title="把重要的人，标记成特别的关系"
        description="与互关好友绑定专属关系——情侣、兄弟、姐妹、师徒……点赞、评论、写明信片都能让关系升温升级，把每一次互动都变成你们的专属进度。"
        icon={HeartHandshake}
        accentClass="bg-[#ffb4aa]"
        compact
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-grid grid-cols-2 border-2 border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]">
            <div className="px-4 py-3 text-center sm:px-6">
              <p className="font-mono text-lg font-bold text-[#e4532f]">{bonds.length}</p>
              <p className="text-[10px] text-[#777268] dark:text-[#989389]">已绑定关系</p>
            </div>
            <div className="border-l border-[#191914]/25 px-4 py-3 text-center dark:border-white/25 sm:px-6">
              <p className="font-mono text-lg font-bold text-[#e4532f]">{incoming.length}</p>
              <p className="text-[10px] text-[#777268] dark:text-[#989389]">待处理申请</p>
            </div>
          </div>
          <Link href={`/profile/${user.id}/connections?tab=mutual`} className="inline-flex h-11 items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-4 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
            <Users className="h-4 w-4" /> 看看我的互关好友
          </Link>
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EditorialHeading
            index="01"
            eyebrow="MY BONDS"
            title="我的关系"
            meta={`${bonds.length} / ${MAX_ACTIVE_RELATIONSHIPS} 段`}
          />
          <div className="mt-7">
            {bonds.length === 0 ? (
              <EditorialPanel className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#191914] dark:border-[#f5f0e5]">
                  <Link2 className="h-7 w-7" />
                </div>
                <p className="mt-5 font-serif text-2xl font-bold">还没有绑定任何关系</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
                  先和一位成员互相关注，然后在下方发出绑定申请，等对方点头就行。
                </p>
                <Link
                  href={`/profile/${user.id}/connections?tab=mutual`}
                  className="mt-6 inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#d9ef61] px-4 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
                >
                  <Users className="h-4 w-4" /> 去找互关好友
                </Link>
              </EditorialPanel>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {bonds.map((bond) => <RelationshipCard key={bond.id} relationship={bond} />)}
              </div>
            )}
          </div>

          <EditorialHeading className="mt-14" index="02" eyebrow="INBOX" title="收到的申请" meta={incoming.length > 0 ? `${incoming.length} 条待处理` : "暂无"} />
          <div className="mt-7">
            {incoming.length === 0 ? (
              <EditorialPanel className="px-6 py-12 text-center">
                <Inbox className="mx-auto h-9 w-9 text-[#e4532f]" />
                <p className="mt-3 text-sm text-[#777268] dark:text-[#989389]">还没有人向你发出关系申请。</p>
              </EditorialPanel>
            ) : (
              <EditorialPanel>
                {incoming.map((request) => <RequestInboxItem key={request.id} request={request} />)}
              </EditorialPanel>
            )}
          </div>

          <EditorialHeading className="mt-14" index="03" eyebrow="OUTBOX" title="我发出的申请" meta={`${outgoing.length} 条`} />
          <div className="mt-7">
            {outgoing.length === 0 ? (
              <EditorialPanel className="px-6 py-12 text-center">
                <Send className="mx-auto h-9 w-9 text-[#e4532f]" />
                <p className="mt-3 text-sm text-[#777268] dark:text-[#989389]">还没有发出过关系申请，勇敢一点？</p>
              </EditorialPanel>
            ) : (
              <EditorialPanel>
                {outgoing.map((request) => <SentRequestItem key={request.id} request={request} />)}
              </EditorialPanel>
            )}
          </div>

          <EditorialHeading className="mt-14" index="04" eyebrow="BIND A BOND" title="发起绑定" meta={mutuals.length > 0 ? `${mutuals.length} 位互关好友` : "暂无互关"} />
          <div className="mt-7">
            {mutuals.length === 0 ? (
              <EditorialPanel className="px-6 py-14 text-center">
                <Users className="mx-auto h-10 w-10 text-[#e4532f]" />
                <p className="mt-4 font-serif text-xl font-bold">还没有互关好友</p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#69655d] dark:text-[#aaa69c]">
                  关注对方、对方也关注你，才算互关。去发现页找到想绑定的人吧。
                </p>
                <Link href="/search" className="mt-5 inline-flex h-10 items-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-4 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">
                  <Users className="h-4 w-4" /> 发现校园成员
                </Link>
              </EditorialPanel>
            ) : (
              <RequestForm mutuals={mutuals} presetTargetId={presetTargetId} presetType={presetType} boundTypeCodes={boundTypeCodes} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
