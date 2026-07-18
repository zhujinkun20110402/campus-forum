"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, LockKeyhole, LogIn } from "lucide-react"

function LoginFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const membersOnly = searchParams.get("reason") === "members-only"
  const requestedCallbackUrl = searchParams.get("callbackUrl")
  const callbackUrl = requestedCallbackUrl?.startsWith("/") && !requestedCallbackUrl.startsWith("//")
    ? requestedCallbackUrl
    : "/"
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

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("登录失败，请稍后重试")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {registered === "true" && (
        <div className="border-2 border-[#326b42] bg-[#b9ddbd]/45 p-3 text-sm font-bold text-[#275836] dark:text-[#b9ddbd]" role="status">
          注册成功，请登录
        </div>
      )}
      {membersOnly && (
        <div className="flex gap-3 border-2 border-[#191914] bg-[#f3c84b]/40 p-3 text-sm text-[#191914] dark:border-[#f5f0e5] dark:bg-[#292821] dark:text-[#f5f0e5]" role="status">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#e4532f]" />
          <span>这里是成员专属区域，登录后将回到刚才的页面。</span>
        </div>
      )}
      {error && (
        <div className="border-2 border-[#d44120] bg-[#ffb4aa]/35 p-3 text-sm text-[#b52f1e]" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="mb-2 flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">01</span>用户名 / 邮箱</span>
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="请输入用户名或邮箱"
          required
          className="h-12 rounded-none border-2 border-[#191914] bg-white px-4 text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-2 flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">02</span>密码</span>
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="请输入密码"
          required
          className="h-12 rounded-none border-2 border-[#191914] bg-white px-4 text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-none border-2 border-[#191914] bg-[#ff6b43] font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#ff6b43] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5]"
      >
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />登录中...</> : <><LogIn className="mr-2 h-4 w-4" />登录</>}
      </Button>
    </form>
  )
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="h-12 w-full animate-pulse border-2 border-[#191914]/25 bg-[#ece6da] dark:border-white/25 dark:bg-[#292821]" />}>
      <LoginFormInner />
    </Suspense>
  )
}
