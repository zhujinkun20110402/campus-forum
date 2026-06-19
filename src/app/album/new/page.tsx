import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AlbumForm } from "@/app/album/new/album-form"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { PenLine, Sparkles, Lightbulb } from "lucide-react"

export default async function NewAlbumPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const tips = [
    "为相册起一个简洁有意义的标题",
    "添加描述，帮助他人了解这组照片的故事",
    "上传一张封面图，让相册更具吸引力",
    "可以为每张照片添加说明文字",
    "保持友善分享，共建和谐社区氛围",
  ]

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-800 via-stone-900 to-amber-950 pt-28 pb-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,119,6,0.10),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-amber-500 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <PenLine className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  创建新相册
                </h1>
                <p className="text-sm text-amber-200/60">
                  用影像珍藏校园里的每个瞬间
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
              <div className="rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/20 dark:shadow-black/30 p-6 sm:p-8">
                <AlbumForm />
              </div>
            </ScrollReveal>
          </div>

          {/* Sidebar Tips */}
          <div className="hidden lg:block">
            <ScrollReveal delay={0.1}>
              <div className="rounded-3xl bg-white dark:bg-[#141414] border border-stone-200 dark:border-stone-800 shadow-sm p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                    创建小贴士
                  </h3>
                </div>
                <div className="space-y-4">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="h-5 w-5 rounded-full bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                        {tip}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>让每一张照片都有温度</span>
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
