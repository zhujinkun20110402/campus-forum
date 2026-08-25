"use client"

/**
 * 帖子正文图片灯箱
 *
 * 复用了照片墙灯箱（src/components/album/photowall-grid.tsx）的交互与视觉：
 * - 点击图片放大，支持左右切换、Esc 关闭、方向键翻页、锁定背景滚动
 * - 灯箱内使用原生 <img>（不经过 next/image 优化），不消耗图片优化配额
 *
 * 模块级注册表（entries）+ version 快照：
 * ReactMarkdown 渲染的每一张图片（LightboxImage）挂载时注册自己，
 * PostImageLightbox 通过 useSyncExternalStore 订阅，实现整页图片间的连续切换。
 */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import type { ClassAttributes, ImgHTMLAttributes } from "react"
import type { ExtraProps } from "react-markdown"
import { ChevronLeft, ChevronRight, ImageIcon, Loader2, X, ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"

interface LightboxEntry {
  id: number
  src: string
  alt: string
}

let entries: LightboxEntry[] = []
let nextId = 1
let currentId: number | null = null
let version = 0
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getVersion() {
  return version
}

/** ReactMarkdown 传给 img 渲染器的精确 props 类型（与 react-markdown Components 签名一致） */
type MarkdownImageProps = ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement> & ExtraProps

/** 替换 ReactMarkdown 默认 img 的客户端组件：注册图片并响应点击 */
export function LightboxImage({ src, alt = "", title, node: _node, className: _className, ..._rest }: MarkdownImageProps) {
  const idRef = useRef<number | null>(null)
  const srcString = typeof src === "string" ? src : undefined

  useEffect(() => {
    if (!srcString) return
    const id = nextId++
    idRef.current = id
    entries.push({ id, src: srcString, alt })
    emit()
    return () => {
      entries = entries.filter((entry) => entry.id !== id)
      if (currentId === id) currentId = null
      emit()
    }
  }, [srcString, alt])

  const handleOpen = useCallback(() => {
    if (idRef.current === null) return
    currentId = idRef.current
    emit()
  }, [])

  if (!srcString) return null

  return (
    <span className="group/img relative my-6 block overflow-hidden border-2 border-[#191914] bg-[#d8d0c3] shadow-[4px_4px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#2a2924] dark:shadow-[4px_4px_0_#f5f0e5]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        className="m-0 block w-full cursor-zoom-in transition-[filter] duration-300 group-hover/img:brightness-90"
        onClick={handleOpen}
      />
      <span
        aria-hidden
        className="absolute right-2 top-2 flex items-center gap-1 border border-white/60 bg-[#191914]/85 px-2 py-1 font-mono text-[8px] font-bold tracking-[0.12em] text-white/90 opacity-0 transition-opacity duration-300 group-hover/img:opacity-100"
      >
        <ZoomIn className="h-3 w-3" />
        ZOOM
      </span>
    </span>
  )
}

/** 灯箱浮层：挂在帖子页任意位置，订阅模块级图片注册表 */
export function PostImageLightbox() {
  useSyncExternalStore(subscribe, getVersion, getVersion)

  const current = currentId === null ? undefined : entries.find((entry) => entry.id === currentId)
  const total = entries.length
  const index = current ? entries.indexOf(current) : -1

  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const close = useCallback(() => {
    currentId = null
    emit()
  }, [])

  const prev = useCallback(() => {
    if (!current) return
    currentId = entries[(index - 1 + total) % total].id
    emit()
  }, [current, index, total])

  const next = useCallback(() => {
    if (!current) return
    currentId = entries[(index + 1) % total].id
    emit()
  }, [current, index, total])

  // 打开/切换图片时重置加载状态
  useEffect(() => {
    if (currentId !== null) {
      setLoading(true)
      setFailed(false)
    }
  }, [currentId])

  // 键盘操作 + 锁定背景滚动
  useEffect(() => {
    if (!current) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [current, close, prev, next])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#11110f]/95 backdrop-blur-md animate-page-enter"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="图片查看"
    >
      {/* Close */}
      <button
        onClick={close}
        aria-label="关闭"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-[#191914] text-white transition-colors hover:bg-[#ff6b43] hover:text-[#191914] sm:right-6 sm:top-6"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Prev */}
      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            prev()
          }}
          aria-label="上一张"
          className="absolute left-2 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-[#191914] text-white transition-colors hover:bg-[#d9ef61] hover:text-[#191914] sm:left-4 sm:h-12 sm:w-12 md:left-8"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative flex max-h-[90vh] w-full max-w-[95vw] flex-col items-center sm:max-h-[85vh] sm:max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-[70vh] w-[92vw] max-w-6xl items-center justify-center sm:h-[78vh] sm:w-[86vw]">
          {loading && !failed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-white/60" />
              <p className="text-xs text-white/40">图片加载中...</p>
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <ImageIcon className="mb-3 h-10 w-10 text-white/30" />
              <p className="text-xs text-white/40">图片加载失败</p>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.src}
            alt={current.alt}
            className={cn(
              "max-h-full max-w-full border border-white/40 object-contain drop-shadow-[8px_8px_0_#ff6b43] transition-opacity duration-300",
              loading || failed ? "opacity-0" : "opacity-100"
            )}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setFailed(true)
            }}
          />
        </div>
        {current.alt && (
          <p className="mt-3 max-w-lg px-4 text-center text-xs leading-relaxed text-white/70 sm:mt-4 sm:text-sm">
            {current.alt}
          </p>
        )}
        <p className="mt-1.5 font-mono text-[9px] text-white/30 sm:mt-2 sm:text-[10px]">
          {index + 1} / {total}
        </p>
      </div>

      {/* Next */}
      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            next()
          }}
          aria-label="下一张"
          className="absolute right-2 z-10 flex h-10 w-10 items-center justify-center border border-white/50 bg-[#191914] text-white transition-colors hover:bg-[#d9ef61] hover:text-[#191914] sm:right-4 sm:h-12 sm:w-12 md:right-8"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
    </div>
  )
}
