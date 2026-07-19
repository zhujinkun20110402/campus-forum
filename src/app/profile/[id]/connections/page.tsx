import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, LockKeyhole, UserRoundCheck, Users } from "lucide-react"
import { UserResultCard } from "@/components/social/user-result-card"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export default async function ConnectionsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params
  const { tab } = await searchParams
  const viewer = await requireUser(`/profile/${id}/connections${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`)
  const activeTab = tab === "following" ? "following" : "followers"

  const profile = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, hideFollowers: true, hideFollowing: true },
  })
  if (!profile) notFound()

  const isOwner = viewer.id === id
  const locked = !isOwner && (activeTab === "followers" ? profile.hideFollowers : profile.hideFollowing)
  const [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: id } }),
    prisma.follow.count({ where: { followerId: id } }),
  ])

  const rows = locked
    ? null
    : activeTab === "followers"
      ? await prisma.follow.findMany({
          where: { followingId: id },
          take: 100,
          orderBy: { createdAt: "desc" },
          select: { follower: { select: { id: true, name: true, image: true, bio: true, role: true, raputation: true, _count: { select: { posts: true, comments: true, followers: true } } } } },
        })
      : await prisma.follow.findMany({
          where: { followerId: id },
          take: 100,
          orderBy: { createdAt: "desc" },
          select: { following: { select: { id: true, name: true, image: true, bio: true, role: true, raputation: true, _count: { select: { posts: true, comments: true, followers: true } } } } },
        })

  const users = rows?.map((row) => "follower" in row ? row.follower : row.following).filter((user) => user.role !== "BANNED") ?? []
  const viewerRelations = users.length
    ? await prisma.follow.findMany({ where: { followerId: viewer.id, followingId: { in: users.map((user) => user.id) } }, select: { followingId: true } })
    : []
  const followedIds = new Set(viewerRelations.map((item) => item.followingId))

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero index="13" eyebrow="CAMPUS CONNECTIONS" title={`${profile.name ?? "未命名用户"}的校园关系`} description="关注是一种轻量而明确的连接。每位成员可以分别控制关注者与正在关注名单的可见范围。" icon={Users} accentClass="bg-[#b9ddbd]" compact>
        <Link href={`/profile/${id}`} className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 text-xs font-bold dark:border-[#f5f0e5] dark:bg-[#191914]"><ArrowLeft className="h-4 w-4" />返回个人主页</Link>
      </EditorialHero>
      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 border-2 border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]">
            <Link href={`/profile/${id}/connections?tab=followers`} className={`p-4 text-center ${activeTab === "followers" ? "bg-[#d9ef61] text-[#191914]" : "hover:bg-[#ece6da] dark:hover:bg-[#292821]"}`}><strong className="block font-mono text-xl">{followerCount}</strong><span className="text-xs">关注者</span></Link>
            <Link href={`/profile/${id}/connections?tab=following`} className={`border-l-2 border-[#191914] p-4 text-center dark:border-[#f5f0e5] ${activeTab === "following" ? "bg-[#f3c84b] text-[#191914]" : "hover:bg-[#ece6da] dark:hover:bg-[#292821]"}`}><strong className="block font-mono text-xl">{followingCount}</strong><span className="text-xs">正在关注</span></Link>
          </div>
          <EditorialHeading className="mt-10" index="01" eyebrow={activeTab === "followers" ? "FOLLOWERS" : "FOLLOWING"} title={activeTab === "followers" ? "关注这位成员的人" : "这位成员正在关注"} meta={locked ? "PRIVATE" : `${users.length} 位`} />
          {locked ? (
            <EditorialPanel className="mt-7 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#191914] bg-[#ffb4aa] text-[#b52f1e] dark:border-[#f5f0e5]"><LockKeyhole className="h-7 w-7" /></div>
              <p className="mt-5 font-serif text-2xl font-bold">这份名单已设为私密</p>
              <p className="mt-2 text-sm text-[#777268] dark:text-[#aaa69c]">只有名单所属者本人可以查看具体成员。</p>
            </EditorialPanel>
          ) : (
            <EditorialPanel className="mt-7 px-5 sm:px-7">
              {users.length ? users.map((user) => <UserResultCard key={user.id} user={user} viewerId={viewer.id} isFollowing={followedIds.has(user.id)} />) : <div className="py-20 text-center"><UserRoundCheck className="mx-auto h-10 w-10 text-[#e4532f]" /><p className="mt-4 font-serif text-xl font-bold">这里还没有成员</p></div>}
            </EditorialPanel>
          )}
        </div>
      </main>
    </div>
  )
}
