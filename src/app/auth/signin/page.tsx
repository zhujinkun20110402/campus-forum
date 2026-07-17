import Link from "next/link"
import { ArrowRight, BookOpen, Heart, Search } from "lucide-react"
import { LoginForm } from "@/app/auth/signin/login-form"
import { SafeImage } from "@/components/ui/safe-image"

export default function SignInPage() {
  return (
    <div className="grid min-h-screen bg-[#f4efe4] text-[#191914] dark:bg-[#11110f] dark:text-[#f5f0e5] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r-2 border-[#191914] bg-[#191914] text-[#f5f0e5] dark:border-[#f5f0e5] lg:block">
        <SafeImage src="/images/campus-03.jpg" alt="校园操场" fill priority sizes="55vw" className="object-cover opacity-45 saturate-[0.8]" />
        <div className="absolute inset-0 bg-[#11110f]/55" />
        <div className="relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden border-2 border-white bg-[#d9ef61]">
              <SafeImage src="/images/school-logo.png" alt="校徽" fill sizes="44px" className="object-contain p-1" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold">北京二中经开区学校</p>
              <p className="mt-1 font-mono text-[8px] font-bold tracking-[0.18em] text-[#ff8a68]">CAMPUS FORUM</p>
            </div>
          </Link>

          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#d9ef61]">WELCOME BACK</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
              回到校园，<br />
              <span className="text-[#ff8a68]">继续那场讨论。</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-7 text-white/55">这里保存着同学们分享的问题、线索、活动和每一次认真回应。</p>

            <div className="mt-9 grid max-w-xl grid-cols-3 border-y border-white/30">
              {[
                [BookOpen, "学习交流"],
                [Search, "失物招领"],
                [Heart, "匿名心声"],
              ].map(([Icon, label], index) => {
                const ItemIcon = Icon as React.ComponentType<{ className?: string }>
                return (
                  <div key={String(label)} className={index > 0 ? "border-l border-white/25 px-3 py-4 text-center" : "px-3 py-4 text-center"}>
                    <ItemIcon className="mx-auto h-4 w-4 text-[#f3c84b]" />
                    <p className="mt-2 text-xs text-white/60">{label as string}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-white/30">本固枝盛 · 学富国强</p>
        </div>
      </section>

      <main className="campus-paper flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative h-10 w-10 overflow-hidden border-2 border-[#191914] bg-[#d9ef61] dark:border-[#f5f0e5]">
              <SafeImage src="/images/school-logo.png" alt="校徽" fill sizes="40px" className="object-contain p-1" />
            </div>
            <span className="font-serif text-sm font-bold">校园论坛</span>
          </Link>

          <div className="border-2 border-[#191914] bg-[#fffaf0] p-6 shadow-[7px_7px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[7px_7px_0_#f5f0e5] sm:p-8">
            <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#e4532f]">MEMBER LOGIN</p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">欢迎回来</h1>
            <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">使用校园账号继续浏览与讨论。</p>
            <div className="mt-8"><LoginForm /></div>
          </div>

          <p className="mt-8 text-center text-sm text-[#777268] dark:text-[#989389]">
            还没有账号？{" "}
            <Link href="/auth/register" className="inline-flex items-center gap-1 font-bold text-[#d44120] underline decoration-2 underline-offset-4 dark:text-[#ff8a68]">
              立即注册 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
