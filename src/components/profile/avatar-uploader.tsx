"use client"

import { useState, useRef } from "react"
import { Camera, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/ui/safe-image"

interface AvatarUploaderProps {
  value: string
  onChange: (url: string) => void
}

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("source", file)
      formData.append("target", "avatar")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || "上传失败")
      }
      onChange(json.url)
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="group relative">
        <div
          className={cn(
            "relative h-28 w-28 overflow-hidden border-2 border-[#191914] bg-[#ece6da] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#292821] dark:shadow-[5px_5px_0_#f5f0e5]",
            uploading && "opacity-70"
          )}
        >
          {value ? (
            <SafeImage src={value} alt="头像预览" fill sizes="112px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#777268] dark:text-[#aaa69c]">
              <Camera className="h-8 w-8" />
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white drop-shadow-md" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition-colors group-hover:bg-black/35"
          aria-label="上传自定义头像"
        >
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center border-2 border-[#191914] bg-[#ff6b43] text-[#191914] transition-transform hover:scale-110 dark:border-[#f5f0e5]"
            title="清除头像"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      <div className="text-center">
        <p className="mb-1 text-sm font-bold">
          点击头像上传自定义图片
        </p>
        <p className="font-mono text-[9px] tracking-[0.1em] text-[#777268] dark:text-[#989389]">
          支持 JPG / PNG，建议正方形
        </p>
      </div>
    </div>
  )
}
