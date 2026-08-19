"use client"

import { useRef } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** 逐个上传图片文件，返回成功的 URL 列表。 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    try {
      const formData = new FormData()
      formData.append("source", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const json = await res.json()
      if (json.success && json.url) urls.push(json.url)
    } catch {
      // 单张失败不影响其它图片
    }
  }
  return urls
}

interface ImageUploadProps {
  /** 用户选择图片后回调，由父组件负责上传与插入正文 */
  onPick: (files: File[]) => void
  uploading: boolean
}

/** 编辑器工具栏里的“图片”按钮：选择文件（支持多选/拍照），粘贴与拖拽由表单层处理。 */
export function ImageUpload({ onPick, uploading }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="上传图片（自动插入正文）"
        className={cn(
          "inline-flex h-9 shrink-0 items-center gap-1.5 border border-dashed border-[#191914]/45 bg-[#fffaf0] px-2.5 text-xs font-bold text-[#5f5c54] transition-colors hover:border-[#191914] hover:bg-[#d9ef61] hover:text-[#191914] dark:border-white/40 dark:bg-[#191914] dark:text-[#aaa69c] dark:hover:border-white dark:hover:bg-[#d9ef61] dark:hover:text-[#191914] sm:h-8 sm:px-3",
          uploading && "cursor-not-allowed opacity-50"
        )}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            上传中…
          </>
        ) : (
          <>
            <ImagePlus className="h-4 w-4" aria-hidden />
            图片
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) {
            onPick(Array.from(files))
          }
          e.target.value = ""
        }}
      />
    </>
  )
}
