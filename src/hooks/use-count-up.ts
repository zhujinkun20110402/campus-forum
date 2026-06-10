"use client"

import { useState, useEffect, useRef } from "react"

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export function useCountUp(
  end: number,
  options: { duration?: number; start?: number; enabled?: boolean } = {}
) {
  const { duration = 2000, start = 0, enabled = true } = options
  const [count, setCount] = useState(start)
  const [hasFinished, setHasFinished] = useState(false)
  const frameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!enabled) {
      setCount(start)
      return
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutExpo(progress)
      const currentCount = Math.floor(start + (end - start) * easedProgress)

      setCount(currentCount)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setCount(end)
        setHasFinished(true)
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [end, duration, start, enabled])

  return { count, hasFinished }
}
