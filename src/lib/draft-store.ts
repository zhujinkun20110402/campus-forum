/**
 * 发帖草稿的本地存储（仅浏览器 localStorage，不上传服务器）
 *
 * - 草稿内容：post-draft-v1（单槽位，覆盖式保存）
 * - 自动保存开关：post-draft-autosave（默认开启，"0" 表示关闭）
 *
 * 模块级缓存 + useSyncExternalStore：所有消费方（发帖表单、设置页）
 * 通过 subscribe 共享同一份状态，跨组件实时同步。
 */

export interface PostDraft {
  title: string
  content: string
  categoryId: string
  savedAt: number
}

const DRAFT_KEY = "post-draft-v1"
const TOGGLE_KEY = "post-draft-autosave"

let draftCache: PostDraft | null | undefined
let toggleCache: boolean | undefined
const draftListeners = new Set<() => void>()
const toggleListeners = new Set<() => void>()

function emitDraft() {
  draftListeners.forEach((listener) => listener())
}

function emitToggle() {
  toggleListeners.forEach((listener) => listener())
}

export function subscribeDraft(listener: () => void) {
  draftListeners.add(listener)
  return () => {
    draftListeners.delete(listener)
  }
}

export function getDraftSnapshot(): PostDraft | null {
  if (draftCache === undefined) {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      draftCache = raw ? (JSON.parse(raw) as PostDraft) : null
    } catch {
      draftCache = null
    }
  }
  return draftCache
}

export function saveDraft(draft: PostDraft) {
  draftCache = draft
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // 存储不可用（隐私模式等）时仅保留内存副本
  }
  emitDraft()
}

export function clearDraft() {
  draftCache = null
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // 忽略
  }
  emitDraft()
}

export function subscribeAutosave(listener: () => void) {
  toggleListeners.add(listener)
  return () => {
    toggleListeners.delete(listener)
  }
}

export function getAutosaveSnapshot(): boolean {
  if (toggleCache === undefined) {
    try {
      // 默认开启，只有显式写入 "0" 才关闭
      toggleCache = localStorage.getItem(TOGGLE_KEY) !== "0"
    } catch {
      toggleCache = true
    }
  }
  return toggleCache
}

export function setAutosaveEnabled(enabled: boolean) {
  toggleCache = enabled
  try {
    localStorage.setItem(TOGGLE_KEY, enabled ? "1" : "0")
  } catch {
    // 忽略
  }
  emitToggle()
}
