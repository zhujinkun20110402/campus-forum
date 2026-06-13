import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { LoginForm } from "@/app/auth/signin/login-form"
import { AcademicParticles } from "@/components/effects/academic-particles"
import { MottoStream } from "@/components/effects/motto-stream"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { ArrowRight, BookOpen, Search, Heart } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#0a0a0a]">
        <AcademicParticles />

        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-[#0a0a0a]/40" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          {/* Top: Logo */}
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
                <SafeImage src="/images/school-logo.png" alt="校徽" fill className="object-contain p-1.5" />
              </div>
              <span className="text-sm font-medium text-white/80">
                北京二中经开区学校
              </span>
            </div>
          </ScrollReveal>

          {/* Middle: Content */}
          <div className="space-y-8">
            <ScrollReveal delay={0.1}>
              <h2 className="font-serif text-4xl xl:text-5xl text-white tracking-wide leading-tight">
                欢迎回到
                <br />
                <span className="text-amber-400">校园论坛</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mb-6">
                <MottoStream size="sm" animated={false} />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-base text-white/30 leading-relaxed max-w-sm">
                连接每一个校园故事，分享你的精彩瞬间。
                在这里，学习、交流、互助、表白，让校园生活更加丰富多彩。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="space-y-3">
                {[
                  { icon: BookOpen, text: "学习资料共享与难题讨论" },
                  { icon: Search, text: "失物招领与互帮互助" },
                  { icon: Heart, text: "匿名表白墙 · 说出你的心声" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-white/30"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                      <item.icon className="h-4 w-4 text-amber-400/60" />
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom */}
          <ScrollReveal delay={0.5}>
            <div className="flex items-center gap-2 text-xs text-white/20">
              <span className="h-px w-8 bg-white/10" />
              北京二中经开区学校论坛
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-4 sm:px-8 py-12 relative bg-[#faf9f7] dark:bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100/50 to-white dark:from-[#0a0a0a]/50 dark:to-[#0f0f0f]" />

        <div className="relative w-full max-w-sm">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="relative h-14 w-14 rounded-2xl bg-stone-100 dark:bg-stone-800 overflow-hidden mb-5 mx-auto">
                <SafeImage src="/images/school-logo.png" alt="校徽" fill className="object-contain p-2" />
              </div>
              <h1 className="font-serif text-2xl font-semibold text-stone-800 dark:text-stone-100">
                登录
              </h1>
              <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
                使用你的账号继续
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <LoginForm />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="mt-8 text-center text-sm text-stone-400 dark:text-stone-500">
              还没有账号？{" "}
              <Link
                href="/auth/register"
                className="font-medium text-amber-600 dark:text-amber-400 underline underline-offset-4 hover:text-amber-700 dark:hover:text-amber-300 transition-colors inline-flex items-center gap-0.5"
              >
                立即注册
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
