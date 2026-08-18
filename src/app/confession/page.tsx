import Link from "next/link"
import { ArrowRight, Bird, CalendarHeart, Feather, Heart, Sparkles } from "lucide-react"
import { ConfessionForm } from "@/components/confession/confession-form"
import { PostList } from "@/components/post/post-list"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export default async function ConfessionPage() {
  await requireUser("/confession")
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
        eyebrow="QIXI SPECIAL · ANONYMOUS VOICE"
        title="把没说出口的话，留在这里"
        description="七夕将至，鹊桥已搭好。匿名并不意味着随意——认真写下你的心声，也温柔地对待每一份被分享出来的真诚。"
        icon={Heart}
        accentClass="bg-[#ffb4aa]"
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-bold tracking-[0.12em]">
          <span className="inline-flex items-center gap-1.5 border border-[#191914] bg-[#ffb4aa] px-3 py-2 text-[#e4532f] dark:border-[#f5f0e5] dark:bg-[#ffb4aa] dark:text-[#191914]">
            <Heart className="h-3 w-3 animate-qixi-heartbeat" aria-hidden /> QIXI SPECIAL
          </span>
          {["ANONYMOUS", "SINCERE", "KIND"].map((word) => <span key={word} className="border border-[#191914] bg-[#fffaf0] px-3 py-2 dark:border-[#f5f0e5] dark:bg-[#191914]">{word}</span>)}
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative mb-12 overflow-hidden border-2 border-[#191914] bg-[#ffb4aa] p-5 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#ffb4aa] sm:p-6">
            <div aria-hidden className="pointer-events-none absolute -bottom-7 -right-5 rotate-6 text-[#191914]/10 dark:text-[#f5f0e5]/10">
              <Bird className="h-20 w-20" />
            </div>
            <p className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.18em] text-[#e4532f]">
              <CalendarHeart className="h-3.5 w-3.5" aria-hidden />
              QIXI SPECIAL · 七夕告白季
            </p>
            <h2 className="mt-2 font-serif text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              鹊桥已经搭好，只差你的一句话
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#191914]/60 dark:text-[#f5f0e5]/60">
              把不敢当面说出口的话匿名写下来，让 TA 在表白墙遇见你的心意。
            </p>
            <Link
              href="#compose"
              className="group mt-4 inline-flex min-h-10 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 py-2 text-xs font-bold shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:bg-[#171713] dark:text-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
            >
              <Feather className="h-3.5 w-3.5" aria-hidden />
              写下你的告白
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>

          <div id="compose" className="mb-12 scroll-mt-28">
            <ConfessionForm />
          </div>

          <EditorialHeading
            index="01"
            eyebrow="LATEST VOICES"
            title="最近的匿名心声"
            meta={<span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#e4532f]" />{posts.length} 条</span>}
          />

          <div className="mt-7">
            {posts.length === 0 ? (
              <EditorialPanel className="py-20 text-center">
                <Heart className="mx-auto h-11 w-11 animate-qixi-heartbeat text-[#e4532f]" />
                <p className="mt-4 font-serif text-2xl font-bold">还没有人写下心声</p>
                <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">这个七夕，也许你会成为第一个勇敢的人。</p>
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
