"use client"

import { useRef } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** 最长边默认 1920px；头像等小图场景可传更小值 */
const MAX_DIM = 1920
const JPEG_QUALITY = 0.82

interface DecodedImage {
  width: number
  height: number
  draw: (ctx: CanvasRenderingContext2D) => void
  dispose: () => void
}

async function decodeImage(file: File): Promise<DecodedImage> {
  // 现代浏览器优先 createImageBitmap；旧 Safari 回退 objectURL + Image
  try {
    const bitmap = await createImageBitmap(file)
    return {
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx) => {
        ctx.drawImage(bitmap, 0, 0, ctx.canvas.width, ctx.canvas.height)
      },
      dispose: () => bitmap.close(),
    }
  } catch {
    const url = URL.createObjectURL(file)
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image()
        el.onload = () => resolve(el)
        el.onerror = () => reject(new Error("decode failed"))
        el.src = url
      })
      return {
        width: image.naturalWidth,
        height: image.naturalHeight,
        draw: (ctx) => {
          ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height)
        },
        dispose: () => {},
      }
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}

/**
 * 上传前在客户端压缩图片：缩小到 maxDim 以内并转为 JPEG。
 * 小于 600KB、动图、SVG 或无法解码的文件原样返回，不做任何降质。
 */
export async function prepareImageForUpload(file: File, maxDim = MAX_DIM): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file
  if (file.size <= 600 * 1024) return file

  try {
    const decoded = await decodeImage(file)
    const scale = Math.min(1, maxDim / Math.max(decoded.width, decoded.height))
    // 图片本来就不大且无需缩放时，直接原样上传
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) {
      decoded.dispose()
      return file
    }

    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(decoded.width * scale))
    canvas.height = Math.max(1, Math.round(decoded.height * scale))
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      decoded.dispose()
      return file
    }
    decoded.draw(ctx)
    decoded.dispose()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/jpeg", JPEG_QUALITY)
    )
    // 压缩后反而更大时（如已是优化过的 JPEG），保留原图
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

/** 逐个上传图片文件（自动压缩），返回成功的 URL 列表。 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = []
  for (const file of files) {
    try {
      const processed = await prepareImageForUpload(file)
      const formData = new FormData()
      formData.append("source", processed, file.name)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const json = (await res.json()) as { success?: boolean; url?: string; error?: string }
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
