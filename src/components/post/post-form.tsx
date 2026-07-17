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
import { Loader2, Send } from "lucide-react"

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <div className="space-y-2">
        <label htmlFor="title" className="flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">01</span>标题</span>
          <span className="font-mono text-[9px] font-medium tracking-[0.1em] text-[#989389]">MAKE IT CLEAR</span>
        </label>
        <Input
          id="title"
          {...register("title")}
          placeholder="请输入帖子标题"
          className="h-12 rounded-none border-2 border-[#191914] bg-white px-4 text-base font-medium text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        />
        {errors.title && (
          <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryId" className="flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">02</span>分类</span>
          <span className="font-mono text-[9px] font-medium tracking-[0.1em] text-[#989389]">FIND YOUR CORNER</span>
        </label>
        <select
          id="categoryId"
          {...register("categoryId")}
          className="flex h-12 w-full border-2 border-[#191914] bg-white px-4 py-2 text-sm font-medium text-[#191914] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b43] focus-visible:ring-offset-2 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
        >
          <option value="">请选择分类</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{errors.categoryId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="flex items-center justify-between text-sm font-bold">
          <span><span className="mr-2 font-mono text-[9px] text-[#e4532f]">03</span>正文</span>
          <span className="font-mono text-[9px] font-medium tracking-[0.1em] text-[#989389]">MARKDOWN READY</span>
        </label>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-2 border-b-0 border-[#191914] bg-[#ece6da] p-2 dark:border-[#f5f0e5] dark:bg-[#292821]">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.title}
              type="button"
              title={btn.title}
              onClick={() => insertMarkdown(btn.syntax, btn.placeholder)}
              className="h-8 min-w-8 border border-[#191914]/35 bg-[#fffaf0] px-1.5 text-xs font-bold text-[#191914] transition-colors hover:border-[#191914] hover:bg-[#f3c84b] dark:border-white/35 dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:border-white dark:hover:bg-[#f3c84b] dark:hover:text-[#191914]"
            >
              {btn.label}
            </button>
          ))}
          <div className="mx-1 h-6 w-px bg-[#191914]/30 dark:bg-white/30" />
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
              className="min-h-[280px] resize-y rounded-none border-2 border-[#191914] bg-white p-4 font-mono text-sm leading-7 text-[#191914] focus-visible:ring-[#ff6b43] focus-visible:ring-offset-0 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
            />
          )}
        />
        {errors.content && (
          <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{errors.content.message}</p>
        )}
      </div>

      {errors.root && (
        <p className="border-2 border-[#d44120] bg-[#ffb4aa]/30 px-4 py-3 text-sm font-medium text-[#b52f1e]" role="alert">{errors.root.message}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-none border-2 border-[#191914] bg-[#ff6b43] font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#ff6b43] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5]"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            发布中...
          </>
        ) : (
          <><Send className="mr-2 h-4 w-4" />发布帖子</>
        )}
      </Button>
    </form>
  )
}
