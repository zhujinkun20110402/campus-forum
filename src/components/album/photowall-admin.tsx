"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, ImagePlus, X, Check, Eye, EyeOff, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SafeImage } from "@/components/ui/safe-image"

interface PendingPhoto {
  url: string
  thumb: string
  caption?: string
  uploadedAt: string
  uploadedBy: string
}

export function PhotowallAdmin() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [done, setDone] = useState(false)
  const [caption, setCaption] = useState("")

  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])
  const [pendingLoading, setPendingLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [showPending, setShowPending] = useState(false)

  async function fetchPending() {
    setPendingLoading(true)
    try {
      const res = await fetch("/api/photowall/pending")
      if (!res.ok) throw new Error("获取待审核照片失败")
      const data = await res.json()
      setPendingPhotos(data.photos || [])
    } catch {
      setPendingPhotos([])
    } finally {
      setPendingLoading(false)
    }
  }

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append("source", file)
    formData.append("target", "photowall")
    if (caption.trim()) {
      formData.append("caption", caption.trim())
    }

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
      setCaption("")
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

  async function handleApprove(url: string) {
    setPendingAction(url)
    try {
      const res = await fetch("/api/photowall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", url }),
      })
      if (!res.ok) throw new Error("通过失败")
      await fetchPending()
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : "通过失败")
    } finally {
      setPendingAction(null)
    }
  }

  async function handleReject(url: string) {
    if (!confirm("确定要拒绝并删除这张照片吗？")) return
    setPendingAction(url)
    try {
      const res = await fetch("/api/photowall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", url }),
      })
      if (!res.ok) throw new Error("拒绝失败")
      await fetchPending()
    } catch (err) {
      alert(err instanceof Error ? err.message : "拒绝失败")
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className="mt-10">
      {/* Toggle Button */}
      {!showPanel ? (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setShowPanel(true)
              fetchPending()
            }}
            variant="outline"
            className="h-11 border-2 border-[#191914] bg-[#ff6b43] px-6 font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#ff6b43] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5]"
          >
            <Plus className="mr-2 h-4 w-4" />
            管理照片墙
          </Button>
        </div>
      ) : (
        <div className="space-y-8 border-2 border-[#191914] bg-[#fffaf0] p-6 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:p-8">
          {/* Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
                上传照片到照片墙
              </h3>
              <button
                onClick={() => {
                  setShowPanel(false)
                  setDone(false)
                  setShowPending(false)
                }}
                className="h-8 w-8 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Caption input */}
            <div className="mb-4">
              <Input
                placeholder="给照片写句备注（可选）"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                disabled={uploading}
                className="h-12 rounded-none border-2 border-[#191914] bg-white text-[#191914] focus-visible:ring-[#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f] dark:text-[#f5f0e5]"
              />
            </div>

            {/* Upload Area */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="group relative cursor-pointer border-2 border-dashed border-[#191914]/45 bg-[#ece6da]/50 p-8 text-center transition-colors hover:border-[#e4532f] hover:bg-[#ff6b43]/5 dark:border-white/40 dark:bg-[#11110f]/50 dark:hover:border-[#ff6b43]"
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
              管理员上传的照片将直接显示在照片墙
            </p>
          </div>

          {/* Pending Review Section */}
          <div className="border-t-2 border-[#191914] pt-6 dark:border-[#f5f0e5]">
            <button
              onClick={() => setShowPending((prev) => !prev)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-amber-500" />
                <h3 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
                  待审核照片
                </h3>
                <span className="text-xs text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                  {pendingPhotos.length}
                </span>
              </div>
              {showPending ? (
                <EyeOff className="h-4 w-4 text-stone-400" />
              ) : (
                <Eye className="h-4 w-4 text-stone-400" />
              )}
            </button>

            {showPending && (
              <div className="mt-4">
                {pendingLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                  </div>
                ) : pendingPhotos.length === 0 ? (
                  <div className="border-2 border-dashed border-[#191914]/30 py-8 text-center dark:border-white/30">
                    <Check className="mx-auto h-8 w-8 text-stone-300 dark:text-stone-600" />
                    <p className="mt-2 text-sm text-stone-400 dark:text-stone-500">
                      暂无待审核照片
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {pendingPhotos.map((photo) => (
                      <div
                        key={photo.url}
                        className="group relative aspect-square overflow-hidden border-2 border-[#191914] bg-[#ece6da] dark:border-[#f5f0e5] dark:bg-[#292821]"
                      >
                        <SafeImage
                          src={photo.thumb || photo.url}
                          alt={photo.caption ?? "待审核照片"}
                          fill
                          sizes="(min-width: 768px) 25vw, 50vw"
                          className="object-cover"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                          {photo.caption && (
                            <p className="text-xs text-white/90 line-clamp-2 mb-1.5">
                              {photo.caption}
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-white/60 mb-2">
                            <User className="h-3 w-3" />
                            <span className="truncate">{photo.uploadedBy}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(photo.url)}
                              disabled={pendingAction === photo.url}
                              className="flex-1 h-7 rounded-full bg-emerald-500/90 hover:bg-emerald-500 text-white text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              {pendingAction === photo.url ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              通过
                            </button>
                            <button
                              onClick={() => handleReject(photo.url)}
                              disabled={pendingAction === photo.url}
                              className="flex-1 h-7 rounded-full bg-red-500/90 hover:bg-red-500 text-white text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                              拒绝
                            </button>
                          </div>
                        </div>

                        {/* Always visible uploader badge */}
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[9px] text-white/80 flex items-center gap-1">
                          <User className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[80px]">{photo.uploadedBy}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
