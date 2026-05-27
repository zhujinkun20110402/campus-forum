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
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { error: "邮箱或密码错误" }
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
    <form action={formAction} className="space-y-4">
      {registered === "true" && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          注册成功，请登录
        </div>
      )}
      {state?.error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          邮箱
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="请输入邮箱"
          required
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          密码
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="请输入密码"
          required
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "登录中..." : "登录"}
      </Button>
    </form>
  )
}