"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, Plus, ImagePlus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PhotowallAdmin() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [done, setDone] = useState(false)

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append("source", file)
    formData.append("target", "photowall")

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.error || "上传失败")
    return json.url as string
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setTotalCount(fileArray.length)
    setUploadedCount(0)
    setUploading(true)
    setDone(false)

    try {
      for (let i = 0; i < fileArray.length; i++) {
        await uploadFile(fileArray[i])
        setUploadedCount(i + 1)
      }
      setDone(true)
      setTimeout(() => {
        setShowPanel(false)
        setDone(false)
        router.refresh()
      }, 1500)
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="mt-10">
      {/* Toggle Button */}
      {!showPanel ? (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowPanel(true)}
            variant="outline"
            className="rounded-full border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 px-6"
          >
            <Plus className="mr-2 h-4 w-4" />
            上传照片
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
              上传照片到照片墙
            </h3>
            <button
              onClick={() => {
                setShowPanel(false)
                setDone(false)
              }}
              className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-500 transition-colors p-8 text-center cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {done ? (
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  上传完成！正在刷新...
                </p>
              </div>
            ) : uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                <p className="text-sm text-stone-500">
                  上传中... {uploadedCount} / {totalCount}
                </p>
                {/* Progress bar */}
                <div className="w-48 h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-stone-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-950/30 flex items-center justify-center transition-colors">
                  <ImagePlus className="h-6 w-6 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
                    点击上传照片
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                    支持 JPG / PNG / WebP，可多选
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-stone-400 dark:text-stone-500 text-center">
            照片将直接上传到图床相册，刷新后显示在照片墙
          </p>
        </div>
      )}
    </div>
  )
}
