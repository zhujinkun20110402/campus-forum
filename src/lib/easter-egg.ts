export const EASTER_EGG_STORAGE_KEY = "campus-archive-trail-v2"
export const EASTER_EGG_EVENT = "campus:archive-trail"

export function readEasterEggStage() {
  if (typeof window === "undefined") return 0
  const value = Number(window.localStorage.getItem(EASTER_EGG_STORAGE_KEY))
  return Number.isInteger(value) && value >= 0 && value <= 7 ? value : 0
}

export function advanceEasterEggStage(expected: number, next: number) {
  const current = readEasterEggStage()
  if (current !== expected) return current
  window.localStorage.setItem(EASTER_EGG_STORAGE_KEY, String(next))
  window.dispatchEvent(new CustomEvent(EASTER_EGG_EVENT, { detail: next }))
  return next
}

export function resetEasterEgg() {
  window.localStorage.removeItem(EASTER_EGG_STORAGE_KEY)
  window.dispatchEvent(new CustomEvent(EASTER_EGG_EVENT, { detail: 0 }))
}
