import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth"
import { LoginForm } from "@/app/auth/signin/login-form"
import { FloatingParticles } from "@/components/effects/floating-particles"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { Sparkles, ArrowRight } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-900 dark:to-stone-950">
        <FloatingParticles />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/images/auth-decoration.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-stone-900/40" />

        <div className="relative flex flex-col justify-between p-16">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-sm font-bold text-white">二</span>
            </div>
          </div>

          <div>
            <ScrollReveal>
              <h2 className="text-4xl font-light tracking-tight text-white">
                欢迎回来
              </h2>
            </ScrollReveal>
            <ScrollReveal delay={150}>
              <p className="mt-4 text-lg leading-relaxed text-stone-300">
                连接每一个校园故事，
                <br />
                分享你的精彩瞬间。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-10 space-y-4">
                {[
                  "学习资料共享与难题讨论",
                  "失物招领与互帮互助",
                  "匿名表白墙 · 说出你的心声",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-stone-400"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/10">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={450}>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="h-3 w-3" />
              北京二中经开区学校论坛
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 to-white dark:from-stone-950/50 dark:to-stone-900" />
        <div className="relative w-full max-w-sm">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 mb-4">
                <span className="text-lg font-bold text-stone-700 dark:text-stone-300">二</span>
              </div>
              <h1 className="text-2xl font-light tracking-tight text-stone-800 dark:text-stone-200">
                登录
              </h1>
              <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
                使用你的账号继续
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <form
              action={async () => {
                "use server"
                await signIn("github", { redirectTo: "/" })
              }}
            >
              <Button
                type="submit"
                variant="outline"
                className="w-full mb-6 h-11 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub 登录
              </Button>
            </form>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-stone-200 dark:border-stone-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-stone-950 px-3 text-stone-400 dark:text-stone-500">
                  或使用账号登录
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Suspense fallback={<div className="text-sm text-stone-400">加载中...</div>}>
              <LoginForm />
            </Suspense>
          </ScrollReveal>

          <ScrollReveal delay={250}>
            <p className="mt-8 text-center text-sm text-stone-400 dark:text-stone-500">
              还没有账号？{" "}
              <Link
                href="/auth/register"
                className="font-medium text-stone-700 dark:text-stone-300 underline underline-offset-4 hover:text-stone-900 dark:hover:text-stone-100 transition-colors inline-flex items-center gap-0.5"
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
