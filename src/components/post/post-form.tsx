"use client"

import { useCallback, useRef, useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload, uploadImages } from "@/components/post/image-upload"
import { SafeImage } from "@/components/ui/safe-image"
import { createPost } from "@/lib/actions"
import { postSchema, type PostInput } from "@/lib/validations"
import { Check, Loader2, Send, X } from "lucide-react"

interface PostFormProps {
  categories: { id: string; name: string }[]
  defaultCategoryId?: string
}

export function PostForm({ categories, defaultCategoryId = "" }: PostFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isPending, startTransition] = useTransition()
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [insertNotice, setInsertNotice] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: defaultCategoryId,
    },
  })

  /** 把一段文本插入正文：有选区时替换选区，光标停在编辑器里时插在光标处，否则追加到末尾。 */
  const insertText = useCallback(
    (text: string, caretInText?: (inserted: string) => number) => {
      const textarea = textareaRef.current
      const current = getValues("content")
      const focused = typeof document !== "undefined" && document.activeElement === textarea
      const rawStart = textarea?.selectionStart ?? current.length
      const rawEnd = textarea?.selectionEnd ?? current.length
      const hasSelection = rawStart !== rawEnd
      const start = focused || hasSelection ? rawStart : current.length
      const end = focused || hasSelection ? rawEnd : current.length

      const next = current.slice(0, start) + text + current.slice(end)
      setValue("content", next, { shouldDirty: true, shouldValidate: true })

      requestAnimationFrame(() => {
        const target = textareaRef.current
        if (!target) return
        target.focus()
        const caret = caretInText ? start + caretInText(text) : start + text.length
        target.setSelectionRange(caret, caret)
        target.scrollIntoView({ block: "nearest", behavior: "smooth" })
      })
    },
    [getValues, setValue]
  )

  /** 上传图片并把 Markdown 自动插入正文（无需手动复制）。 */
  async function uploadFiles(files: File[]) {
    if (files.length === 0) return
    setUploading(true)
    const urls = await uploadImages(files)
    if (urls.length > 0) {
      setUploadedImages((prev) => [...prev, ...urls])
      const markdown = urls.map((url) => `![](${url})`).join("\n")
      insertText(`\n${markdown}\n`)
      setInsertNotice(true)
      window.setTimeout(() => setInsertNotice(false), 3000)
    }
    setUploading(false)
  }

  /** 表单任意位置粘贴图片 → 直接上传插入，无需先复制 Markdown。 */
  function handlePaste(event: React.ClipboardEvent) {
    const items = event.clipboardData?.items
    if (!items) return
    const files: File[] = []
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) files.push(file)
      }
    }
    if (files.length > 0) {
      event.preventDefault()
      uploadFiles(files)
    }
  }

  /** 拖拽图片到编辑器 → 直接上传插入。 */
  function handleDrop(event: React.DragEvent) {
    const files = Array.from(event.dataTransfer?.files ?? []).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      event.preventDefault()
      uploadFiles(files)
    }
  }

  function insertMarkdown(syntax: string, placeholder: string) {
    const textarea = textareaRef.current
    const current = getValues("content")
    const start = textarea?.selectionStart ?? current.length
    const end = textarea?.selectionEnd ?? current.length
    const selected = start !== end ? current.slice(start, end) : placeholder
    const snippet = syntax.replace("$1", selected)
    insertText(snippet, (inserted) => inserted.indexOf(selected) + selected.length)
  }

  /** 删除缩略图的同时移除正文中对应的图片行。 */
  function removeImage(index: number) {
    const url = uploadedImages[index]
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    if (url) {
      const content = getValues("content")
      const next = content
        .split("\n")
        .filter((line) => !line.includes(`](${url})`))
        .join("\n")
      setValue("content", next, { shouldDirty: true, shouldValidate: true })
    }
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      className="space-y-7"
    >
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
          <span className="font-mono text-[9px] font-medium tracking-[0.1em] text-[#989389]">粘贴 / 拖入图片自动插入</span>
        </label>

        {/* 工具栏：移动端横向滑动、大触控目标 */}
        <div className="flex items-center gap-1 overflow-x-auto border-2 border-b-0 border-[#191914] bg-[#ece6da] p-2 dark:border-[#f5f0e5] dark:bg-[#292821]">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.title}
              type="button"
              title={btn.title}
              aria-label={btn.title}
              onClick={() => insertMarkdown(btn.syntax, btn.placeholder)}
              className="h-9 min-w-9 shrink-0 border border-[#191914]/35 bg-[#fffaf0] px-2 text-sm font-bold text-[#191914] transition-colors hover:border-[#191914] hover:bg-[#f3c84b] dark:border-white/35 dark:bg-[#191914] dark:text-[#f5f0e5] dark:hover:border-white dark:hover:bg-[#f3c84b] dark:hover:text-[#191914] sm:h-8 sm:min-w-8 sm:text-xs"
            >
              {btn.label}
            </button>
          ))}
          <span aria-hidden className="mx-0.5 h-6 w-px shrink-0 bg-[#191914]/30 dark:bg-white/30" />
          <ImageUpload onPick={uploadFiles} uploading={uploading} />
          {insertNotice && (
            <span className="inline-flex shrink-0 items-center gap-1 border border-[#326b42] bg-[#b9ddbd]/60 px-2 py-1 text-[10px] font-bold text-[#275836]">
              <Check className="h-3 w-3" aria-hidden /> 已插入正文
            </span>
          )}
        </div>

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Textarea
              id="content"
              ref={(element) => {
                field.ref(element)
                textareaRef.current = element
              }}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              placeholder={"写点什么吧…\n\n支持 Markdown 格式；图片直接粘贴或拖进来，会自动插入正文"}
              rows={10}
              className="min-h-[320px] resize-y rounded-none border-2 border-[#191914] bg-white p-4 font-mono text-base leading-7 text-[#191914] focus-visible:ring-[#ff6b43] focus-visible:ring-offset-0 dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5] sm:min-h-[280px] sm:text-[15px]"
            />
          )}
        />
        {errors.content && (
          <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/30 px-3 py-2 text-sm text-[#b52f1e]" role="alert">{errors.content.message}</p>
        )}

        {uploadedImages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {uploadedImages.map((url, index) => (
              <div key={`${url}-${index}`} className="relative h-16 w-16 overflow-hidden border-2 border-[#191914] bg-[#ece6da] dark:border-[#f5f0e5] dark:bg-[#292821] sm:h-20 sm:w-20">
                <SafeImage src={url} alt="已上传的帖子图片" fill sizes="80px" className="object-cover" />
                <button
                  type="button"
                  aria-label="删除这张图片"
                  onClick={() => removeImage(index)}
                  className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-[#d44120] text-white transition-transform hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <p className="w-full font-mono text-[9px] tracking-[0.08em] text-[#918b80] dark:text-[#7f7b73]">
              图片已自动插入正文；删除缩略图会同时移除正文中对应的图片行
            </p>
          </div>
        )}
      </div>

      {errors.root && (
        <p className="border-2 border-[#d44120] bg-[#ffb4aa]/30 px-4 py-3 text-sm font-medium text-[#b52f1e]" role="alert">{errors.root.message}</p>
      )}

      {/* 移动端固定在底部的发布栏；桌面端随表单流 */}
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 border-t-2 border-[#191914] bg-[#fffaf0] px-6 py-3 dark:border-[#f5f0e5] dark:bg-[#191914] sm:static sm:mx-0 sm:mb-0 sm:border-t-0 sm:bg-transparent sm:p-0 sm:dark:bg-transparent">
        <Button
          type="submit"
          disabled={isPending}
          className="h-12 w-full rounded-none border-2 border-[#191914] bg-[#ff6b43] font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#ff6b43] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5] sm:shadow-[4px_4px_0_#191914]"
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
      </div>
    </form>
  )
}
