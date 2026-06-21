"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Trash2, Loader2 } from "lucide-react"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { cn } from "@/lib/utils"

interface Photo {
  url: string
  thumb: string
  caption?: string
  uploadedAt: string
  uploadedBy: string
}

interface PhotowallGridProps {
  photos: Photo[]
  isAdmin: boolean
}

// 艺术感错落布局：轮换不同宽高比
const aspectRatios = [
  "aspect-[3/4]",   // 竖图
  "aspect-square",  // 方图
  "aspect-[4/3]",   // 横图
  "aspect-[3/4]",   // 竖图
  "aspect-[4/5]",   // 偏竖
  "aspect-[4/3]",   // 横图
]

export function PhotowallGrid({ photos, isAdmin }: PhotowallGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState(photos)

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? prev : (prev - 1 + localPhotos.length) % localPhotos.length
    )
  }, [localPhotos.length])
  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? prev : (prev + 1) % localPhotos.length
    )
  }, [localPhotos.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prevPhoto()
      if (e.key === "ArrowRight") nextPhoto()
    }
    window.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [lightboxIndex, closeLightbox, prevPhoto, nextPhoto])

  async function handleDelete(url: string) {
    if (!confirm("确定要删除这张照片吗？")) return
    setDeletingUrl(url)
    try {
      const res = await fetch(`/api/photowall?url=${encodeURIComponent(url)}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setLocalPhotos((prev) => prev.filter((p) => p.url !== url))
      }
    } catch {
      alert("删除失败")
    } finally {
      setDeletingUrl(null)
    }
  }

  return (
    <>
      {/* Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {localPhotos.map((photo, index) => (
          <ScrollReveal key={photo.url} delay={Math.min(index * 0.04, 0.4)}>
            <div
              className="group relative break-inside-avoid overflow-hidden rounded-2xl bg-stone-200 dark:bg-stone-800 cursor-pointer"
              onClick={() => setLightboxIndex(index)}
            >
              <div className={cn("w-full", aspectRatios[index % aspectRatios.length])}>
                <img
                  src={photo.thumb || photo.url}
                  alt={photo.caption ?? "校园照片"}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              {/* Caption */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <p className="text-sm text-white/90 leading-snug line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Index badge */}
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[10px] text-white/70 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Admin delete button */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(photo.url)
                  }}
                  disabled={deletingUrl === photo.url}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-red-500/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="删除照片"
                >
                  {deletingUrl === photo.url ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && localPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center animate-page-enter"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {localPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
              className="absolute left-4 sm:left-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={localPhotos[lightboxIndex].url}
              alt={localPhotos[lightboxIndex].caption ?? "校园照片"}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {localPhotos[lightboxIndex].caption && (
              <p className="mt-4 text-sm text-white/70 text-center max-w-lg leading-relaxed">
                {localPhotos[lightboxIndex].caption}
              </p>
            )}
            <p className="mt-2 text-[10px] text-white/30 font-mono">
              {lightboxIndex + 1} / {localPhotos.length}
            </p>
          </div>

          {/* Next */}
          {localPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextPhoto()
              }}
              className="absolute right-4 sm:right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  )
}
