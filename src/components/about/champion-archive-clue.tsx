"use client"

import { useEffect } from "react"
import { ChampionCrown } from "@/components/reputation/champion-crown"
import { useEasterEggStage } from "@/hooks/use-easter-egg-stage"

export function ChampionArchiveClue() {
  const { stage, advance } = useEasterEggStage()

  useEffect(() => {
    if (stage !== 5) return
    const timer = window.setTimeout(() => advance(5, 6), 700)
    return () => window.clearTimeout(timer)
  }, [advance, stage])

  return (
    <div className="flex flex-col items-end">
      <ChampionCrown />
      {stage >= 5 && (
        <div className="easter-reveal mt-2 rotate-1 border border-dashed border-white/40 bg-[#f3c84b] px-3 py-2 text-right text-[#191914] shadow-[2px_2px_0_#ff6b43]">
          <p className="font-mono text-[6px] font-bold tracking-[0.14em] text-[#7a6737]">CHAMPION SEAL / INDEX 017-A</p>
          <p className="mt-1 font-mono text-[8px] font-bold tracking-[0.12em]">12·35·51·24 / 43·15·32·44</p>
          <p className="mt-1 font-mono text-[6px] text-[#7a6737]">R / C</p>
        </div>
      )}
    </div>
  )
}
