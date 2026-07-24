"use client"

import Link from "next/link"
import {
  Archive,
  ArrowLeft,
  Check,
  Copy,
  Fingerprint,
  Radio,
  RotateCcw,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { SafeImage } from "@/components/ui/safe-image"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "campus-about-archive-v1"
const archiveSequence = [1, 3, 5, 7]
const signalSequence = [2, 4, 1, 6, 3, 5]
const coordinateSequence = ["12", "35", "51", "24", "43", "15", "32", "44"]
const characterGrid = [
  ["春", "银", "纸", "北", "七"],
  ["灯", "风", "页", "在", "声"],
  ["桥", "号", "墨", "雨", "杏"],
  ["角", "旧", "十", "窗", "铃"],
  ["落", "影", "校", "夜", "书"],
]

function getCharacter(coordinate: string) {
  const row = Number(coordinate[0]) - 1
  const column = Number(coordinate[1]) - 1
  return characterGrid[row]?.[column] ?? ""
}

export function AboutArchive() {
  const [phase, setPhase] = useState(0)
  const [archiveIndex, setArchiveIndex] = useState(0)
  const [sealHits, setSealHits] = useState(0)
  const [signalIndex, setSignalIndex] = useState(0)
  const [coordinateIndex, setCoordinateIndex] = useState(0)
  const [fault, setFault] = useState<"archive" | "signal" | "grid" | null>(null)
  const [copied, setCopied] = useState(false)

  const passphrase = useMemo(
    () => coordinateSequence.map(getCharacter).join(""),
    []
  )

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = Number(window.localStorage.getItem(STORAGE_KEY))
      if (Number.isInteger(saved) && saved >= 0 && saved <= 4) setPhase(saved)
    }, 0)
    return () => window.clearTimeout(restore)
  }, [])

  function savePhase(nextPhase: number) {
    setPhase(nextPhase)
    window.localStorage.setItem(STORAGE_KEY, String(nextPhase))
  }

  function showFault(section: "archive" | "signal" | "grid") {
    setFault(section)
    window.setTimeout(() => setFault((current) => current === section ? null : current), 620)
  }

  function chooseArchivePage(page: number) {
    if (phase > 0) return
    if (page === archiveSequence[archiveIndex]) {
      const nextIndex = archiveIndex + 1
      setArchiveIndex(nextIndex)
      if (nextIndex === archiveSequence.length) savePhase(1)
      return
    }
    setArchiveIndex(0)
    showFault("archive")
  }

  function strikeSeal() {
    if (phase !== 1) return
    const nextHits = sealHits + 1
    setSealHits(nextHits)
    if (nextHits === 3) savePhase(2)
  }

  function pressSignal(value: number) {
    if (phase !== 2) return
    if (value === signalSequence[signalIndex]) {
      const nextIndex = signalIndex + 1
      setSignalIndex(nextIndex)
      if (nextIndex === signalSequence.length) savePhase(3)
      return
    }
    setSignalIndex(0)
    showFault("signal")
  }

  function chooseCoordinate(row: number, column: number) {
    if (phase !== 3) return
    const coordinate = `${row + 1}${column + 1}`
    if (coordinate === coordinateSequence[coordinateIndex]) {
      const nextIndex = coordinateIndex + 1
      setCoordinateIndex(nextIndex)
      if (nextIndex === coordinateSequence.length) savePhase(4)
      return
    }
    setCoordinateIndex(0)
    showFault("grid")
  }

  function resetArchive() {
    setPhase(0)
    setArchiveIndex(0)
    setSealHits(0)
    setSignalIndex(0)
    setCoordinateIndex(0)
    setFault(null)
    setCopied(false)
    window.localStorage.removeItem(STORAGE_KEY)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function copyPassphrase() {
    await navigator.clipboard.writeText(passphrase)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#171713] pt-24 text-[#191914] sm:pt-28">
      <div aria-hidden className="pointer-events-none fixed inset-0 opacity-[0.055] [background-image:repeating-linear-gradient(0deg,transparent,transparent_3px,#fff_4px)]" />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between font-mono text-[9px] font-bold tracking-[0.16em] text-[#f5f0e5]/35">
          <Link href="/" className="inline-flex items-center gap-2 transition-colors hover:text-[#f5f0e5]">
            <ArrowLeft className="h-3.5 w-3.5" /> RETURN TO FORUM
          </Link>
          <span>ARCHIVE ACCESS / 017</span>
        </div>

        <article className="easter-paper relative border-2 border-[#191914] bg-[#e9dfcd] shadow-[12px_12px_0_#050504]">
          <div className="grid border-b-2 border-[#191914] md:grid-cols-[minmax(0,1fr)_220px]">
            <header className="p-6 sm:p-9 lg:p-12">
              <div className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.18em] text-[#ba4024]">
                <Archive className="h-4 w-4" /> EDITORIAL RECORD / ABOUT
              </div>
              <h1 className="mt-7 max-w-3xl font-serif text-4xl font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
                关于这座<br />没有围墙的校园
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-8 text-[#5e594f] sm:text-base">
                这里保存通知、争论、失物、照片与偶尔不肯署名的心事。论坛没有替任何人发言，
                它只负责把散落在一天里的声音装订起来。
              </p>
            </header>

            <aside className="flex flex-col justify-between border-t-2 border-[#191914] bg-[#d9ef61] p-6 md:border-l-2 md:border-t-0">
              <div>
                <p className="font-mono text-[8px] font-bold tracking-[0.16em]">CATALOG CARD</p>
                <dl className="mt-5 space-y-3 border-t border-[#191914]/30 pt-4 font-mono text-[9px]">
                  <div className="flex justify-between"><dt>卷宗</dt><dd>017-A</dd></div>
                  <div className="flex justify-between"><dt>状态</dt><dd>未完全编目</dd></div>
                  <div className="flex justify-between"><dt>页数</dt><dd>08</dd></div>
                  <div className="flex justify-between"><dt>装订</dt><dd>ODD / ASC</dd></div>
                </dl>
              </div>
              <p className="mt-10 rotate-[-2deg] border-2 border-[#191914] px-3 py-2 text-center font-serif text-lg font-bold">内部传阅</p>
            </aside>
          </div>

          <section className="grid border-b-2 border-[#191914] lg:grid-cols-[240px_minmax(0,1fr)]">
            <div className="border-b-2 border-[#191914] bg-[#f3c84b] p-6 lg:border-b-0 lg:border-r-2">
              <p className="font-mono text-[9px] font-bold tracking-[0.16em]">01 / LOOSE PAGES</p>
              <p className="mt-5 font-serif text-lg font-bold leading-7">
                褪色页不作数，<br />奇数页仍有铅笔温度。
              </p>
              <p className="mt-3 text-xs leading-6 text-[#665c40]">从 01 向后。装订员不喜欢回头。</p>
            </div>

            <div className={cn("p-6 transition-colors sm:p-9", fault === "archive" && "easter-fault")}> 
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {Array.from({ length: 8 }, (_, index) => index + 1).map((page) => {
                  const selected = archiveSequence.slice(0, archiveIndex).includes(page) || phase > 0 && archiveSequence.includes(page)
                  return (
                    <button
                      key={page}
                      type="button"
                      disabled={phase > 0}
                      onClick={() => chooseArchivePage(page)}
                      aria-label={`档案页 ${String(page).padStart(2, "0")}`}
                      className={cn(
                        "relative aspect-[3/4] border border-[#191914] bg-[#f7efdf] font-mono text-xs font-bold transition-all hover:-translate-y-1 hover:bg-[#fffaf0] disabled:cursor-default",
                        selected && "-rotate-2 bg-[#ffb4aa] shadow-[3px_3px_0_#191914]"
                      )}
                    >
                      <span className="absolute left-2 top-2 text-[7px] text-[#191914]/35">P.</span>
                      {String(page).padStart(2, "0")}
                      {selected && <span className="absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#ba4024]" />}
                    </button>
                  )
                })}
              </div>
              <div className="mt-5 flex items-center justify-between font-mono text-[8px] tracking-[0.12em] text-[#746e63]">
                <span>{phase > 0 ? "BINDING VERIFIED" : `${archiveIndex} / 4 MARKS`}</span>
                <span>HANDLE WITH DRY HANDS</span>
              </div>
            </div>
          </section>

          {phase >= 1 && (
            <section className="easter-reveal grid border-b-2 border-[#191914] lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="p-6 sm:p-9">
                <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#ba4024]">02 / MARGIN NOTE</p>
                <div className="mt-6 border-l-2 border-[#191914] pl-5 font-serif text-base leading-9 sm:text-lg">
                  <p><strong>校</strong>刊的封面从来不只是装饰。</p>
                  <p><strong>徽</strong>墨干透以后，仍会记得敲击。</p>
                  <p><strong>三</strong>声短促回响，足够叫醒纸背。</p>
                  <p><strong>次</strong>序不必改变，只需落在同一处。</p>
                </div>
                <p className="mt-5 font-mono text-[8px] tracking-[0.13em] text-[#857e72]">校对批注：有些句子应从最靠左的一列读。</p>
              </div>

              <div className="flex items-center justify-center border-t-2 border-[#191914] bg-[#ff6b43] p-9 lg:border-l-2 lg:border-t-0">
                <button
                  type="button"
                  disabled={phase > 1}
                  onClick={strikeSeal}
                  aria-label="档案校徽印章"
                  className={cn(
                    "group relative flex h-40 w-40 items-center justify-center rounded-full border-2 border-[#191914] bg-[#e9dfcd] shadow-[6px_6px_0_#191914] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-default",
                    sealHits > 0 && phase === 1 && "easter-seal-pulse"
                  )}
                >
                  <span className="absolute inset-2 rounded-full border border-dashed border-[#191914]" />
                  <div className="relative h-24 w-24">
                    <SafeImage src="/images/school-logo.png" alt="北京二中经开区学校校徽" fill sizes="96px" className="object-contain p-1" />
                  </div>
                  <span className="absolute -bottom-8 font-mono text-[8px] font-bold tracking-[0.18em] text-[#191914]/45">
                    {phase > 1 ? "SEAL OPEN" : `${sealHits} / 3`}
                  </span>
                </button>
              </div>
            </section>
          )}

          {phase >= 2 && (
            <section className="easter-reveal border-b-2 border-[#191914] bg-[#191914] p-6 text-[#f5f0e5] sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.16em] text-[#d9ef61]"><Radio className="h-4 w-4" />03 / NIGHT SIGNAL</p>
                  <h2 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">熄灯后的广播值班表</h2>
                </div>
                <p className="max-w-sm text-xs leading-6 text-white/45">短铃作点，长铃作划。斜线隔开每一位数字，值班员只使用一至六号频道。</p>
              </div>

              <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className={cn("border border-white/30 bg-[#22221d] p-5 sm:p-7", fault === "signal" && "easter-fault-dark")}>
                  <p className="break-words font-mono text-lg font-bold tracking-[0.2em] text-[#f3c84b] sm:text-2xl sm:tracking-[0.28em]">
                    ..--- / ....- / .---- / -.... / ...-- / .....
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {Array.from({ length: 6 }, (_, index) => index + 1).map((value) => (
                      <button
                        key={value}
                        type="button"
                        disabled={phase > 2}
                        onClick={() => pressSignal(value)}
                        className={cn(
                          "h-14 border border-white/30 bg-[#11110f] font-mono text-sm font-bold transition-colors hover:border-[#d9ef61] hover:text-[#d9ef61] disabled:cursor-default",
                          (signalSequence.slice(0, signalIndex).includes(value) || phase > 2) && "border-[#f3c84b] bg-[#f3c84b] text-[#191914]"
                        )}
                      >
                        CH {value}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 font-mono text-[8px] tracking-[0.14em] text-white/30">RECEIVED {phase > 2 ? "06" : String(signalIndex).padStart(2, "0")} / 06</p>
                </div>

                <aside className="border border-white/25 bg-[#e9dfcd] p-5 text-[#191914]">
                  <p className="font-mono text-[8px] font-bold tracking-[0.14em]">POCKET SIGNAL CARD</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-[#191914]/25 pt-4 font-mono text-[10px]">
                    {[".----", "..---", "...--", "....-", ".....", "-...."].map((code, index) => (
                      <div key={code} className="flex justify-between"><span>{index + 1}</span><span>{code}</span></div>
                    ))}
                  </div>
                  <p className="mt-5 text-[10px] leading-5 text-[#6d675d]">油墨磨损严重，但频道编号仍按从小到大抄录。</p>
                </aside>
              </div>
            </section>
          )}

          {phase >= 3 && (
            <section className="easter-reveal grid lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="border-b-2 border-[#191914] bg-[#b9ddbd] p-6 lg:border-b-0 lg:border-r-2">
                <p className="font-mono text-[9px] font-bold tracking-[0.16em]">04 / INDEX MATRIX</p>
                <div className="mt-6 border-y border-[#191914]/25 py-5">
                  <p className="font-mono text-xs font-bold leading-8">12 · 35 · 51 · 24<br />43 · 15 · 32 · 44</p>
                </div>
                <p className="mt-5 text-xs leading-6 text-[#4f6253]">先找书架的层数，再找该层从左至右的位置。抄录时不能跳格。</p>
              </aside>

              <div className={cn("p-6 sm:p-9", fault === "grid" && "easter-fault")}> 
                <div className="mx-auto grid max-w-xl grid-cols-[22px_repeat(5,minmax(0,1fr))] gap-1.5">
                  <span />
                  {[1, 2, 3, 4, 5].map((column) => <span key={column} className="pb-1 text-center font-mono text-[8px] text-[#746e63]">{column}</span>)}
                  {characterGrid.map((row, rowIndex) => [
                    <span key={`row-${rowIndex}`} className="flex items-center font-mono text-[8px] text-[#746e63]">{rowIndex + 1}</span>,
                    ...row.map((character, columnIndex) => {
                      const coordinate = `${rowIndex + 1}${columnIndex + 1}`
                      const selected = coordinateSequence.slice(0, coordinateIndex).includes(coordinate) || phase > 3 && coordinateSequence.includes(coordinate)
                      return (
                        <button
                          key={coordinate}
                          type="button"
                          disabled={phase > 3}
                          onClick={() => chooseCoordinate(rowIndex, columnIndex)}
                          aria-label={`第 ${rowIndex + 1} 行第 ${columnIndex + 1} 列：${character}`}
                          className={cn(
                            "aspect-square border border-[#191914] bg-[#f7efdf] font-serif text-lg font-bold transition-all hover:bg-[#d9ef61] disabled:cursor-default sm:text-2xl",
                            selected && "bg-[#ff6b43] text-[#191914] shadow-[2px_2px_0_#191914]"
                          )}
                        >
                          {character}
                        </button>
                      )
                    }),
                  ])}
                </div>

                <div className="mx-auto mt-6 flex min-h-12 max-w-xl items-center border-y border-[#191914]/25 py-3">
                  <span className="mr-4 font-mono text-[8px] font-bold tracking-[0.12em] text-[#746e63]">TRANSCRIPT</span>
                  <span className="font-serif text-xl font-bold tracking-[0.16em]">
                    {coordinateSequence.slice(0, coordinateIndex).map(getCharacter).join("")}
                    {phase === 3 && <span className="ml-1 inline-block h-5 w-px animate-pulse bg-[#191914] align-middle" />}
                  </span>
                </div>
              </div>
            </section>
          )}

          {phase >= 4 && (
            <section className="easter-reveal border-t-2 border-[#191914] bg-[#f3c84b] p-6 sm:p-10">
              <div className="grid items-center gap-8 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
                <div className="flex h-20 w-20 items-center justify-center border-2 border-[#191914] bg-[#191914] text-[#d9ef61] shadow-[5px_5px_0_#ff6b43]">
                  <Fingerprint className="h-9 w-9" />
                </div>
                <div>
                  <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#9d351f]">FINAL TRANSCRIPT / VERIFIED</p>
                  <p className="mt-3 font-serif text-3xl font-bold tracking-[0.08em] sm:text-4xl">{passphrase}</p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5e5338]">
                    向微信「论坛小助手」发送这句完整口令。它会把关于站长的那一页档案交给你。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyPassphrase}
                  className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#191914] bg-[#fffaf0] px-5 text-xs font-bold shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "已复制" : "抄下口令"}
                </button>
              </div>
            </section>
          )}
        </article>

        <div className="mt-7 flex items-center justify-between font-mono text-[8px] font-bold tracking-[0.13em] text-[#f5f0e5]/25">
          <span>END OF AVAILABLE RECORD</span>
          {phase > 0 && (
            <button type="button" onClick={resetArchive} className="inline-flex items-center gap-1.5 transition-colors hover:text-[#f5f0e5]/65">
              <RotateCcw className="h-3 w-3" /> 重新归档
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
