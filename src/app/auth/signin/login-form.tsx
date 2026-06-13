"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function LoginFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const password = formData.get("password") as string

    try {
      const result = await signIn("credentials", {
        name,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("用户名或密码错误")
        setLoading(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("登录失败，请稍后重试")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {registered === "true" && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          注册成功，请登录
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          用户名 / 邮箱
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="请输入用户名或邮箱"
          required
          className="h-11 rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="请输入密码"
          required
          className="h-11 rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        {loading ? "登录中..." : "登录"}
      </Button>
    </form>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="text-sm text-stone-400">加载中...</div>}>
      <LoginFormInner />
    </Suspense>
  )
}