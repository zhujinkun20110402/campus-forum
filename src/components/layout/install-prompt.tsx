"use client"

/**
 * PWA 安装引导
 *
 * InstallPrompt（横幅）：
 * - Chrome / Edge 捕获 beforeinstallprompt → 显示「立即安装」按钮
 * - iOS Safari 显示「分享 → 添加到主屏幕」指引
 * - 已安装不显示；点 × 关闭后永久不再弹出，关闭瞬间提示页脚保留了「安装到桌面」入口
 *
 * InstallEntry（常驻入口，挂在页脚与移动端菜单）：
 * - 有安装事件时点击直接触发安装
 * - 没有（iOS / 事件已过期）则弹出分平台图文指引
 * - 已安装时显示「已安装到桌面」状态
 *
 * ServiceWorkerRegister：
 * - 注册 public/sw.js（无 fetch 监听、不缓存任何页面）
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Check, Download, Share, X } from "lucide-react"
import { cn } from "@/lib/utils"

const DISMISS_KEY = "install-prompt-dismissed"

let dismissedCache: boolean | null = null
const dismissedListeners = new Set<() => void>()

function getDismissedSnapshot(): boolean {
  if (dismissedCache === null) {
    try {
      // 关闭一次即永久不再弹出；页脚保留了常驻安装入口
      dismissedCache = localStorage.getItem(DISMISS_KEY) === "1"
    } catch {
      dismissedCache = false
    }
  }
  return dismissedCache
}

function subscribeDismiss(listener: () => void) {
  dismissedListeners.add(listener)
  return () => {
    dismissedListeners.delete(listener)
  }
}

function dismissPersist() {
  dismissedCache = true
  try {
    localStorage.setItem(DISMISS_KEY, "1")
  } catch {
    // localStorage 不可用时仅本次会话隐藏
  }
  dismissedListeners.forEach((listener) => listener())
}

const noopSubscribe = () => () => {}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  if (window.matchMedia("(display-mode: standalone)").matches) return true
  return (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false
  const ua = navigator.userAgent
  // iPadOS 13+ 伪装成 Macintosh，需要结合触屏点数判断
  return /iphone|ipad|ipod/i.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
}

type InstallPlatform = "ios" | "android" | "desktop"

function getPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "desktop"
  if (isIOS()) return "ios"
  if (/android/i.test(navigator.userAgent)) return "android"
  return "desktop"
}

/** 捕获浏览器安装事件（各组件独立监听，事件可重复分发） */
function useInstallPromptEvent() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || isStandalone()) return

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setDeferred(null)

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  return deferred
}

