"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, ImageIcon, ArrowDown, ArrowUp } from "lucide-react"
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

export function PhotowallGrid({ photos, isAdmin }: PhotowallGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState(photos)
  const [lightboxLoading, setLightboxLoading] = useState(true)
  const [lightboxError, setLightboxError] = useState(false)

  // 分批渲染
  const PAGE_SIZE = 24
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 上次浏览位置
  const [restoredY, setRestoredY] = useState<number | null>(null)
  const [showRestoreToast, setShowRestoreToast] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const SCROLL_KEY = "photowall-scroll-y"
  const MIN_RESTORE_OFFSET = 120 // 至少滚动 120px 才提示恢复

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const openLightbox = useCallback((index: number) => {
    setLightboxLoading(true)
    setLightboxError(false)
    setLightboxIndex(index)
  }, [])
  const prevPhoto = useCallback(() => {
    setLightboxLoading(true)
    setLightboxError(false)
    setLightboxIndex((prev) =>
      prev === null ? prev : (prev - 1 + localPhotos.length) % localPhotos.length
    )
  }, [localPhotos.length])
  const nextPhoto = useCallback(() => {
    setLightboxLoading(true)
    setLightboxError(false)
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

  // 恢复上次浏览位置
  useEffect(() => {
    const raw = localStorage.getItem(SCROLL_KEY)
    if (!raw) return

    const savedY = parseInt(raw, 10)
    if (Number.isNaN(savedY) || savedY <= MIN_RESTORE_OFFSET) return

    // 根据保存的滚动位置预估需要的照片数量
    // 每张照片约 320px 高，每行 4 列，所以每行约 1280px
    // 预估需要的照片数 = (savedY / 320) * 列数，留足余量
    const estimatedCount = Math.ceil((savedY / 300) * 4) + PAGE_SIZE
    if (estimatedCount > visibleCount) {
      setVisibleCount(Math.min(estimatedCount, localPhotos.length))
    }

    // 等待照片渲染和动画完成后再恢复
    const restoreTimer = setTimeout(() => {
      window.scrollTo({ top: savedY, behavior: "smooth" })
      setRestoredY(savedY)
      setShowRestoreToast(true)
      const hideTimer = setTimeout(() => setShowRestoreToast(false), 3000)
      return () => clearTimeout(hideTimer)
    }, 600)

    return () => clearTimeout(restoreTimer)
  }, [])

  // 无限滚动：观察哨兵元素
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < localPhotos.length) {
          setLoadingMore(true)
          // 小延迟，让加载动画可见
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, localPhotos.length))
            setLoadingMore(false)
          }, 300)
        }
      },
      { rootMargin: "300px" }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, localPhotos.length])

  // 滚动时保存位置（防抖）
  useEffect(() => {
    const handleScroll = () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        const y = Math.round(window.scrollY)
        if (y > MIN_RESTORE_OFFSET) {
          localStorage.setItem(SCROLL_KEY, y.toString())
        } else {
          localStorage.removeItem(SCROLL_KEY)
        }
      }, 200)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  // 返回上次位置
  const handleReturnToSaved = useCallback(() => {
    if (restoredY && restoredY > 0) {
      window.scrollTo({ top: restoredY, behavior: "smooth" })
    }
  }, [restoredY])

  // 清除记录并返回顶部
  const handleClearAndGoTop = useCallback(() => {
    localStorage.removeItem(SCROLL_KEY)
    setRestoredY(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

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
      {/* Masonry / Waterfall layout */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-2 sm:gap-3">
        {localPhotos.slice(0, visibleCount).map((photo, index) => (
          <ScrollReveal
            key={photo.url}
            delay={Math.min((index % PAGE_SIZE) * 0.04, 0.4)}
            className="break-inside-avoid mb-2 sm:mb-3"
          >
            <div
              className="group relative overflow-hidden rounded-lg sm:rounded-xl bg-stone-200 dark:bg-stone-800 cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img
                src={photo.thumb || photo.url}
                alt={photo.caption ?? "校园照片"}
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

              {/* Caption */}
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3.5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
                  <p className="text-[11px] sm:text-sm text-white/90 leading-snug line-clamp-2">
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Index badge */}
              <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[9px] sm:text-[10px] text-white/70 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
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
                  className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-red-500/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="删除照片"
                >
                  {deletingUrl === photo.url ? (
                    <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </button>
              )}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Infinite scroll sentinel & loading indicator */}
      {visibleCount < localPhotos.length && (
        <div ref={sentinelRef} className="flex flex-col items-center justify-center py-12">
          {loadingMore ? (
            <>
              <Loader2 className="h-6 w-6 text-stone-400 animate-spin mb-2" />
              <p className="text-xs text-stone-400 dark:text-stone-500">加载更多...</p>
            </>
          ) : (
            <p className="text-xs text-stone-400 dark:text-stone-500">
              已加载 {visibleCount} / {localPhotos.length} 张
            </p>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && localPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center animate-page-enter"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {/* Prev */}
          {localPhotos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevPhoto()
              }}
              className="absolute left-2 sm:left-4 md:left-8 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] sm:max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative min-h-[200px] min-w-[200px] flex items-center justify-center">
              {lightboxLoading && !lightboxError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <Loader2 className="h-10 w-10 text-white/60 animate-spin mb-3" />
                  <p className="text-xs text-white/40">图片加载中...</p>
                </div>
              )}
              {lightboxError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <ImageIcon className="h-10 w-10 text-white/30 mb-3" />
                  <p className="text-xs text-white/40">图片加载失败</p>
                </div>
              )}
              <img
                src={localPhotos[lightboxIndex].url}
                alt={localPhotos[lightboxIndex].caption ?? "校园照片"}
                className={cn(
                  "max-w-full max-h-[75vh] sm:max-h-[80vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300",
                  lightboxLoading || lightboxError ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setLightboxLoading(false)}
                onError={() => {
                  setLightboxLoading(false)
                  setLightboxError(true)
                }}
              />
            </div>
            {localPhotos[lightboxIndex].caption && (
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-white/70 text-center max-w-xs sm:max-w-lg leading-relaxed px-4">
                {localPhotos[lightboxIndex].caption}
              </p>
            )}
            <p className="mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-white/30 font-mono">
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
              className="absolute right-2 sm:right-4 md:right-8 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>
      )}

      {/* Restore position toast */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] flex items-center gap-3 rounded-full border bg-white/90 dark:bg-stone-900/90 backdrop-blur-md px-4 py-2.5 shadow-lg transition-all duration-500",
          showRestoreToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <ArrowDown className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs text-stone-700 dark:text-stone-200">
          已恢复上次浏览位置
        </span>
      </div>

      {/* Floating action: return to saved position / back to top */}
      {restoredY !== null && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[150] flex flex-col gap-2">
          <button
            onClick={handleReturnToSaved}
            className="group flex items-center justify-center gap-2 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-2.5 text-xs font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            title="回到上次位置"
          >
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
            上次位置
          </button>
          <button
            onClick={handleClearAndGoTop}
            className="group flex items-center justify-center gap-2 rounded-full bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 px-4 py-2 text-[11px] shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            title="返回顶部并清除记录"
          >
            <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
            返回顶部
          </button>
        </div>
      )}
    </>
  )
}
