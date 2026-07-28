import Link from "next/link"
import { Clock3, Inbox, Send, Stamp } from "lucide-react"
import { PostcardCard } from "@/components/postcards/postcard-card"
import { PostcardComposer } from "@/components/postcards/postcard-composer"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { getPostcardCenter } from "@/lib/postcards"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function PostcardsPage({ searchParams }: { searchParams: Promise<{ tab?: string; to?: string }> }) {
  const { tab, to } = await searchParams
  const user = await requireUser(`/postcards${to ? `?to=${encodeURIComponent(to)}` : ""}`)
  const activeTab = tab === "sent" ? "sent" : "received"
  const [center, initialRecipient] = await Promise.all([
    getPostcardCenter(user.id),
    to && to !== user.id
      ? prisma.user.findFirst({
          where: { id: to, role: { not: "BANNED" } },
          select: { id: true, name: true, image: true, role: true, raputation: true },
        })
      : Promise.resolve(null),
  ])
  const list = activeTab === "received" ? center.received : center.sent
  const unread = center.received.filter((postcard) => !postcard.openedAt).length

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero index="14" eyebrow="SEVEN-DAY POST" title="校园明信片局" description="把有限的一张纸，寄给此刻真正想起的人。每封信在校园停留七天，之后不留副本。" icon={Stamp} accentClass="bg-[#ffb4aa]" compact>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 font-mono text-[9px] font-bold dark:border-[#f5f0e5] dark:bg-[#191914]"><Inbox className="h-3.5 w-3.5 text-[#e4532f]" />{unread} SEALED</span>
          <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#d9ef61] px-3 py-2 font-mono text-[9px] font-bold text-[#191914] dark:border-[#f5f0e5]">{center.quota.remaining} / {center.quota.total} LEFT</span>
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24"><PostcardComposer quota={center.quota} initialRecipient={initialRecipient} /></aside>

          <section className="min-w-0">
            <EditorialHeading index="01" eyebrow="MAIL ARCHIVE" title={activeTab === "received" ? "收到的明信片" : "已经寄出的短笺"} meta={<span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-[#e4532f]" />仅保留 7 天</span>} />
            <div className="mt-6 grid grid-cols-2 gap-px border-2 border-[#191914] bg-[#191914] dark:border-[#f5f0e5] dark:bg-[#f5f0e5]">
              <Link href="/postcards" className={cn("flex h-11 items-center justify-center gap-2 bg-[#fffaf0] text-xs font-bold text-[#191914] dark:bg-[#191914] dark:text-[#f5f0e5]", activeTab === "received" && "bg-[#d9ef61] dark:bg-[#d9ef61] dark:text-[#191914]")}><Inbox className="h-4 w-4" />收件箱 · {center.received.length}</Link>
              <Link href="/postcards?tab=sent" className={cn("flex h-11 items-center justify-center gap-2 bg-[#fffaf0] text-xs font-bold text-[#191914] dark:bg-[#191914] dark:text-[#f5f0e5]", activeTab === "sent" && "bg-[#f3c84b] dark:bg-[#f3c84b] dark:text-[#191914]")}><Send className="h-4 w-4" />已寄出 · {center.sent.length}</Link>
            </div>

            {list.length ? (
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {activeTab === "received"
                  ? center.received.map((postcard) => <PostcardCard key={postcard.id} postcard={postcard} person={postcard.sender} direction="received" />)
                  : center.sent.map((postcard) => <PostcardCard key={postcard.id} postcard={postcard} person={postcard.recipient} direction="sent" />)}
              </div>
            ) : (
              <EditorialPanel className="mt-5 py-20 text-center"><Stamp className="mx-auto h-10 w-10 text-[#e4532f]" /><p className="mt-4 font-serif text-2xl font-bold">{activeTab === "received" ? "信箱里还没有来信" : "这个月还没有寄出短笺"}</p></EditorialPanel>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
