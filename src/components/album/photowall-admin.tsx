"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Loader2, Plus, ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PhotowallAdmin() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pendingUrls, setPendingUrls] = useState<string[]>([])
  const [caption, setCaption] = useState("")
  const [showPanel, setShowPanel] = useState(false)

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

    setUploading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadFile(file)
        urls.push(url)
      }
      setPendingUrls((prev) => [...prev, ...urls])
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSave() {
    if (pendingUrls.length === 0) return
    setUploading(true)
    try {
      for (const url of pendingUrls) {
        await fetch("/api/photowall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, caption: caption || undefined }),
        })
      }
      setPendingUrls([])
      setCaption("")
      setShowPanel(false)
      router.refresh()
    } catch {
      alert("保存失败")
    } finally {
      setUploading(false)
    }
  }

  function removePending(url: string) {
    setPendingUrls((prev) => prev.filter((u) => u !== url))
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
            管理照片墙
          </Button>
        </div>
      ) : (
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-6 sm:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
              管理照片墙
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
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
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                <p className="text-sm text-stone-500">上传中...</p>
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

          {/* Pending Photos Preview */}
          {pendingUrls.length > 0 && (
            <div className="mt-6">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-3">
                待添加 ({pendingUrls.length})
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
                {pendingUrls.map((url) => (
                  <div
                    key={url}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt="待添加"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => removePending(url)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Caption Input */}
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="为这批照片添加说明（可选）"
                className="mb-4 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800"
              />

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={uploading}
                className="w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    添加到照片墙
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
