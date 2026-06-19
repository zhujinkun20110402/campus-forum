"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/post/image-upload"
import { Loader2, X, ImagePlus } from "lucide-react"

interface PhotoEntry {
  url: string
  caption: string
}

export function AlbumForm() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverUrls, setCoverUrls] = useState<string[]>([])
  const [photos, setPhotos] = useState<PhotoEntry[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCoverChange(urls: string[]) {
    setCoverUrls(urls.slice(0, 1))
  }

  function handlePhotosChange(urls: string[]) {
    setPhotos((prev) => {
      const captionMap = new Map(prev.map((p) => [p.url, p.caption]))
      return urls.map((url) => ({
        url,
        caption: captionMap.get(url) ?? "",
      }))
    })
  }

  function updateCaption(url: string, caption: string) {
    setPhotos((prev) =>
      prev.map((p) => (p.url === url ? { ...p, caption } : p))
    )
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p.url !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("请输入相册标题")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          coverUrl: coverUrls[0] ?? "",
          photos: photos.map((p) => ({
            url: p.url,
            caption: p.caption.trim() || undefined,
            uploadedAt: new Date().toISOString(),
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "创建失败，请重试")
      }

      const album = await res.json()
      router.push(`/album/${album.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败，请重试")
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          标题
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入相册标题"
          maxLength={60}
          className="h-11 rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-stone-700 dark:text-stone-300"
        >
          描述 <span className="text-stone-400 font-normal">— 选填</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="介绍一下这组照片的故事..."
          rows={3}
          className="rounded-xl border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 resize-y"
        />
      </div>

      {/* Cover image */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          封面图片
        </label>
        <p className="text-xs text-stone-400 dark:text-stone-500">
          上传一张图片作为相册封面（仅取第一张）
        </p>
        <ImageUpload value={coverUrls} onChange={handleCoverChange} />
      </div>

      {/* Photos */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          相册照片
        </label>
        <p className="text-xs text-stone-400 dark:text-stone-500">
          上传多张照片，可为每张照片添加说明
        </p>
        <ImageUpload value={photos.map((p) => p.url)} onChange={handlePhotosChange} />

        {photos.length > 0 && (
          <div className="mt-4 space-y-3">
            {photos.map((photo, i) => (
              <div
                key={photo.url}
                className="flex gap-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 p-3"
              >
                <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500">
                      照片 {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.url)}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                      aria-label="移除照片"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    value={photo.caption}
                    onChange={(e) => updateCaption(photo.url, e.target.value)}
                    placeholder="为这张照片添加说明（选填）"
                    className="h-9 rounded-lg border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length === 0 && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-stone-300 dark:border-stone-700 px-3 py-2 text-xs text-stone-400 dark:text-stone-500">
            <ImagePlus className="h-3.5 w-3.5" />
            <span>点击上方按钮上传照片</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 inline-flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            创建中...
          </>
        ) : (
          "创建相册"
        )}
      </button>
    </form>
  )
}
