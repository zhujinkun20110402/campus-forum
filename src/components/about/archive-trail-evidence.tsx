"use client"

import { Camera, Luggage, Search } from "lucide-react"
import { useEffect } from "react"
import { useEasterEggStage } from "@/hooks/use-easter-egg-stage"

type EvidenceKind = "lostfound" | "announcement" | "search"

const stageMap: Record<EvidenceKind, [number, number]> = {
  lostfound: [1, 2],
  announcement: [2, 3],
  search: [4, 5],
}

export function ArchiveTrailEvidence({ kind }: { kind: EvidenceKind }) {
  const { stage, advance } = useEasterEggStage()
  const [expected, next] = stageMap[kind]

  useEffect(() => {
    if (stage !== expected) return
    const timer = window.setTimeout(() => advance(expected, next), 450)
    return () => window.clearTimeout(timer)
  }, [advance, expected, next, stage])

  if (stage < expected) return null

  if (kind === "lostfound") {
    return (
      <aside className="easter-reveal ml-auto mt-12 w-fit max-w-full rotate-[-1deg] border border-dashed border-[#191914]/55 bg-[#e7dfd2] px-4 py-3 text-[#191914] shadow-[3px_3px_0_rgba(25,25,20,0.18)] dark:border-[#f5f0e5]/45 dark:bg-[#292821] dark:text-[#f5f0e5]">
        <div className="flex items-start gap-4">
          <Luggage className="h-4 w-4 shrink-0 text-[#8b3d2c] dark:text-[#ff8a68]" />
          <div>
            <p className="font-mono text-[7px] font-bold tracking-[0.16em] text-[#777268] dark:text-[#989389]">PROPERTY TAG / LF–07 / REVERSE</p>
            <p className="mt-2 font-mono text-[10px] font-bold tracking-[0.18em]">14 · 15 · 20 · 09 · 03 · 05</p>
            <p className="mt-1.5 font-mono text-[7px] text-[#918b80]">A01</p>
          </div>
        </div>
      </aside>
    )
  }

  if (kind === "announcement") {
    return (
      <aside className="easter-reveal ml-auto mt-12 w-fit max-w-full border border-[#191914]/40 bg-[#191914] px-4 py-3 text-[#f5f0e5] shadow-[3px_3px_0_#ff6b43] dark:border-[#f5f0e5]/50">
        <div className="flex items-center gap-4">
          <Camera className="h-4 w-4 shrink-0 text-[#f3c84b]" />
          <div className="font-mono text-[8px] font-bold tracking-[0.15em]">
            <p className="text-white/35">ERRATA / NOTICE–06</p>
            <p className="mt-1.5">ARCHIVE 04 · CONTACT SHEET · FRAME IV</p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="easter-reveal ml-auto mt-5 w-fit max-w-full rotate-[0.5deg] border border-dashed border-[#191914]/50 bg-[#f3c84b] px-4 py-3 text-[#191914] shadow-[3px_3px_0_rgba(25,25,20,0.2)]">
      <div className="flex items-start gap-4">
        <Search className="h-4 w-4 shrink-0" />
        <div>
          <p className="font-mono text-[7px] font-bold tracking-[0.15em] text-[#6c5a2f]">RECOVERED QUERY / SHIFT TAG 07</p>
          <p className="mt-2 font-mono text-lg font-bold tracking-[0.32em]">YHUR</p>
          <p className="mt-1 font-mono text-[7px] text-[#7a6737]">A → H</p>
        </div>
      </div>
    </aside>
  )
}
