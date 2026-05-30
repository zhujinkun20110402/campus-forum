"use client"

import Link from "next/link"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { registerUser } from "@/lib/actions"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">注册</CardTitle>
          <CardDescription>加入北京二中经开区学校论坛</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state && "message" in state && state.message && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-500 dark:text-red-400">
                {state.message}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="请输入用户名"
                required
                className="mt-1"
              />
              {state && "errors" in state && state.errors?.name && (
                <p className="mt-1 text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>
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
              {state && "errors" in state && state.errors?.email && (
                <p className="mt-1 text-sm text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="请输入密码（至少6位）"
                required
                className="mt-1"
              />
              {state && "errors" in state && state.errors?.password && (
                <p className="mt-1 text-sm text-red-500">
                  {state.errors.password[0]}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "注册中..." : "注册"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            已有账号？{" "}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              立即登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}