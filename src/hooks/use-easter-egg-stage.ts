"use client"

import { useCallback, useEffect, useState } from "react"
import {
  advanceEasterEggStage,
  EASTER_EGG_EVENT,
  readEasterEggStage,
} from "@/lib/easter-egg"

export function useEasterEggStage() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const restore = window.setTimeout(() => setStage(readEasterEggStage()), 0)
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail
      setStage(Number.isInteger(detail) ? detail : readEasterEggStage())
    }
    window.addEventListener(EASTER_EGG_EVENT, sync)
    return () => {
      window.clearTimeout(restore)
      window.removeEventListener(EASTER_EGG_EVENT, sync)
    }
  }, [])

  const advance = useCallback((expected: number, next: number) => {
    setStage(advanceEasterEggStage(expected, next))
  }, [])

  return { stage, advance }
}
