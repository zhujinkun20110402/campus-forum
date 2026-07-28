"use client"

import { Loader2, Search, Send, Smile, Stamp, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useRef, useState } from "react"
import { LevelBadge } from "@/components/reputation/level-badge"
import { UserAvatar } from "@/components/user/user-avatar"
import { sendPostcard } from "@/lib/postcard-actions"
import { POSTCARD_THEMES, type PostcardTheme } from "@/lib/postcard-constants"
import { cn } from "@/lib/utils"

interface Recipient {
  id: string
  name: string | null
  image: string | null
  role: string
  raputation: number
}

export function PostcardComposer({ quota, initialRecipient }: { quota: { total: number; used: number; remaining: number }; initialRecipient: Recipient | null }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [recipient, setRecipient] = useState<Recipient | null>(initialRecipient)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Recipient[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState("")
  const [emoji, setEmoji] = useState("")
  const [theme, setTheme] = useState<PostcardTheme>(POSTCARD_THEMES[0].value)
  const [state, action, pending] = useActionState(async (_previousState: unknown, formData: FormData) => {
    const result = await sendPostcard(undefined, formData)
    if (result.success) {
      setRecipient(null)
      setQuery("")
      setResults([])
      setMessage("")
      setEmoji("")
      formRef.current?.reset()
      router.refresh()
    }
    return result
  }, undefined)

  useEffect(() => {
    if (!query.trim() || recipient) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal })
        const data = response.ok ? await response.json() as { users: Recipient[] } : { users: [] }
        setResults(data.users)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setResults([])
      } finally {
        if (!controller.signal.aborted) setSearching(false)
      }
    }, 260)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query, recipient])

  const exhausted = quota.remaining <= 0

  return (
    <section className="border-2 border-[#191914] bg-[#fffaf0] p-5 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:p-6">
      <div className="flex items-start justify-between gap-4 border-b border-[#191914]/20 pb-4 dark:border-white/20">
        <div><p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#e4532f]">POSTCARD DESK</p><h2 className="mt-2 font-serif text-xl font-bold">写一封七日短笺</h2></div>
        <Stamp className="h-5 w-5 text-[#e4532f]" />
      </div>

      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(42px,1fr))] gap-1">
        {Array.from({ length: quota.total }).map((_, index) => <span key={index} className={cn("h-2 border border-[#191914] dark:border-[#f5f0e5]", index < quota.used ? "bg-[#e5ded1]" : "bg-[#d9ef61]")} />)}
      </div>
      <p className="mt-2 font-mono text-[8px] font-bold tracking-[0.1em] text-[#777268] dark:text-[#989389]">MONTHLY QUOTA · {quota.remaining} / {quota.total} AVAILABLE</p>

      <form ref={formRef} action={action} className="mt-5">
        <input type="hidden" name="recipientId" value={recipient?.id ?? ""} />
        <input type="hidden" name="theme" value={theme} />

        <div className="relative">
          <p className="mb-2 font-mono text-[8px] font-bold tracking-[0.13em] text-[#777268] dark:text-[#989389]">RECIPIENT</p>
          {recipient ? (
            <div className="flex h-14 items-center gap-3 border-2 border-[#191914] bg-[#ece6da] px-3 dark:border-[#f5f0e5] dark:bg-[#11110f]">
              <UserAvatar name={recipient.name} image={recipient.image} role={recipient.role} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{recipient.name ?? "校园成员"}</span>
              <LevelBadge raputation={recipient.raputation} role={recipient.role} size="xs" showTitle={false} />
              <button type="button" onClick={() => { setRecipient(null); setQuery(""); setResults([]); setSearching(false) }} aria-label="更换收件人" className="flex h-8 w-8 items-center justify-center hover:bg-[#ffb4aa]"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e4532f]" />
              <input
                type="search"
                value={query}
                disabled={exhausted}
                onChange={(event) => {
                  const value = event.target.value
                  setQuery(value)
                  setResults([])
                  setSearching(Boolean(value.trim()))
                }}
                placeholder="搜索昵称选择收件人"
                className="h-12 w-full border-2 border-[#191914] bg-[#ece6da] pl-10 pr-10 text-sm outline-none focus:shadow-[3px_3px_0_#ff6b43] disabled:cursor-not-allowed disabled:opacity-55 dark:border-[#f5f0e5] dark:bg-[#11110f]"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#777268]" />}
            </div>
          )}

          {!recipient && query.trim() && !searching && (
            <div className="absolute inset-x-0 top-full z-20 border-x-2 border-b-2 border-[#191914] bg-[#fffaf0] shadow-[4px_4px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[4px_4px_0_#f5f0e5]">
              {results.length ? results.map((user) => (
                <button key={user.id} type="button" onClick={() => { setRecipient(user); setQuery(""); setResults([]); setSearching(false) }} className="flex w-full items-center gap-3 border-b border-[#191914]/15 px-3 py-3 text-left last:border-b-0 hover:bg-[#d9ef61] hover:text-[#191914] dark:border-white/15">
                  <UserAvatar name={user.name} image={user.image} role={user.role} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold">{user.name ?? "校园成员"}</span>
                  <LevelBadge raputation={user.raputation} role={user.role} size="xs" showTitle={false} />
                </button>
              )) : <p className="px-3 py-4 text-xs text-[#777268] dark:text-[#989389]">没有找到匹配的成员</p>}
            </div>
          )}
        </div>

        <div className="mt-5">
          <p className="mb-2 font-mono text-[8px] font-bold tracking-[0.13em] text-[#777268] dark:text-[#989389]">PAPER STOCK</p>
          <div className="grid grid-cols-2 gap-2">
            {POSTCARD_THEMES.map((item) => (
              <button key={item.value} type="button" aria-pressed={theme === item.value} onClick={() => setTheme(item.value)} className={cn("relative min-h-14 overflow-hidden border px-3 py-2 text-left text-[#191914]", item.surface, item.value === "NIGHT" && "text-[#f5f0e5]", theme === item.value ? "border-[#191914] shadow-[2px_2px_0_#191914] dark:border-[#f5f0e5]" : "border-[#191914]/35")}>
                <span className={cn("absolute inset-y-0 left-0 w-1", item.accent)} />
                <span className="block text-[10px] font-bold">{item.label}</span><span className="mt-1 block font-mono text-[7px] tracking-[0.08em] opacity-60">{item.english}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_84px]">
          <label className="relative block">
            <span className="sr-only">明信片正文</span>
            <textarea name="message" required maxLength={500} rows={6} value={message} onChange={(event) => setMessage(event.target.value)} disabled={exhausted} placeholder="写下只属于这七天的话……" className="w-full resize-none border-2 border-[#191914] bg-[#ece6da] p-4 pb-8 text-sm leading-7 outline-none focus:shadow-[3px_3px_0_#ff6b43] disabled:cursor-not-allowed disabled:opacity-55 dark:border-[#f5f0e5] dark:bg-[#11110f]" />
            <span className="absolute bottom-2.5 right-3 font-mono text-[8px] text-[#918b80]">{message.length} / 500</span>
          </label>
          <label className="block">
            <span className="mb-2 flex items-center justify-center gap-1 font-mono text-[7px] font-bold text-[#777268] dark:text-[#989389]"><Smile className="h-3 w-3" />STAMP</span>
            <input name="emoji" value={emoji} maxLength={16} onChange={(event) => setEmoji(event.target.value)} disabled={exhausted} placeholder="✉️" className="h-14 w-full border-2 border-[#191914] bg-[#ece6da] px-2 text-center text-xl outline-none focus:shadow-[2px_2px_0_#ff6b43] dark:border-[#f5f0e5] dark:bg-[#11110f]" />
          </label>
        </div>

        <button type="submit" disabled={pending || exhausted || !recipient || !message.trim()} className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] px-5 text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] disabled:cursor-not-allowed disabled:bg-[#e5ded1] disabled:text-[#777268] disabled:shadow-none dark:border-[#f5f0e5]">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {exhausted ? "本月额度已用完" : "盖章并寄出"}
        </button>
        <p className={cn("mt-3 min-h-5 text-xs", state?.success ? "text-[#60751d] dark:text-[#d9ef61]" : "text-[#b52f1e] dark:text-[#ff8a68]")} role="status">{state?.message}</p>
      </form>
    </section>
  )
}
