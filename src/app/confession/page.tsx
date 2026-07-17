import Link from "next/link"
import { Heart, MessageCircle, Sparkles } from "lucide-react"
import { ConfessionForm } from "@/components/confession/confession-form"
import { PostList } from "@/components/post/post-list"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function ConfessionPage() {
  const session = await auth()
  const posts = await prisma.post.findMany({
    where: { category: { slug: "confession" } },
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { category: { select: { name: true, slug: true } }, _count: { select: { comments: true, likes: true } } },
  })

  return (
    <div className="min-h-screen bg-[#f3e7e3] dark:bg-[#10100e]">
      <EditorialHero
        index="09"
        eyebrow="ANONYMOUS VOICE"
        title="把没说出口的话，留在这里"
        description="匿名并不意味着随意。认真写下你的心声，也温柔地对待每一份被分享出来的真诚。"
        icon={Heart}
        accentClass="bg-[#ffb4aa]"
      >
        <div className="flex flex-wrap gap-2 font-mono text-[9px] font-bold tracking-[0.12em]">
          {["ANONYMOUS", "SINCERE", "KIND"].map((word) => <span key={word} className="border border-[#191914] bg-[#fffaf0] px-3 py-2 dark:border-[#f5f0e5] dark:bg-[#191914]">{word}</span>)}
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {session?.user ? (
            <div className="mb-12"><ConfessionForm /></div>
          ) : (
            <EditorialPanel className="mb-12 p-8 text-center">
              <MessageCircle className="mx-auto h-9 w-9 text-[#e4532f]" />
              <p className="mt-3 font-serif text-xl font-bold">登录后即可匿名发布</p>
              <Link href="/auth/signin" className="mt-5 inline-flex border-2 border-[#191914] bg-[#ffb4aa] px-5 py-2.5 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]">前往登录</Link>
            </EditorialPanel>
          )}

          <EditorialHeading
            index="01"
            eyebrow="LATEST VOICES"
            title="最近的匿名心声"
            meta={<span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#e4532f]" />{posts.length} 条</span>}
          />

          <div className="mt-7">
            {posts.length === 0 ? (
              <EditorialPanel className="py-20 text-center">
                <Heart className="mx-auto h-11 w-11 text-[#e4532f]" />
                <p className="mt-4 font-serif text-2xl font-bold">还没有人写下心声</p>
                <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">也许你会成为第一个勇敢的人。</p>
              </EditorialPanel>
            ) : (
              <PostList posts={posts.map((post) => ({ ...post, author: { id: "anonymous", name: null, image: null } }))} hideAuthor />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
