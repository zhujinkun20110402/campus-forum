import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { PostForm } from "@/components/post/post-form"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { PenLine, Sparkles, Lightbulb } from "lucide-react"

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const { category: categorySlug } = await searchParams
  const isAdmin = session.user.role === "ADMIN"

  const allCategories = await prisma.category.findMany()

  const categories = allCategories.filter((cat) => {
    if (cat.slug === "confession") return false
    if (cat.slug === "announcement" && !isAdmin) return false
    if (cat.slug === "lostfound" && !categorySlug) return false
    if (categorySlug === "lostfound" && cat.slug !== "lostfound") return false
    return true
  })

  const isLostFound = categorySlug === "lostfound"

  const tips = [
    "标题要简洁明了，概括帖子核心内容",
    "选择合适的分类，让更多人看到你的帖子",
    "内容支持 Markdown 格式，可以丰富排版",
    "保持友善交流，共建和谐社区氛围",
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-indigo-950">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 pt-28 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-indigo-600 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <PenLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {isLostFound ? "发布寻物启事" : "发布新帖子"}
                </h1>
                <p className="text-sm text-indigo-300/50">
                  分享你的故事，连接校园的每一个角落
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Form Section */}
      <div className="relative -mt-6 mx-auto max-w-3xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-xl shadow-slate-200/20 dark:shadow-indigo-950/30 p-6 sm:p-8">
                <PostForm categories={categories} />
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar Tips */}
          <div className="hidden lg:block">
            <ScrollReveal delay={0.1}>
              <div className="rounded-3xl bg-white dark:bg-indigo-900/40 border border-slate-200 dark:border-indigo-800/60 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb className="h-5 w-5 text-gold-500" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    发帖小贴士
                  </h3>
                </div>
                <div className="space-y-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-indigo-50 dark:bg-indigo-800/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-indigo-800/40">
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                    <span>让每一次分享都有价值</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  )
}
