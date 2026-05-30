"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AvatarSelector } from "@/components/profile/avatar-selector"
import { updateProfile } from "@/lib/actions"
import { profileSchema, type ProfileInput } from "@/lib/validations"

interface ProfileFormProps {
  user: {
    name: string | null
    email: string
    image: string | null
    bio: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
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
      } else if (result && "errors" in result) {
        setError("root", { message: result.message })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24 ring-4 ring-blue-100 dark:ring-blue-900">
          <AvatarImage src={avatarUrl || undefined} />
          <AvatarFallback className="text-2xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            {(user.name ?? user.email).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          当前头像预览
        </p>
      </div>

      <AvatarSelector value={avatarUrl} onChange={setAvatarUrl} />

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          邮箱
        </label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">邮箱不可修改</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          用户名
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder="请输入用户名"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          个人简介
        </label>
        <Textarea
          id="bio"
          {...register("bio")}
          placeholder="介绍一下自己..."
          rows={4}
        />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      {message && (
        <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
      )}

      <Button type="submit" disabled={isPending} size="lg">
        {isPending ? "保存中..." : "保存修改"}
      </Button>
    </form>
  )
}