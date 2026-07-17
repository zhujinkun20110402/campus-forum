"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Trash2, Loader2, ImageIcon, ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/ui/safe-image"

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

// 瀑布流跨度模式：row-span-2 为高图，空字符串为标准图
// 用质数长度避免明显重复感
const spanPattern = [
  "row-span-2", "",
  "", "row-span-2",
  "", "",
  "row-span-2", "",
  "", "row-span-2",
  "", "",
  "row-span-2",
]

const PAGE_SIZE = 24
const SCROLL_KEY = "photowall-scroll-y"
const MIN_RESTORE_OFFSET = 120

export function PhotowallGrid({ photos, isAdmin }: PhotowallGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null)
  const [localPhotos, setLocalPhotos] = useState(photos)
  const [lightboxLoading, setLightboxLoading] = useState(true)
  const [lightboxError, setLightboxError] = useState(false)

  // 分批渲染
  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, photos.length))
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // 上次浏览位置
  const [restoredY, setRestoredY] = useState<number | null>(null)
  const [showRestoreToast, setShowRestoreToast] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // 等待照片渲染和动画完成后再恢复
    let hideTimer: ReturnType<typeof setTimeout> | undefined
    const estimatedCount = Math.min(Math.ceil((savedY / 300) * 4) + PAGE_SIZE, photos.length)
    const expandTimer = setTimeout(() => {
      setVisibleCount((current) => Math.max(current, estimatedCount))
    }, 0)
    const restoreTimer = setTimeout(() => {
      window.scrollTo({ top: savedY, behavior: "smooth" })
      setRestoredY(savedY)
      setShowRestoreToast(true)
      hideTimer = setTimeout(() => setShowRestoreToast(false), 3000)
    }, 600)

    return () => {
      clearTimeout(expandTimer)
      clearTimeout(restoreTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [photos.length])

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
      {/* Mosaic Grid — CSS Grid with dense flow, no reflow on append */}
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
        style={{
          gridAutoRows: "90px",
          gridAutoFlow: "dense",
        }}
      >
        {localPhotos.slice(0, visibleCount).map((photo, index) => {
          const span = spanPattern[index % spanPattern.length]
          return (
            <div
              key={photo.url}
              className={cn(
                "group relative cursor-pointer overflow-hidden border-2 border-[#191914] bg-[#d8d0c3] shadow-[4px_4px_0_#191914] transition-transform hover:-translate-y-1 dark:border-[#f5f0e5] dark:bg-[#2a2924] dark:shadow-[4px_4px_0_#f5f0e5]",
                "opacity-0 animate-[fadeUp_0.5s_ease-out_forwards]",
                span
              )}
              style={{
                animationDelay: `${Math.min((index % PAGE_SIZE) * 0.03, 0.3)}s`,
              }}
              onClick={() => openLightbox(index)}
            >
              <SafeImage
                src={photo.thumb || photo.url}
                alt={photo.caption ?? "校园照片"}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:saturate-[1.08]"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Caption */}
              {photo.caption && (
                <div className="absolute inset-x-2 bottom-2 translate-y-2 border border-white/50 bg-[#191914] p-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-3 sm:bottom-3 sm:p-3">
                  <p className="line-clamp-2 text-[10px] leading-snug text-white/90 sm:text-xs">
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* Admin delete button */}
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(photo.url)
                  }}
                  disabled={deletingUrl === photo.url}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center border border-white/60 bg-[#191914] text-white/80 opacity-0 transition-all duration-300 hover:bg-[#e4532f] hover:text-white group-hover:opacity-100 sm:right-2 sm:top-2"
                  title="删除照片"
                >
                  {deletingUrl === photo.url ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Infinite scroll sentinel & loading indicator */}
      {visibleCount < localPhotos.length && (
        <div ref={sentinelRef} className="flex flex-col items-center justify-center py-12 font-mono text-[10px] font-bold tracking-[0.12em]">
          {loadingMore ? (
            <>
              <Loader2 className="mb-2 h-6 w-6 animate-spin text-[#e4532f]" />
              <p className="text-[#777268] dark:text-[#989389]">LOADING MORE FRAMES</p>
            </>
          ) : (
            <p className="border border-[#191914]/25 bg-[#fffaf0] px-3 py-2 text-[#777268] dark:border-white/25 dark:bg-[#191914] dark:text-[#989389]">
              LOADED {visibleCount} / {localPhotos.length}
            </p>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && localPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#11110f]/95 backdrop-blur-md animate-page-enter"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-[#191914] text-white transition-colors hover:bg-[#ff6b43] hover:text-[#191914] sm:right-6 sm:top-6"
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
              className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-[#191914] text-white transition-colors hover:bg-[#d9ef61] hover:text-[#191914] sm:left-4 sm:h-12 sm:w-12 md:left-8"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] sm:max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex h-[70vh] w-[82vw] max-w-6xl items-center justify-center sm:h-[78vh] sm:w-[86vw]">
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
              <SafeImage
                src={localPhotos[lightboxIndex].url}
                alt={localPhotos[lightboxIndex].caption ?? "校园照片"}
                fill
                sizes="90vw"
                className={cn(
                  "border border-white/40 object-contain drop-shadow-[8px_8px_0_#ff6b43] transition-opacity duration-300",
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
              className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-[#191914] text-white transition-colors hover:bg-[#d9ef61] hover:text-[#191914] sm:right-4 sm:h-12 sm:w-12 md:right-8"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
        </div>
      )}

      {/* Restore position toast */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-3 border-2 border-[#191914] bg-[#fffaf0]/95 px-4 py-2.5 text-[#191914] shadow-[4px_4px_0_#191914] backdrop-blur-md transition-all duration-500 dark:border-[#f5f0e5] dark:bg-[#191914]/95 dark:text-[#f5f0e5] dark:shadow-[4px_4px_0_#f5f0e5]",
          showRestoreToast
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <ArrowDown className="h-3.5 w-3.5 text-[#e4532f]" />
        <span className="text-xs font-bold">
          已恢复上次浏览位置
        </span>
      </div>

      {/* Floating action: return to saved position / back to top */}
      {restoredY !== null && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[150] flex flex-col gap-2">
          <button
            onClick={handleReturnToSaved}
            className="group flex items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-4 py-2.5 text-xs font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-all hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
            title="回到上次位置"
          >
            <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
            上次位置
          </button>
          <button
            onClick={handleClearAndGoTop}
            className="group flex items-center justify-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 py-2 text-[11px] font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-all hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
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
