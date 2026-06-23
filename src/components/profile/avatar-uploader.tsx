"use client"

import { useState, useRef } from "react"
import { Camera, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="relative group">
        <div
          className={cn(
            "h-24 w-24 rounded-full overflow-hidden ring-4 ring-blue-100 dark:ring-blue-900 bg-stone-200 dark:bg-stone-700",
            uploading && "opacity-70"
          )}
        >
          {value ? (
            <img src={value} alt="头像预览" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-stone-500 dark:text-stone-400">
              <Camera className="h-8 w-8" />
            </div>
          )}
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin drop-shadow-md" />
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
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
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          点击头像上传自定义图片
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          支持 JPG / PNG，建议正方形
        </p>
      </div>
    </div>
  )
}
