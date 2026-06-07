"use client"

import { useActionState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginFormState {
  error?: string
}

async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const name = formData.get("name") as string
  const password = formData.get("password") as string

  try {
    const result = await signIn("credentials", {
      name,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { error: "用户名或密码错误" }
    }

    window.location.href = "/"
    return {}
  } catch {
    return { error: "登录失败，请稍后重试" }
  }
}

export function LoginForm() {
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const [state, formAction, isPending] = useActionState(loginAction, {})

  return (
    <form action={formAction} className="space-y-5">
      {registered === "true" && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-3 text-sm text-emerald-700 dark:text-emerald-300">
          注册成功，请登录
        </div>
      )}
      {state?.error && (
        <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 p-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          用户名 / 邮箱
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="请输入用户名或邮箱"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="请输入密码"
          required
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "登录中..." : "登录"}
      </Button>
    </form>
  )
}