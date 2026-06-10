"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/lib/actions"
import { AcademicParticles } from "@/components/effects/academic-particles"
import { MottoStream } from "@/components/effects/motto-stream"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { Sparkles, ArrowRight, CheckCircle, GraduationCap } from "lucide-react"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)

  const benefits = [
    "免费注册，即刻使用",
    "与全校同学互动交流",
    "发布帖子、参与讨论",
    "失物招领、表白墙等特色功能",
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-indigo-950">
        <AcademicParticles />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(212,175,55,0.1),_transparent_50%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-transparent to-indigo-950/40" />

        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden">
                <GraduationCap className="h-7 w-7 text-gold-400" />
              </div>
              <div>
                <span className="text-white font-medium tracking-wide">北京二中经开区学校</span>
                <span className="block text-xs text-indigo-300/50">校园论坛</span>
              </div>
            </div>
          </ScrollReveal>

          <div className="space-y-8">
            <ScrollReveal delay={0.1}>
              <h2 className="text-4xl xl:text-5xl font-serif font-bold text-white leading-tight">
                加入我们
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-indigo-200/60">
                注册一个账号，<br />
                开启你的校园社区之旅。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="mb-6">
                <MottoStream size="sm" animated={false} />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <div className="space-y-4">
                {benefits.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-indigo-200/50"
                  >
                    <CheckCircle className="h-4 w-4 text-gold-400/70 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.4}>
            <div className="flex items-center gap-2 text-xs text-indigo-400/40">
              <Sparkles className="h-3 w-3" />
              北京二中经开区学校论坛 · 本固枝盛，学富国强
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-[45%] items-center justify-center px-4 sm:px-8 py-12 relative bg-slate-50 dark:bg-indigo-950">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white dark:from-indigo-950/50 dark:to-indigo-950" />
        <div className="relative w-full max-w-sm">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 mb-4 shadow-lg">
                <GraduationCap className="h-7 w-7 text-indigo-700 dark:text-indigo-200" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">
                注册账号
              </h1>
              <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
                创建你的校园账号，加入论坛社区
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <form action={formAction} className="space-y-5">
              {state && "message" in state && state.message && (
                <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 p-3 text-sm text-rose-600 dark:text-rose-400">
                  {state.message}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  用户名 <span className="text-rose-400">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="中英文、数字、下划线"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-indigo-800/60 bg-white dark:bg-indigo-900/40"
                />
                {state && "errors" in state && state.errors?.name && (
                  <p className="text-sm text-rose-500">{state.errors.name[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  邮箱 <span className="text-rose-400">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="用于登录和找回密码"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-indigo-800/60 bg-white dark:bg-indigo-900/40"
                />
                {state && "errors" in state && state.errors?.email && (
                  <p className="text-sm text-rose-500">{state.errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  密码 <span className="text-rose-400">*</span>
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="至少 6 位字符"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-indigo-800/60 bg-white dark:bg-indigo-900/40"
                />
                {state && "errors" in state && state.errors?.password && (
                  <p className="text-sm text-rose-500">{state.errors.password[0]}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full shadow-md shadow-indigo-700/20 hover:shadow-lg hover:shadow-indigo-700/30 hover:-translate-y-0.5 transition-all"
              >
                {isPending ? "注册中..." : "注册"}
              </Button>
            </form>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
              已有账号？{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-0.5"
              >
                立即登录
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
