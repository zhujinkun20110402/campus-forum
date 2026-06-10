import Link from "next/link"
import { LoginForm } from "@/app/auth/signin/login-form"
import { AcademicParticles } from "@/components/effects/academic-particles"
import { MottoStream } from "@/components/effects/motto-stream"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { ArrowRight, BookOpen, Search, Heart } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950">
        <AcademicParticles />

        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-indigo-950/40" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          {/* Top: Logo */}
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 overflow-hidden flex items-center justify-center">
                <span className="text-sm font-bold text-gold-400">二</span>
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
                <span className="text-gold-400">校园论坛</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mb-6">
                <MottoStream size="sm" animated={false} />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-base text-indigo-200/60 leading-relaxed max-w-sm">
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
                    className="flex items-center gap-3 text-sm text-indigo-200/50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                      <item.icon className="h-4 w-4 text-gold-400/60" />
                    </span>
                    {item.text}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Bottom */}
          <ScrollReveal delay={0.5}>
            <div className="flex items-center gap-2 text-xs text-indigo-300/40">
              <span className="h-px w-8 bg-indigo-300/20" />
              北京二中经开区学校论坛
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-4 sm:px-8 py-12 relative bg-slate-50 dark:bg-indigo-950">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-white dark:from-indigo-950/50 dark:to-indigo-900" />

        <div className="relative w-full max-w-sm">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-800/50 mb-5">
                <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">二</span>
              </div>
              <h1 className="font-serif text-2xl font-semibold text-slate-800 dark:text-slate-100">
                登录
              </h1>
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                使用你的账号继续
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <LoginForm />
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
              还没有账号？{" "}
              <Link
                href="/auth/register"
                className="font-medium text-indigo-600 dark:text-indigo-400 underline underline-offset-4 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-0.5"
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
