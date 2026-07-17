"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, ImagePlus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PhotowallUploader() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const [done, setDone] = useState(false)
  const [pendingHint, setPendingHint] = useState(false)
  const [caption, setCaption] = useState("")

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
    return json.pending as boolean
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setTotalCount(fileArray.length)
    setUploadedCount(0)
    setUploading(true)
    setDone(false)
    setPendingHint(false)

    try {
      let anyPending = false
      for (let i = 0; i < fileArray.length; i++) {
        const isPending = await uploadFile(fileArray[i])
        if (isPending) anyPending = true
        setUploadedCount(i + 1)
      }
      setDone(true)
      setPendingHint(anyPending)
      setCaption("")
      setTimeout(() => {
        setShowPanel(false)
        setDone(false)
        setPendingHint(false)
        router.refresh()
      }, 2500)
    } catch (err) {
      alert(err instanceof Error ? err.message : "上传失败")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="mt-12">
      {/* Toggle Button */}
      {!showPanel ? (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowPanel(true)}
            variant="outline"
            className="h-11 border-2 border-[#191914] bg-[#d9ef61] px-6 font-bold text-[#191914] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 hover:bg-[#d9ef61] dark:border-[#f5f0e5] dark:bg-[#d9ef61] dark:text-[#191914] dark:shadow-[4px_4px_0_#f5f0e5]"
          >
            <Plus className="mr-2 h-4 w-4" />
            上传照片
          </Button>
        </div>
      ) : (
        <div className="border-2 border-[#191914] bg-[#fffaf0] p-6 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">CONTRIBUTE A FRAME</p>
              <h3 className="mt-1 font-serif text-xl font-bold">上传照片到影像档案</h3>
            </div>
            <button
              onClick={() => {
                setShowPanel(false)
                setDone(false)
                setPendingHint(false)
              }}
              className="flex h-9 w-9 items-center justify-center border border-[#191914]/30 text-[#777268] hover:bg-[#ffb4aa] hover:text-[#191914] dark:border-white/30 dark:text-[#aaa69c]"
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
                <div className="flex h-12 w-12 items-center justify-center border-2 border-[#191914] bg-[#b9ddbd] text-[#191914] dark:border-[#f5f0e5]">
                  <Check className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold">
                  上传完成！{pendingHint ? "管理员审核通过后将显示在照片墙" : "正在刷新..."}
                </p>
              </div>
            ) : uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#e4532f]" />
                <p className="font-mono text-[10px] font-bold tracking-[0.12em] text-[#777268] dark:text-[#aaa69c]">
                  上传中... {uploadedCount} / {totalCount}
                </p>
                {/* Progress bar */}
                <div className="h-2 w-48 overflow-hidden border border-[#191914] bg-[#fffaf0] dark:border-[#f5f0e5] dark:bg-[#11110f]">
                  <div
                    className="h-full bg-[#ff6b43] transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (uploadedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border-2 border-[#191914] bg-[#f3c84b] text-[#191914] transition-transform group-hover:-rotate-3 dark:border-[#f5f0e5]">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    点击上传照片
                  </p>
                  <p className="mt-1 text-xs text-[#777268] dark:text-[#989389]">
                    支持 JPG / PNG / WebP，可多选；非管理员上传需审核后显示
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
