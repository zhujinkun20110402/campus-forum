"use client"

import Link from "next/link"
import { Archive, ArrowLeft, Check, Copy, Fingerprint, RotateCcw, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { useEasterEggStage } from "@/hooks/use-easter-egg-stage"
import { resetEasterEgg } from "@/lib/easter-egg"
import { cn } from "@/lib/utils"

const archiveSequence = [1, 3, 5, 7]
const coordinateSequence = ["12", "35", "51", "24", "43", "15", "32", "44"]
const characterGrid = [
  ["春", "银", "纸", "北", "七"],
  ["灯", "风", "页", "在", "声"],
  ["桥", "号", "墨", "雨", "杏"],
  ["角", "旧", "十", "窗", "铃"],
  ["落", "影", "校", "夜", "书"],
]

function getCharacter(coordinate: string) {
  return characterGrid[Number(coordinate[0]) - 1]?.[Number(coordinate[1]) - 1] ?? ""
}

export function AboutArchive() {
  const { stage, advance } = useEasterEggStage()
  const [archiveIndex, setArchiveIndex] = useState(0)
  const [coordinateIndex, setCoordinateIndex] = useState(0)
  const [fault, setFault] = useState<"archive" | "grid" | null>(null)
  const [copied, setCopied] = useState(false)
  const passphrase = useMemo(() => coordinateSequence.map(getCharacter).join(""), [])

  function flashFault(section: "archive" | "grid") {
    setFault(section)
    window.setTimeout(() => setFault((current) => current === section ? null : current), 620)
  }

  function chooseArchivePage(page: number) {
    if (stage > 0) return
    if (page !== archiveSequence[archiveIndex]) {
      setArchiveIndex(0)
      flashFault("archive")
      return
    }
    const next = archiveIndex + 1
    setArchiveIndex(next)
    if (next === archiveSequence.length) advance(0, 1)
  }

  function chooseCoordinate(row: number, column: number) {
    if (stage !== 6) return
    const coordinate = `${row + 1}${column + 1}`
    if (coordinate !== coordinateSequence[coordinateIndex]) {
      setCoordinateIndex(0)
      flashFault("grid")
      return
    }
    const next = coordinateIndex + 1
    setCoordinateIndex(next)
    if (next === coordinateSequence.length) advance(6, 7)
  }

  function resetArchive() {
    resetEasterEgg()
    setArchiveIndex(0)
    setCoordinateIndex(0)
    setFault(null)
    setCopied(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function copyPassphrase() {
    await navigator.clipboard.writeText(passphrase)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const markedPages = stage > 0 ? archiveSequence : archiveSequence.slice(0, archiveIndex)

  return (
    <div className="min-h-screen overflow-hidden bg-[#171713] pt-24 text-[#191914] sm:pt-28">
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-[0.055] [background-image:repeating-linear-gradient(0deg,transparent,transparent_3px,#fff_4px)]" />
      <main className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between font-mono text-[9px] font-bold tracking-[0.16em] text-[#f5f0e5]/35">
          <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-[#f5f0e5]"><ArrowLeft className="h-3.5 w-3.5" /> RETURN TO FORUM</Link>
          <span>ARCHIVE ACCESS / 017</span>
        </div>

        <article className="easter-paper relative border-2 border-[#191914] bg-[#e9dfcd] shadow-[12px_12px_0_#050504]">
          <div className="grid border-b-2 border-[#191914] md:grid-cols-[minmax(0,1fr)_220px]">
            <header className="p-6 sm:p-9 lg:p-12">
              <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.18em] text-[#ba4024]"><Archive className="h-4 w-4" /> EDITORIAL RECORD / ABOUT</div>
              <h1 className="mt-7 max-w-3xl font-serif text-4xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl">关于这座<br />没有围墙的校园</h1>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-[#5e594f] sm:text-base">这里保存通知、争论、失物、照片与偶尔不肯署名的心事。论坛没有替任何人发言，它只负责把散落在一天里的声音装订起来。</p>
            </header>
            <aside className="flex flex-col justify-between border-t-2 border-[#191914] bg-[#d9ef61] p-6 md:border-l-2 md:border-t-0">
              <div>
                <p className="font-mono text-[8px] font-bold tracking-[0.16em]">CATALOG CARD</p>
                <dl className="mt-5 space-y-3 border-t border-[#191914]/30 pt-4 font-mono text-[9px]">
                  <div className="flex justify-between"><dt>卷宗</dt><dd>017-A</dd></div>
                  <div className="flex justify-between"><dt>状态</dt><dd>未完全编目</dd></div>
                  <div className="flex justify-between"><dt>PAGES</dt><dd>08</dd></div>
                  <div className="flex justify-between"><dt>BINDING</dt><dd>ODD / ASC</dd></div>
                </dl>
              </div>
              <p className="mt-10 rotate-[-2deg] border-2 border-[#191914] px-3 py-2 text-center font-serif text-lg font-bold">内部传阅</p>
            </aside>
          </div>

          <section className="grid border-b-2 border-[#191914] lg:grid-cols-[210px_minmax(0,1fr)]">
            <div className="border-b-2 border-[#191914] bg-[#f3c84b] p-6 lg:border-b-0 lg:border-r-2">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em]">01 / LOOSE PAGES</p>
              <p className="mt-12 font-mono text-[8px] leading-6 text-[#6d603e]">COLLATION PENDING<br />REF. 017-A</p>
            </div>
            <div className={cn("p-6 sm:p-9", fault === "archive" && "easter-fault")}>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {Array.from({ length: 8 }, (_, index) => index + 1).map((page) => {
                  const selected = markedPages.includes(page)
                  return (
                    <button key={page} type="button" disabled={stage > 0} onClick={() => chooseArchivePage(page)} aria-label={`档案页 ${String(page).padStart(2, "0")}`} className={cn("relative aspect-[3/4] border border-[#191914] bg-[#f7efdf] font-mono text-xs font-bold transition-all hover:-translate-y-1 hover:bg-[#fffaf0] disabled:cursor-default", selected && "-rotate-2 bg-[#ffb4aa] shadow-[3px_3px_0_#191914]")}>
                      <span className="absolute left-2 top-2 text-[7px] text-[#191914]/35">P.</span>{String(page).padStart(2, "0")}
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 flex justify-between font-mono text-[8px] tracking-[0.12em] text-[#746e63]"><span>COLLATION / {String(stage > 0 ? 4 : archiveIndex).padStart(2, "0")}</span><span>HANDLE WITH DRY HANDS</span></div>
            </div>
          </section>

          {stage >= 1 && stage < 6 && (
            <section className="easter-reveal p-6 sm:p-9">
              <div className="mx-auto max-w-lg rotate-[-1deg] border-2 border-dashed border-[#191914] bg-[#fffaf0] p-5 shadow-[5px_5px_0_rgba(25,25,20,0.18)]">
                <div className="flex items-start justify-between gap-6 border-b border-[#191914]/25 pb-4">
                  <div><p className="font-mono text-[8px] font-bold tracking-[0.16em]">TRANSFER RECEIPT</p><p className="mt-2 font-serif text-3xl font-bold">LF–07</p></div>
                  <Search className="h-7 w-7 text-[#ba4024]" />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-3 font-mono text-[9px]">
                  <dt className="text-[#7a7469]">PROPERTY</dt><dd className="text-right">UNCLAIMED</dd>
                  <dt className="text-[#7a7469]">DESK</dt><dd className="text-right">CAMPUS / 07</dd>
                  <dt className="text-[#7a7469]">STATUS</dt><dd className="text-right">TRANSFERRED</dd>
                </dl>
              </div>
            </section>
          )}

          {stage >= 6 && (
            <section className="easter-reveal grid lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="border-b-2 border-[#191914] bg-[#b9ddbd] p-6 lg:border-b-0 lg:border-r-2">
                <p className="font-mono text-[9px] font-bold tracking-[0.16em]">INDEX / 017-A</p>
                <div className="mt-6 border-y border-[#191914]/25 py-5"><p className="font-mono text-xs font-bold leading-8">12 · 35 · 51 · 24<br />43 · 15 · 32 · 44</p></div>
                <p className="mt-8 font-mono text-[8px] leading-6 text-[#4f6253]">R / C<br />NO OMISSIONS</p>
              </aside>
              <div className={cn("p-6 sm:p-9", fault === "grid" && "easter-fault")}>
                <div className="mx-auto grid max-w-xl grid-cols-[22px_repeat(5,minmax(0,1fr))] gap-1.5">
                  <span />
                  {[1, 2, 3, 4, 5].map((column) => <span key={column} className="pb-1 text-center font-mono text-[8px] text-[#746e63]">{column}</span>)}
                  {characterGrid.map((row, rowIndex) => [
                    <span key={`row-${rowIndex}`} className="flex items-center font-mono text-[8px] text-[#746e63]">{rowIndex + 1}</span>,
                    ...row.map((character, columnIndex) => {
                      const coordinate = `${rowIndex + 1}${columnIndex + 1}`
                      const selected = coordinateSequence.slice(0, coordinateIndex).includes(coordinate) || stage > 6 && coordinateSequence.includes(coordinate)
                      return <button key={coordinate} type="button" disabled={stage > 6} onClick={() => chooseCoordinate(rowIndex, columnIndex)} aria-label={`${rowIndex + 1}-${columnIndex + 1}`} className={cn("aspect-square border border-[#191914] bg-[#f7efdf] font-serif text-lg font-bold transition-all hover:bg-[#d9ef61] disabled:cursor-default sm:text-2xl", selected && "bg-[#ff6b43] shadow-[2px_2px_0_#191914]")}>{character}</button>
                    }),
                  ])}
                </div>
                {stage === 6 && <p className="mx-auto mt-5 max-w-xl font-mono text-[8px] tracking-[0.12em] text-[#746e63]">TRANSCRIPT / {String(coordinateIndex).padStart(2, "0")}</p>}
              </div>
            </section>
          )}

          {stage >= 7 && (
            <section className="easter-reveal border-t-2 border-[#191914] bg-[#f3c84b] p-6 sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
                <div className="flex h-20 w-20 items-center justify-center border-2 border-[#191914] bg-[#191914] text-[#d9ef61] shadow-[5px_5px_0_#ff6b43]"><Fingerprint className="h-9 w-9" /></div>
                <div><p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#9d351f]">FINAL TRANSCRIPT / VERIFIED</p><p className="mt-3 font-serif text-3xl font-bold tracking-[0.08em] sm:text-4xl">{passphrase}</p><p className="mt-4 max-w-2xl text-sm leading-7 text-[#5e5338]">向微信「论坛小助手」发送这句完整口令。它会把关于站长的那一页档案交给你。</p></div>
                <button type="button" onClick={copyPassphrase} className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-5 text-xs font-bold shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "已复制" : "抄下口令"}</button>
              </div>
            </section>
          )}
        </article>

        <div className="mt-7 flex items-center justify-between font-mono text-[8px] font-bold tracking-[0.13em] text-[#f5f0e5]/25">
          <span>END OF AVAILABLE RECORD</span>
          {stage > 0 && <button type="button" onClick={resetArchive} className="inline-flex items-center gap-1.5 transition-colors hover:text-[#f5f0e5]/65"><RotateCcw className="h-3 w-3" /> 重新归档</button>}
        </div>
      </main>
    </div>
  )
}
