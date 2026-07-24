"use client"

import { useEffect } from "react"
import { useEasterEggStage } from "@/hooks/use-easter-egg-stage"

export function ArchiveFrameMark() {
  const { stage, advance } = useEasterEggStage()

  useEffect(() => {
    if (stage !== 3) return
    const timer = window.setTimeout(() => advance(3, 4), 650)
    return () => window.clearTimeout(timer)
  }, [advance, stage])

  if (stage < 3) return null

  return (
    <div className="easter-reveal pointer-events-none absolute inset-x-2 bottom-2 z-20 border border-white/45 bg-[#11110f]/92 px-2.5 py-2 text-white shadow-[2px_2px_0_#ff6b43] backdrop-blur-sm sm:inset-x-3 sm:bottom-3">
      <p className="font-mono text-[6px] font-bold tracking-[0.16em] text-white/35">FRAME IV / AUDIO TRANSCRIPT</p>
      <p className="mt-1 break-words font-mono text-[8px] font-bold tracking-[0.13em] text-[#d9ef61]">... / . / .- / .-. / -.-. / ....</p>
    </div>
  )
}
