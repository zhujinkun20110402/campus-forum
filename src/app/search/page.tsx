import { BookOpen, Search, Sparkles, UserRoundSearch } from "lucide-react"
import { PostList } from "@/components/post/post-list"
import { UserResultCard } from "@/components/social/user-result-card"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const viewer = await requireUser(`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`)
  const query = q?.trim() ?? ""

  const [posts, users] = query
    ? await Promise.all([
        prisma.post.findMany({
          where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }] },
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
            category: { select: { name: true, slug: true } },
            _count: { select: { comments: true, likes: true } },
          },
        }),
        prisma.user.findMany({
          where: {
            role: { not: "BANNED" },
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { bio: { contains: query, mode: "insensitive" } },
            ],
          },
          take: 12,
          orderBy: [{ raputation: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            role: true,
            raputation: true,
            _count: { select: { posts: true, comments: true, followers: true } },
          },
        }),
      ])
    : [null, null]

  const followed = users?.length
    ? await prisma.follow.findMany({
        where: { followerId: viewer.id, followingId: { in: users.map((user) => user.id) } },
        select: { followingId: true },
      })
    : []
  const followedIds = new Set(followed.map((item) => item.followingId))
  const totalResults = (posts?.length ?? 0) + (users?.length ?? 0)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero index="08" eyebrow="CAMPUS SEARCH" title="从帖子与人群中找到答案" description="搜索帖子标题与正文，也可以通过公开昵称和个人简介找到校园成员。邮箱等私密信息不会进入搜索范围。" icon={Search} accentClass="bg-[#d9ef61]" compact />

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <form className="border-2 border-[#191914] bg-[#fffaf0] p-3 shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[6px_6px_0_#f5f0e5] sm:flex sm:items-center sm:gap-3" role="search">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e4532f]" />
              <input type="search" name="q" defaultValue={query} placeholder="搜索帖子、昵称或个人简介……" className="h-14 w-full border-0 bg-[#ece6da]/65 px-5 pl-12 text-base font-medium text-[#191914] outline-none placeholder:text-[#918b80] focus:ring-2 focus:ring-[#ff6b43] dark:bg-[#11110f] dark:text-[#f5f0e5]" />
            </div>
            <button type="submit" className="mt-3 flex h-12 w-full items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-6 text-sm font-bold text-[#191914] transition-transform hover:-translate-y-0.5 sm:mt-0 sm:h-14 sm:w-auto dark:border-[#f5f0e5]">搜索 <span aria-hidden>↗</span></button>
          </form>

          {query ? (
            <div className="mt-12 space-y-14">
              <section>
                <EditorialHeading index="01" eyebrow="PEOPLE" title="找到校园里的同学" meta={`${users?.length ?? 0} 位成员`} />
                <EditorialPanel className="mt-7 px-5 sm:px-7">
                  {users?.length ? users.map((user) => <UserResultCard key={user.id} user={user} viewerId={viewer.id} isFollowing={followedIds.has(user.id)} />) : <EmptySearch icon={UserRoundSearch} title="没有匹配的成员" text="试试昵称中的一部分，或者搜索个人简介里的关键词。" />}
                </EditorialPanel>
              </section>

              <section>
                <EditorialHeading index="02" eyebrow="POSTS" title={`关于「${query}」的帖子`} meta={<span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#e4532f]" />{posts?.length ?? 0} 条</span>} />
                <div className="mt-7">{posts?.length ? <PostList posts={posts} /> : <EditorialPanel><EmptySearch icon={BookOpen} title="没有找到相关帖子" text="换一个更简短的关键词试试。" /></EditorialPanel>}</div>
              </section>

              <p className="text-center font-mono text-[9px] tracking-[0.12em] text-[#918b80]">TOTAL {totalResults} RESULTS</p>
            </div>
          ) : (
            <EditorialPanel className="mt-12 py-20 text-center"><Search className="mx-auto h-11 w-11 text-[#e4532f]" /><p className="mt-4 font-serif text-2xl font-bold">输入关键词开始寻找</p><p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">帖子与成员会分别呈现，方便快速判断。</p></EditorialPanel>
          )}
        </div>
      </main>
    </div>
  )
}

function EmptySearch({ icon: Icon, title, text }: { icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return <div className="py-16 text-center"><Icon className="mx-auto h-10 w-10 text-[#e4532f]" /><p className="mt-4 font-serif text-xl font-bold">{title}</p><p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">{text}</p></div>
}
