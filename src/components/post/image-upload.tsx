"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, X, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/ui/safe-image"

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
            "inline-flex h-8 items-center gap-2 border border-dashed border-[#191914]/45 bg-[#fffaf0] px-3 text-xs font-bold text-[#5f5c54] transition-colors hover:border-[#191914] hover:bg-[#d9ef61] hover:text-[#191914] dark:border-white/40 dark:bg-[#191914] dark:text-[#aaa69c] dark:hover:border-white dark:hover:bg-[#d9ef61] dark:hover:text-[#191914]",
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
        <span className="font-mono text-[9px] tracking-[0.1em] text-[#918b80] dark:text-[#7f7b73]">
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
        <div className="flex items-center gap-2 border border-[#326b42] bg-[#b9ddbd]/45 px-3 py-2 text-[#275836] dark:text-[#b9ddbd]">
          <Check className="h-4 w-4" />
          <span className="text-sm font-bold">上传成功</span>
          <button
            type="button"
            onClick={() => handleCopyUrl(uploadedUrl)}
            className="ml-auto text-xs font-bold underline-offset-4 hover:underline"
          >
            复制 Markdown
          </button>
        </div>
      )}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={i} className="group relative h-20 w-20 overflow-hidden border-2 border-[#191914] bg-[#ece6da] shadow-[2px_2px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#292821] dark:shadow-[2px_2px_0_#f5f0e5]">
              <SafeImage
                src={url}
                alt="已上传的帖子图片"
                fill
                sizes="80px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center bg-[#d44120] text-white opacity-0 transition-opacity group-hover:opacity-100"
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