export function InstallPrompt() {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const dismissed = useSyncExternalStore(subscribeDismiss, getDismissedSnapshot, () => false)
  const deferred = useInstallPromptEvent()
  const [showDismissHint, setShowDismissHint] = useState(false)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!mounted) return
    const onInstalled = () => dismissPersist()
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("appinstalled", onInstalled)
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [mounted])

  const handleInstall = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
  }

  const handleDismiss = () => {
    dismissPersist()
    setShowDismissHint(true)
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    hintTimerRef.current = setTimeout(() => setShowDismissHint(false), 4000)
  }

  if (!mounted || isStandalone()) return null

  const isIos = isIOS()
  const showBanner = !dismissed && (deferred !== null || isIos)

  return (
    <>
      {/* Chromium 系：可代码触发安装 */}
      {showBanner && deferred && (
        <div className="fixed bottom-4 left-4 right-4 z-[80] flex items-center gap-3 border-2 border-[#191914] bg-[#fffaf0] p-3 shadow-[4px_4px_0_#191914] animate-[fadeUp_0.5s_ease-out_forwards] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[4px_4px_0_#f5f0e5] sm:left-auto sm:right-5 sm:max-w-sm sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/app-icon.png"
          alt=""
          className="h-11 w-11 shrink-0 border border-[#191914] bg-white p-0.5 dark:border-[#f5f0e5]"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">把学生论坛装到桌面</p>
          <p className="mt-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">
            LIKE AN APP · 随时打开
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 border-2 border-[#191914] bg-[#ff6b43] px-3 py-2 text-xs font-bold shadow-[2px_2px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[2px_2px_0_#f5f0e5]"
        >
          <span className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            安装
          </span>
        </button>
        <button
          onClick={handleDismiss}
          aria-label="关闭"
          className="-m-1 shrink-0 p-1 text-[#777268] hover:text-[#e4532f] dark:text-[#989389]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      )}

      {/* iOS：只能引导用户手动操作 */}
      {showBanner && !deferred && (
        <div className="fixed inset-x-4 bottom-4 z-[80] flex items-center gap-3 border-2 border-[#191914] bg-[#fffaf0] p-3 shadow-[4px_4px_0_#191914] animate-[fadeUp_0.5s_ease-out_forwards] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[4px_4px_0_#f5f0e5] sm:inset-x-auto sm:right-5 sm:max-w-md sm:p-4">
      <Share className="h-5 w-5 shrink-0 text-[#e4532f]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">把论坛添加到主屏幕</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[#777268] dark:text-[#989389]">
          点 Safari 底部的「分享」按钮，选择「添加到主屏幕」
        </p>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="关闭"
        className="-m-1 shrink-0 p-1 text-[#777268] hover:text-[#e4532f] dark:text-[#989389]"
      >
        <X className="h-4 w-4" />
      </button>
      </div>
      )}

      {/* 关闭横幅后的提示：永久隐藏，告知页脚入口 */}
      {showDismissHint && (
        <div className="fixed bottom-4 left-1/2 z-[80] flex max-w-[92vw] -translate-x-1/2 items-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-4 py-2.5 text-[#191914] shadow-[4px_4px_0_#191914] animate-[fadeUp_0.4s_ease-out_forwards] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[4px_4px_0_#f5f0e5]">
          <Check className="h-3.5 w-3.5 shrink-0 text-[#e4532f]" />
          <span className="text-xs font-bold">已隐藏安装提示 · 之后可在页脚找到「安装到桌面」</span>
        </div>
      )}
    </>
  )
}

const GUIDE_STEPS: Record<InstallPlatform, string[]> = {
  ios: [
    "点浏览器底部中间的「分享」按钮（方框加向上箭头）",
    "向下滑动菜单，找到「添加到主屏幕」并点击",
    "桌面出现论坛图标，之后点图标即可全屏打开",
  ],
  android: [
    "点浏览器右上角的「⋮」菜单",
    "找到「安装应用」或「添加到主屏幕」并点击",
    "桌面出现论坛图标，之后点图标即可打开",
  ],
  desktop: [
    "看地址栏右侧有没有「安装」图标，直接点击即可",
    "或者点浏览器右上角「⋮」菜单 →「安装 学生论坛」",
    "安装后可从开始菜单 / 任务栏直接打开",
  ],
}

interface InstallEntryProps {
  className?: string
  label?: string
  /** 点击安装入口时触发（如：关闭移动端菜单） */
  onAction?: () => void
}

/** 常驻安装入口：有安装事件直接触发，否则弹指引 */
export function InstallEntry({ className, label = "安装到桌面", onAction }: InstallEntryProps) {
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const deferred = useInstallPromptEvent()
  const [guideOpen, setGuideOpen] = useState(false)

  // 已安装：水合前（SSR / 首帧）先渲染普通按钮保证结构一致，水合后再切换为状态展示
  if (mounted && isStandalone()) {
    return (
      <span
        className={cn(className, "pointer-events-none select-none opacity-60")}
        title="已安装"
      >
        <Check className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
    )
  }

  const handleClick = async () => {
    onAction?.()
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      return
    }
    setGuideOpen(true)
  }

  const platform = getPlatform()
  const steps = GUIDE_STEPS[platform]

  return (
    <>
      <button type="button" onClick={handleClick} className={cn("inline-flex items-center gap-1.5", className)}>
        <Download className="h-3.5 w-3.5 shrink-0" />
        {label}
      </button>

      {guideOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#11110f]/80 p-4 backdrop-blur-sm animate-page-enter"
          onClick={() => setGuideOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="安装到主屏幕指引"
        >
          <div
            className="w-full max-w-sm border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#171713] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-serif text-lg font-bold">安装到主屏幕</p>
              <button
                onClick={() => setGuideOpen(false)}
                aria-label="关闭"
                className="-m-1 p-1 text-[#777268] hover:text-[#e4532f] dark:text-[#989389]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[#191914] bg-[#f3c84b] font-mono text-[10px] font-bold dark:border-[#f5f0e5]">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-[#777268] dark:text-[#989389]">{step}</span>
                </li>
              ))}
            </ol>
            {platform === "ios" && (
              <p className="mt-4 border-t border-[#191914]/20 pt-3 text-xs leading-relaxed text-[#918b80] dark:border-white/20">
                提示：需要 iOS 16.4 及以上系统，未来开启「通知推送」也依赖已添加到主屏幕。
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return
    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    // SW 只在安全上下文可用（https 或 localhost）
    if (window.location.protocol !== "https:" && !isLocalhost) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // 注册失败不影响任何功能（仅失去安装条件与未来的推送）
    })
  }, [])
  return null
}
