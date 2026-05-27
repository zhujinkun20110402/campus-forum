"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createPost } from "@/lib/actions"

interface PostFormProps {
  categories: { id: string; name: string }[]
}

export function PostForm({ categories }: PostFormProps) {
  const [state, formAction, isPending] = useActionState(createPost, null)

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          标题
        </label>
        <Input
          id="title"
          name="title"
          placeholder="请输入帖子标题"
        />
        {state?.errors?.title && (
          <p className="text-sm text-red-500">{state.errors.title[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          分类
        </label>
        <select
          id="categoryId"
          name="categoryId"
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <option value="">请选择分类</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {state?.errors?.categoryId && (
          <p className="text-sm text-red-500">{state.errors.categoryId[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          内容
        </label>
        <Textarea
          id="content"
          name="content"
          placeholder="请输入帖子内容，支持 Markdown 格式"
          rows={8}
        />
        {state?.errors?.content && (
          <p className="text-sm text-red-500">{state.errors.content[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-500">{state.message}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "发布中..." : "发布帖子"}
      </Button>
    </form>
  )
}