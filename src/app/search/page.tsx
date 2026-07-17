import { BookOpen, Search, Sparkles } from "lucide-react"
import { PostList } from "@/components/post/post-list"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const query = q?.trim() ?? ""

  let posts: {
    id: string
    title: string
    content: string
    author: { id: string; name: string | null; image: string | null; role: string; raputation: number }
    category: { name: string; slug: string }
    _count: { comments: number; likes: number }
    createdAt: Date | string
  }[] | null = null

  if (query) {
    posts = await prisma.post.findMany({
      where: { OR: [{ title: { contains: query, mode: "insensitive" } }, { content: { contains: query, mode: "insensitive" } }] },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
        category: { select: { name: true, slug: true } },
        _count: { select: { comments: true, likes: true } },
      },
    })
  }

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="08"
        eyebrow="CAMPUS SEARCH"
        title="从校园里找到答案"
        description="搜索标题与正文，找回一条通知、一份资料，或者那场你还想继续的讨论。"
        icon={Search}
        accentClass="bg-[#d9ef61]"
        compact
      />

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <form className="border-2 border-[#191914] bg-[#fffaf0] p-3 shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[6px_6px_0_#f5f0e5] sm:flex sm:items-center sm:gap-3" role="search">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e4532f]" />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="输入标题、关键词或一句记得的话……"
                className="h-14 w-full border-0 bg-[#ece6da]/65 px-5 pl-12 text-base font-medium text-[#191914] outline-none placeholder:text-[#918b80] focus:ring-2 focus:ring-[#ff6b43] dark:bg-[#11110f] dark:text-[#f5f0e5]"
              />
            </div>
            <button type="submit" className="mt-3 flex h-12 w-full items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-6 text-sm font-bold text-[#191914] transition-transform hover:-translate-y-0.5 sm:mt-0 sm:h-14 sm:w-auto dark:border-[#f5f0e5]">
              搜索 <span aria-hidden>↗</span>
            </button>
          </form>

          <div className="mt-12">
            {query ? (
              <>
                <EditorialHeading
                  index="01"
                  eyebrow="SEARCH RESULTS"
                  title={`关于「${query}」`}
                  meta={<span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#e4532f]" />{posts?.length ?? 0} 条结果</span>}
                />
                <div className="mt-7">
                  {posts && posts.length > 0 ? (
                    <PostList posts={posts} />
                  ) : (
                    <EditorialPanel className="py-20 text-center">
                      <BookOpen className="mx-auto h-11 w-11 text-[#e4532f]" />
                      <p className="mt-4 font-serif text-2xl font-bold">没有找到相关帖子</p>
                      <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">换一个更简短的关键词试试。</p>
                    </EditorialPanel>
                  )}
                </div>
              </>
            ) : (
              <EditorialPanel className="py-20 text-center">
                <Search className="mx-auto h-11 w-11 text-[#e4532f]" />
                <p className="mt-4 font-serif text-2xl font-bold">输入关键词开始寻找</p>
                <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">搜索范围包含帖子标题与正文。</p>
              </EditorialPanel>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
