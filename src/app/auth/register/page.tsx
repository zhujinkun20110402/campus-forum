"use client"

import Link from "next/link"
import { useActionState } from "react"
import { ArrowRight, CheckCircle, Loader2, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SafeImage } from "@/components/ui/safe-image"
import { registerUser } from "@/lib/actions"

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, null)
  const benefits = ["与校园同学互动交流", "发布帖子并参与讨论", "使用失物招领与表白墙", "收藏属于自己的校园轨迹"]

  return (
    <div className="grid min-h-screen bg-[#f4efe4] text-[#191914] dark:bg-[#11110f] dark:text-[#f5f0e5] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden border-r-2 border-[#191914] bg-[#191914] text-[#f5f0e5] dark:border-[#f5f0e5] lg:block">
        <SafeImage src="/images/campus-01.jpg" alt="校园教学楼" fill priority sizes="55vw" className="object-cover opacity-35 saturate-[0.75]" />
        <div className="absolute inset-0 bg-[#11110f]/60" />
        <div className="relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden border-2 border-white bg-[#ff6b43]">
              <SafeImage src="/images/school-logo.png" alt="校徽" fill sizes="44px" className="object-contain p-1" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold">北京二中经开区学校</p>
              <p className="mt-1 font-mono text-[8px] font-bold tracking-[0.18em] text-[#d9ef61]">CAMPUS FORUM</p>
            </div>
          </Link>

          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#ff8a68]">JOIN THE COMMUNITY</p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
              把你的名字，<br />
              <span className="text-[#d9ef61]">加入校园故事。</span>
            </h1>
            <div className="mt-9 space-y-3">
              {benefits.map((benefit, index) => (
                <div key={benefit} className="flex items-center gap-3 border-b border-white/15 pb-3 text-sm text-white/60">
                  <span className="font-mono text-[9px] font-bold text-[#ff8a68]">0{index + 1}</span>
                  <CheckCircle className="h-4 w-4 text-[#d9ef61]" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-white/30">FREE TO JOIN · BUILT FOR CAMPUS</p>
        </div>
      </section>

      <main className="campus-paper flex min-h-screen items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="relative h-10 w-10 overflow-hidden border-2 border-[#191914] bg-[#ff6b43] dark:border-[#f5f0e5]">
              <SafeImage src="/images/school-logo.png" alt="校徽" fill sizes="40px" className="object-contain p-1" />
            </div>
            <span className="font-serif text-sm font-bold">校园论坛</span>
          </Link>

          <div className="border-2 border-[#191914] bg-[#fffaf0] p-6 shadow-[7px_7px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[7px_7px_0_#f5f0e5] sm:p-8">
            <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#e4532f]">CREATE ACCOUNT</p>
            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight">加入校园社区</h1>
            <p className="mt-2 text-sm text-[#777268] dark:text-[#989389]">创建账号，开始记录与回应。</p>

            <form action={formAction} className="mt-8 space-y-5">
              {state && "message" in state && state.message && (
                <div className="border-2 border-[#d44120] bg-[#ffb4aa]/35 p-3 text-sm text-[#b52f1e]" role="alert">{state.message}</div>
              )}

              <AuthField index="01" label="用户名" id="name" type="text" placeholder="中英文、数字、下划线" error={state && "errors" in state ? state.errors?.name?.[0] : undefined} />
              <AuthField index="02" label="邮箱" id="email" type="email" placeholder="用于登录和找回密码" error={state && "errors" in state ? state.errors?.email?.[0] : undefined} />
              <AuthField index="03" label="密码" id="password" type="password" placeholder="至少 6 位字符" error={state && "errors" in state ? state.errors?.password?.[0] : undefined} />

              <Button type="submit" disabled={isPending} className="h-12 w-full rounded-none border-2 border-[#191914] bg-[#d9ef61] font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#d9ef61] dark:border-[#f5f0e5] dark:bg-[#d9ef61] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5]">
                {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />注册中...</> : <><UserPlus className="mr-2 h-4 w-4" />创建账号</>}
              </Button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-[#777268] dark:text-[#989389]">
            已有账号？{" "}
            <Link href="/auth/signin" className="inline-flex items-center gap-1 font-bold text-[#d44120] underline decoration-2 underline-offset-4 dark:text-[#ff8a68]">
              立即登录 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function AuthField({ index, label, id, type, placeholder, error }: { index: string; label: string; id: string; type: string; placeholder: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold"><span className="mr-2 font-mono text-[9px] text-[#e4532f]">{index}</span>{label}</label>
      <Input id={id} name={id} type={type} placeholder={placeholder} required className="h-12 rounded-none border-2 border-[#191914] bg-white px-4 text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]" />
      {error && <p className="mt-2 border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{error}</p>}
    </div>
  )
}
