import { notFound } from "next/navigation"
import {
  BookOpen,
  FileText,
  GraduationCap,
  Heart,
  Megaphone,
  MessageCircle,
  PartyPopper,
  Search,
  ShoppingBag,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { CountUp } from "@/components/effects/count-up"
import { PostList } from "@/components/post/post-list"
import { EditorialHeading, EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

const categoryConfig: Record<string, {
  name: string
  description: string
  english: string
  icon: LucideIcon
  accentClass: string
}> = {
  announcement: { name: "校园公告", description: "学校重要通知、活动安排与学生会动态。", english: "NOTICE BOARD", icon: Megaphone, accentClass: "bg-[#ff6b43]" },
  lostfound: { name: "失物招领", description: "丢失物品寻找、拾到物品归还，让线索更快流动。", english: "LOST & FOUND", icon: Search, accentClass: "bg-[#d9ef61]" },
  study: { name: "学习交流", description: "学习资料、难题讨论与真实有效的经验分享。", english: "STUDY ROOM", icon: GraduationCap, accentClass: "bg-[#f3c84b]" },
  confession: { name: "表白墙", description: "匿名写下心声，也温柔对待每一份真诚。", english: "ANONYMOUS VOICE", icon: Heart, accentClass: "bg-[#ffb4aa]" },
  activity: { name: "校园活动", description: "社团活动、比赛通知、招募与校园邀约。", english: "CAMPUS EVENTS", icon: PartyPopper, accentClass: "bg-[#b9ddbd]" },
  secondhand: { name: "二手交易", description: "闲置物品流转、书籍交换与好物推荐。", english: "CAMPUS MARKET", icon: ShoppingBag, accentClass: "bg-[#f2d0b2]" },
  "problem-discussion": { name: "难题讨论", description: "学科难题、竞赛题目与知识探讨。", english: "PROBLEM LAB", icon: MessageCircle, accentClass: "bg-[#e5ded1]" },
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  await requireUser(`/category/${slug}`)
  const config = categoryConfig[slug]
  if (!config) notFound()

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true, role: true, raputation: true } },
          category: { select: { name: true, slug: true } },
          _count: { select: { comments: true, likes: true } },
        },
      },
    },
  })

  if (!category) notFound()

  const totalComments = category.posts.reduce((sum, post) => sum + post._count.comments, 0)
  const totalLikes = category.posts.reduce((sum, post) => sum + post._count.likes, 0)

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="07"
        eyebrow={config.english}
        title={config.name}
        description={config.description}
        icon={config.icon}
        accentClass={config.accentClass}
      >
        <div className="inline-grid grid-cols-3 border-2 border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#191914]">
          {[
            [FileText, category.posts.length, "帖子"],
            [MessageCircle, totalComments, "评论"],
            [Heart, totalLikes, "点赞"],
          ].map(([Icon, value, label], index) => {
            const StatIcon = Icon as React.ComponentType<{ className?: string }>
            return (
              <div key={String(label)} className={index > 0 ? "border-l border-[#191914]/25 px-4 py-3 text-center dark:border-white/25 sm:px-6" : "px-4 py-3 text-center sm:px-6"}>
                <StatIcon className="mx-auto h-3.5 w-3.5 text-[#e4532f]" />
                <p className="mt-1 font-mono text-lg font-bold"><CountUp end={Number(value)} duration={1200} /></p>
                <p className="text-[10px] text-[#777268] dark:text-[#989389]">{label as string}</p>
              </div>
            )
          })}
        </div>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <EditorialHeading index="01" eyebrow="LATEST POSTS" title={`${config.name}里的新消息`} meta={`共 ${category.posts.length} 条`} />
          <div className="mt-7">
            {category.posts.length === 0 ? (
              <EditorialPanel className="py-20 text-center">
                <BookOpen className="mx-auto h-11 w-11 text-[#e4532f]" />
                <p className="mt-4 font-serif text-2xl font-bold">这里还没有帖子</p>
                <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">来成为第一个发起讨论的人。</p>
              </EditorialPanel>
            ) : slug === "confession" ? (
              <PostList posts={category.posts.map((post) => ({ ...post, author: { id: "anonymous", name: null, image: null } }))} hideAuthor />
            ) : (
              <PostList posts={category.posts} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
