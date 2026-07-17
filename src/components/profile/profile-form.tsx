"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AvatarUploader } from "@/components/profile/avatar-uploader"
import { AvatarSelector } from "@/components/profile/avatar-selector"
import { updateProfile } from "@/lib/actions"
import { profileSchema, type ProfileInput } from "@/lib/validations"
import { Loader2, Save } from "lucide-react"

interface ProfileFormProps {
  user: {
    name: string | null
    email: string
    image: string | null
    bio: string | null
    role?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { update } = useSession()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [avatarUrl, setAvatarUrl] = useState(user.image ?? "")

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? "",
      bio: user.bio ?? "",
    },
  })

  function onSubmit(data: ProfileInput) {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("bio", data.bio ?? "")
    formData.append("image", avatarUrl)

    startTransition(async () => {
      const result = await updateProfile(null, formData)
      if (result && "success" in result) {
        setMessage(result.message ?? "")
        await update({
          name: data.name,
          image: avatarUrl,
        })
      } else if (result && "errors" in result) {
        setError("root", { message: result.message })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <div className="border-2 border-[#191914] bg-[#f3c84b]/35 p-6 dark:border-[#f5f0e5] dark:bg-[#292821]">
        <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />

        <div className="mt-6 border-t border-[#191914]/25 pt-6 dark:border-white/25">
          <p className="mb-3 text-center font-mono text-[9px] font-bold tracking-[0.14em] text-[#69655d] dark:text-[#aaa69c]">
            或选择预设头像
          </p>
          <AvatarSelector value={avatarUrl} onChange={setAvatarUrl} />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">01</span>邮箱</span>
          <span className="font-mono text-[9px] text-[#989389]">READ ONLY</span>
        </label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="h-12 cursor-not-allowed rounded-none border-2 border-[#191914]/35 bg-[#ece6da] px-4 text-[#777268] dark:border-white/30 dark:bg-[#11110f] dark:text-[#7f7b73]"
        />
        <p className="text-xs text-[#918b80]">邮箱用于登录与账号识别，不会公开显示。</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">02</span>用户名</span>
          <span className="font-mono text-[9px] text-[#989389]">PUBLIC</span>
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder="请输入用户名"
          className="h-12 rounded-none border-2 border-[#191914] bg-white px-4 text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
        {errors.name && (
          <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">03</span>个人简介</span>
          <span className="font-mono text-[9px] text-[#989389]">YOUR STORY</span>
        </label>
        <Textarea
          id="bio"
          {...register("bio")}
          placeholder="介绍一下自己..."
          rows={4}
          className="min-h-32 resize-y rounded-none border-2 border-[#191914] bg-white p-4 leading-7 text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
        {errors.bio && (
          <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{errors.bio.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="border-2 border-[#d44120] bg-[#ffb4aa]/30 px-4 py-3 text-sm text-[#b52f1e]" role="alert">{errors.root.message}</p>
      )}

      {message && (
        <p className="border-2 border-[#326b42] bg-[#b9ddbd]/40 px-4 py-3 text-sm font-bold text-[#275836] dark:text-[#b9ddbd]" aria-live="polite">{message}</p>
      )}

      <Button type="submit" disabled={isPending} size="lg" className="h-12 w-full rounded-none border-2 border-[#191914] bg-[#ff6b43] font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#ff6b43] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5] sm:w-auto">
        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />保存中...</> : <><Save className="mr-2 h-4 w-4" />保存修改</>}
      </Button>
    </form>
  )
}
