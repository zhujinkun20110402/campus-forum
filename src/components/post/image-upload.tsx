"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
}

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    setUploadedUrl(null)
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append("source", file)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const json = await res.json()
        if (json.success && json.url) {
          newUrls.push(json.url)
          setUploadedUrl(json.url)
        }
      } catch (err) {
        console.error("Upload failed:", err)
      }
    }

    if (newUrls.length > 0) {
      onChange([...value, ...newUrls])
    }
    setUploading(false)

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return

    const imageFiles: File[] = []
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (file) imageFiles.push(file)
      }
    }

    if (imageFiles.length === 0) return

    const dt = new DataTransfer()
    imageFiles.forEach((f) => dt.items.add(f))

    if (inputRef.current) {
      inputRef.current.files = dt.files
      inputRef.current.dispatchEvent(new Event("change", { bubbles: true }))
    }
  }

  function handleCopyUrl(url: string) {
    navigator.clipboard.writeText(`![](${url})`)
  }

  return (
    <div className="space-y-3" onPaste={handlePaste}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border border-dashed border-stone-300 dark:border-stone-600 px-4 py-2.5 text-sm text-stone-500 dark:text-stone-400 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" />
              上传图片
            </>
          )}
        </button>
        <span className="text-[11px] text-stone-400 dark:text-stone-500">
          支持粘贴上传
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {uploadedUrl && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
          <Check className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-emerald-700 dark:text-emerald-300">上传成功</span>
          <button
            type="button"
            onClick={() => handleCopyUrl(uploadedUrl)}
            className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            复制 Markdown
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={i} className="group relative h-20 w-20 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none"
                }}
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}