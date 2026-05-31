"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { registerUser } from "@/lib/actions"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-50 dark:bg-stone-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20"
          style={{
            backgroundImage: "url('/images/auth-decoration.jpg')",
          }}
        />
        <div className="relative flex flex-col justify-center p-16">
          <div className="mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-800">
              <span className="text-sm font-bold">二</span>
            </div>
          </div>
          <h2 className="text-3xl font-light tracking-tight text-stone-800 dark:text-stone-200">
            加入我们
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-stone-500 dark:text-stone-400">
            注册一个账号，
            <br />
            开启你的校园社区之旅。
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-light tracking-tight text-stone-800 dark:text-stone-200">
              注册
            </h1>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              创建你的账号
            </p>
          </div>

          <form action={formAction} className="space-y-5">
            {state && "message" in state && state.message && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
                {state.message}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                用户名 <span className="text-red-400">*</span>
              </label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="中英文、数字、下划线"
                required
              />
              {state && "errors" in state && state.errors?.username && (
                <p className="mt-1 text-sm text-red-500">{state.errors.username[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                邮箱 <span className="text-stone-400 dark:text-stone-500 font-normal">(选填)</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="选填，用于找回密码"
              />
              {state && "errors" in state && state.errors?.email && (
                <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                密码 <span className="text-red-400">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 6 位字符"
                required
              />
              {state && "errors" in state && state.errors?.password && (
                <p className="mt-1 text-sm text-red-500">{state.errors.password[0]}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "注册中..." : "注册"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-stone-500 dark:text-stone-400">
            已有账号？{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-stone-800 dark:text-stone-200 underline underline-offset-4 hover:text-stone-600 dark:hover:text-stone-300"
            >
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}