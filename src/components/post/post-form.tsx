"use client"

import { useState, useTransition, useRef, useCallback } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/post/image-upload"
import { createPost } from "@/lib/actions"
import { postSchema, type PostInput } from "@/lib/validations"
import { Loader2 } from "lucide-react"

interface PostFormProps {
  categories: { id: string; name: string }[]
}

export function PostForm({ categories }: PostFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPending, startTransition] = useTransition()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const {
    register,
    handleSubmit,
    setError,
    control,
    getValues,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: "",
    },
  })

  const setContentValue = useCallback(
    (content: string) => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.value = content
      }
      // Trigger react-hook-form to pick up the new value
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        "value"
      )?.set
      if (nativeInputValueSetter && textarea) {
        nativeInputValueSetter.call(textarea, content)
        textarea.dispatchEvent(new Event("input", { bubbles: true }))
      }
    },
    []
  )

  function handleImageUpload(urls: string[]) {
    setUploadedImages(urls)
    const mdImages = urls.map((url) => `![](${url})`).join("\n")

    const textarea = textareaRef.current
    const start = textarea?.selectionStart ?? getValues("content").length
    const end = textarea?.selectionEnd ?? start
    const current = getValues("content")
    const newContent =
      current.slice(0, start) + "\n" + mdImages + "\n" + current.slice(end)
    setContentValue(newContent)
  }

  function insertMarkdown(syntax: string, placeholder: string) {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.slice(start, end) || placeholder
    const current = textarea.value
    const newContent =
      current.slice(0, start) +
      syntax.replace("$1", selected) +
      current.slice(end)

    setContentValue(newContent)

    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + syntax.indexOf("$1") + selected.length
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  function onSubmit(data: PostInput) {
    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("content", data.content)
    formData.append("categoryId", data.categoryId)

    startTransition(async () => {
      const result = await createPost(null, formData)
      if (result && "message" in result) {
        setError("root", { message: result.message } as { message: string })
      }
    })
  }

  const toolbarButtons = [
    { label: "B", title: "加粗", syntax: "**$1**", placeholder: "加粗文字" },
    { label: "I", title: "斜体", syntax: "*$1*", placeholder: "斜体文字" },
    { label: "H2", title: "二级标题", syntax: "## $1", placeholder: "标题" },
    { label: ">", title: "引用", syntax: "> $1", placeholder: "引用内容" },
    { label: "•", title: "无序列表", syntax: "- $1", placeholder: "列表项" },
    { label: "`", title: "行内代码", syntax: "`$1`", placeholder: "代码" },
    { label: "🔗", title: "链接", syntax: "[$1](url)", placeholder: "链接文字" },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          标题
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder="请输入帖子标题"
          className="h-11 rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="categoryId" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          分类
        </label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="flex h-11 w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm text-stone-800 dark:text-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
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

      <div className="space-y-1.5">
        <label htmlFor="content" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          内容 <span className="text-stone-400 font-normal">— 支持 Markdown</span>
        </label>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.title}
              type="button"
              title={btn.title}
              onClick={() => insertMarkdown(btn.syntax, btn.placeholder)}
              className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              {btn.label}
            </button>
          ))}
          <div className="w-px h-6 bg-stone-200 dark:bg-stone-700 mx-1" />
          <ImageUpload value={uploadedImages} onChange={handleImageUpload} />
        </div>

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Textarea
              id="content"
              ref={(e) => {
                field.ref(e)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(textareaRef as any).current = e
              }}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder="请输入帖子内容，支持 Markdown 格式\n拖拽图片或 Ctrl+V 粘贴上传"
              rows={10}
              className="rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-sm resize-y min-h-[200px]"
            />
          )}
        />
        {errors.content && (
          <p className="text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            发布中...
          </>
        ) : (
          "发布帖子"
        )}
      </Button>
    </form>
  )
}