"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createPost } from "@/lib/actions"
import { postSchema, type PostInput } from "@/lib/validations"

interface PostFormProps {
  categories: { id: string; name: string }[]
}

export function PostForm({ categories }: PostFormProps) {
  const [isPending, startTransition] = useTransition()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
    },
  })

  function onSubmit(data: PostInput) {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("content", data.content)
    formData.append("categoryId", data.categoryId)

    startTransition(async () => {
      const result = await createPost(null, formData)
      if (result && "message" in result) {
        setError("root", { message: result.message })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          标题
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder="请输入帖子标题"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          分类
        </label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <option value="">请选择分类</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-sm text-red-500">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          内容
        </label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="请输入帖子内容，支持 Markdown 格式"
          rows={8}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "发布中..." : "发布帖子"}
      </Button>
    </form>
  )
}