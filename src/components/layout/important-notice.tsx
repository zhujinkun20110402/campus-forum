"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { Megaphone, ShieldCheck } from "lucide-react"

/** 公告版本：内容若有更新，改这个 key 即可让所有人重新阅读一次。 */
const NOTICE_KEY = "campus-important-notice-v1"
/** 按钮倒计时秒数：倒计时结束后才能点击“我已阅读并同意”。 */
const COUNTDOWN_SECONDS = 10

const FORBIDDEN_ITEMS = [
  "反对宪法所确定的基本原则的",
  "危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的",
  "损害国家荣誉和利益的",
  "歪曲、丑化、否定中国共产党历史、中华人民共和国历史、人民军队历史，诋毁英雄模范的",
  "煽动民族仇恨、民族歧视，破坏民族团结的",
  "破坏国家宗教政策，宣扬邪教和封建迷信的",
  "编造、散布政治谣言，扰乱社会秩序，破坏社会稳定的",
  "煽动非法集会、结社、游行、示威，组织、串联非法活动的",
  "宣扬恐怖主义、极端主义，传播暴力恐怖音视频、图文资料的",
  "侮辱、诽谤或者以其他方式攻击党和国家领导人、政府机关、司法机构的",
  "捏造事实、恶意炒作敏感事件，干扰国家机关正常工作的",
  "其他违反法律法规、危害国家安全和社会稳定的涉政内容",
]

const CHINESE_NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

/** 点击“我已阅读并同意”一次后，本设备不再弹出（localStorage 永久记忆）。 */
function getSnapshot() {
  try {
    return localStorage.getItem(NOTICE_KEY) === "1"
  } catch {
    return false
  }
}

function getServerSnapshot() {
  return true
}

export function ImportantNotice() {
  const acknowledged = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [dismissed, setDismissed] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (acknowledged || dismissed) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    contentRef.current?.focus()

    const timer = window.setInterval(() => {
      setCountdown((value) => (value > 0 ? value - 1 : 0))
    }, 1000)

    return () => {
      window.clearInterval(timer)
      document.body.style.overflow = previous
    }
  }, [acknowledged, dismissed])

  if (acknowledged || dismissed) return null

  function handleAcknowledge() {
    if (countdown > 0) return
    setDismissed(true)
    try {
      localStorage.setItem(NOTICE_KEY, "1")
    } catch {
      // 存储不可用时仅本次关闭
    }
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="important-notice-title"
    >
      <div aria-hidden className="absolute inset-0 bg-[#191914]/70 backdrop-blur-sm" />

      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden border-2 border-[#191914] bg-[#fffaf0] text-[#191914] shadow-[8px_8px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[8px_8px_0_#f5f0e5]">
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#191914] bg-[#191914] px-4 py-3 text-[#f5f0e5] dark:border-[#f5f0e5] sm:px-6">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.16em] text-[#d9ef61]">
            <Megaphone className="h-4 w-4" aria-hidden /> IMPORTANT NOTICE · 重要公告
          </span>
          <span className="shrink-0 font-mono text-[9px] font-bold tracking-[0.12em] text-[#ff8a68]">请务必阅读</span>
        </div>

        <div ref={contentRef} tabIndex={-1} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 outline-none sm:px-7 sm:py-6">
          <h1 id="important-notice-title" className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            致各位同学：
          </h1>

          <div className="mt-4 space-y-4 text-sm leading-7 text-[#3d3b34] dark:text-[#d8d3c8] sm:text-[15px]">
            <p>
              本站并非北京市第二中学经开区学校官方论坛，与该学校没有任何隶属关系。考虑到网站使用学校相关资产（校徽、校名等）可能存在法律风险，且容易对大家造成误导，我们做出以下决定：
            </p>

            <ol className="list-decimal space-y-2 pl-5 font-medium text-[#191914] dark:text-[#f5f0e5]">
              <li>放弃使用学校有关资产。替换校徽等素材。删除学校电话、邮箱等联系方式。</li>
              <li>论坛将更改名称。现向各位同学征集名称意见，可以在相关公告帖发表你的意见。</li>
              <li>关闭校园相册功能。校园相册使用学校公众号图片资源，为规避版权问题，校园相册将于近日关闭，还请谅解。</li>
              <li>
                任何在论坛发表的内容将经过审查。根据《中华人民共和国网络安全法》《互联网信息服务管理办法》《网络信息内容生态治理规定》等相关法律法规，本论坛鼓励合理合法的政治讨论，但坚决禁止任何用户发布危险涉政内容。
              </li>
            </ol>

            <p className="font-medium text-[#191914] dark:text-[#f5f0e5]">包括：</p>

            <ul className="space-y-1.5">
              {FORBIDDEN_ITEMS.map((item, index) => (
                <li key={item} className="flex gap-2">
                  <span className="shrink-0 font-mono text-[11px] font-bold leading-7 text-[#e4532f]">
                    （{CHINESE_NUMERALS[index]}）
                  </span>
                  <span>{item}；</span>
                </li>
              ))}
            </ul>

            <p className="border-l-4 border-[#d44120] bg-[#ffb4aa]/25 px-3 py-2 font-bold text-[#b52f1e] dark:border-[#ff8a68] dark:text-[#ff8a68]">
              违规帖子将做删除处理。相关用户可能遭到永久封禁，必要时，追究法律责任。
            </p>

            <p>谢谢您的配合。一个良好的论坛环境，由我们共同构建。</p>
          </div>
        </div>

        <div className="border-t-2 border-[#191914] bg-[#ece6da] px-4 py-4 dark:border-[#f5f0e5] dark:bg-[#171713] sm:px-6">
          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={countdown > 0}
            className="inline-flex h-11 w-full items-center justify-center gap-2 border-2 border-[#191914] bg-[#ff6b43] text-sm font-bold text-[#191914] shadow-[3px_3px_0_#191914] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:translate-y-0 dark:border-[#f5f0e5] dark:shadow-[3px_3px_0_#f5f0e5]"
          >
            {countdown > 0 ? (
              <>
                <span className="font-mono tabular-nums">请先阅读全文 · {countdown}s</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" aria-hidden />
                我已阅读并同意
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
