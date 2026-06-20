import { getPhotos } from "@/lib/album-store"
import { auth } from "@/lib/auth"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { PhotowallAdmin } from "@/components/album/photowall-admin"
import { PhotowallGrid } from "@/components/album/photowall-grid"
import { Images, Camera } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PhotowallPage() {
  const [photos, session] = await Promise.all([getPhotos(), auth()])
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-900 pt-32 pb-20">
        {/* 装饰光晕 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-stone-600/10 blur-[100px]" />
        </div>

        {/* 噪点纹理 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' /%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
              <Camera className="h-7 w-7 text-amber-400" />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
              校园影像
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="text-stone-400 max-w-xl mx-auto leading-relaxed">
              用镜头定格时光，用画面讲述故事。这里收录校园里的每一个珍贵瞬间。
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.3}>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <Images className="h-3.5 w-3.5" />
                {photos.length} 张照片
              </span>
              <span className="text-stone-700">·</span>
              <span>持续更新中</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Photo Wall */}
      <div className="relative -mt-10 mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 dark:border-stone-700 py-24 text-center">
            <Camera className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
            <p className="mt-4 text-sm text-stone-400 dark:text-stone-500">
              照片墙正在筹备中，敬请期待
            </p>
          </div>
        ) : (
          <PhotowallGrid photos={photos} isAdmin={isAdmin} />
        )}

        {/* Admin Panel */}
        {isAdmin && <PhotowallAdmin />}
      </div>
    </div>
  )
}
