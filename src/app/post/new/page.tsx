import { Lightbulb, PenLine, Sparkles } from "lucide-react"
import { PostForm } from "@/components/post/post-form"
import { EditorialHero, EditorialPanel } from "@/components/ui/editorial"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/session"

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: categorySlug } = await searchParams
  const user = await requireUser(`/post/new${categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""}`)
  const isAdmin = user.role === "ADMIN"
  const allCategories = await prisma.category.findMany()

  const categories = allCategories.filter((category) => {
    if (category.slug === "confession") return false
    if (category.slug === "announcement" && !isAdmin) return false
    if (category.slug === "lostfound" && !categorySlug) return false
    if (categorySlug === "lostfound" && category.slug !== "lostfound") return false
    return true
  })

  const isLostFound = categorySlug === "lostfound"
  const tips = [
    "用一句清晰的标题说明帖子重点",
    "选择准确分类，方便同学快速找到",
    "正文支持 Markdown 与图片上传",
    "公开内容中不要留下敏感个人信息",
  ]

  return (
    <div className="min-h-screen bg-[#ece6da] dark:bg-[#10100e]">
      <EditorialHero
        index="05"
        eyebrow="START A CONVERSATION"
        title={isLostFound ? "发布寻物启事" : "写下校园新鲜事"}
        description={isLostFound ? "把物品特征、丢失时间与地点描述清楚，让更多同学帮助你找到它。" : "一个问题、一段见闻或一次认真分享，都可能成为校园里一场有价值的讨论。"}
        icon={PenLine}
        accentClass="bg-[#ff6b43]"
        compact
      >
        <span className="inline-flex items-center gap-2 border border-[#191914] bg-[#fffaf0] px-3 py-2 font-mono text-[9px] font-bold tracking-[0.14em] dark:border-[#f5f0e5] dark:bg-[#191914]">
          <Sparkles className="h-3.5 w-3.5 text-[#e4532f]" /> SHARE WITH CARE
        </span>
      </EditorialHero>

      <main className="campus-dot-grid px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-5xl items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <EditorialPanel className="p-6 sm:p-8">
            <div className="mb-7 border-b-2 border-[#191914] pb-5 dark:border-[#f5f0e5]">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">EDITOR / NEW POST</p>
              <h2 className="mt-2 font-serif text-2xl font-bold">整理你的表达</h2>
            </div>
            <PostForm categories={categories} />
          </EditorialPanel>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="border-2 border-[#191914] bg-[#d9ef61] p-5 text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5]">
              <div className="flex items-center gap-2 border-b border-[#191914]/25 pb-4">
                <Lightbulb className="h-5 w-5" />
                <h3 className="font-serif text-lg font-bold">发帖小贴士</h3>
              </div>
              <ol className="mt-5 space-y-4">
                {tips.map((tip, index) => (
                  <li key={tip} className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-6">
                    <span className="flex h-6 w-6 items-center justify-center border border-[#191914] bg-[#fffaf0] font-mono text-[9px] font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="border-2 border-[#191914] bg-[#191914] p-5 text-[#f5f0e5] dark:border-[#f5f0e5]">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#ff8a68]">COMMUNITY FIRST</p>
              <p className="mt-3 font-serif text-lg font-bold">认真表达，也认真对待屏幕另一端的人。</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
