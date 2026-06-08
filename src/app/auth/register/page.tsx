"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/lib/actions"
import { FloatingParticles } from "@/components/effects/floating-particles"
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)

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
            <h2 className="text-4xl font-light tracking-tight text-white">
              加入我们
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-stone-300">
              注册一个账号，
              <br />
              开启你的校园社区之旅。
            </p>

            <div className="mt-10 space-y-4">
              {[
                "免费注册，即刻使用",
                "与全校同学互动交流",
                "发布帖子、参与讨论",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-stone-400"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-400/60" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Sparkles className="h-3 w-3" />
            北京二中经开区学校论坛
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 to-white dark:from-stone-950/50 dark:to-stone-900" />
        <div className="relative w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 dark:bg-stone-800 mb-4">
              <span className="text-lg font-bold text-stone-700 dark:text-stone-300">二</span>
            </div>
            <h1 className="text-2xl font-light tracking-tight text-stone-800 dark:text-stone-200">
              注册
            </h1>
            <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
              创建你的校园账号
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {state && "message" in state && state.message && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
                {state.message}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                用户名 <span className="text-red-400">*</span>
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="中英文、数字、下划线"
                required
                className="h-11"
              />
              {state && "errors" in state && state.errors?.name && (
                <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                邮箱 <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="用于登录和找回密码"
                required
                className="h-11"
              />
              {state && "errors" in state && state.errors?.email && (
                <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
                密码 <span className="text-red-400">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 6 位字符"
                required
                className="h-11"
              />
              {state && "errors" in state && state.errors?.password && (
                <p className="mt-1 text-sm text-red-500">{state.errors.password[0]}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full h-11">
              {isPending ? "注册中..." : "注册"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-400 dark:text-stone-500">
            已有账号？{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-stone-700 dark:text-stone-300 underline underline-offset-4 hover:text-stone-900 dark:hover:text-stone-100 transition-colors inline-flex items-center gap-0.5"
            >
              立即登录
              <ArrowRight className="h-3 w-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
