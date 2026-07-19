import Link from "next/link"
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"

const footerLinks = [
  {
    title: "校园版块",
    links: [
      { href: "/category/announcement", label: "校园公告" },
      { href: "/category/lostfound", label: "失物招领" },
      { href: "/category/study", label: "学习交流" },
      { href: "/confession", label: "表白墙" },
      { href: "/category/activity", label: "校园活动" },
      { href: "/category/feedback", label: "问题反馈" },
    ],
  },
  {
    title: "快速到达",
    links: [
      { href: "/search", label: "搜索帖子与成员" },
      { href: "/leaderboard", label: "声望排行榜" },
      { href: "/album", label: "校园相册" },
      { href: "/post/new", label: "发布新帖" },
      { href: "/auth/signin", label: "登录账号" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t-8 border-[#ff6b43] bg-[#11110f] text-[#f5f0e5]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
        <div className="grid gap-12 border-b border-white/20 pb-12 lg:grid-cols-[1.35fr_0.65fr_0.65fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden border-2 border-[#f5f0e5] bg-[#d9ef61]">
                <SafeImage src="/images/school-logo.png" alt="校徽" fill sizes="48px" className="object-contain p-1.5" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold">北京二中经开区学校</p>
                <p className="mt-1 font-mono text-[9px] font-bold tracking-[0.18em] text-[#ff8a68]">CAMPUS FORUM</p>
              </div>
            </div>

            <h2 className="mt-8 max-w-xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              本固枝盛，<br />
              <span className="text-[#d9ef61]">学富国强。</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/45">
              连接每一个校园故事，也让每一次认真表达都能被看见、被回应。
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="border-b border-white/20 pb-3 font-mono text-[10px] font-bold tracking-[0.16em] text-[#f3c84b]">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white">
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid gap-8 py-8 sm:grid-cols-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ff6b43]" />
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-white/30">LOCATION</p>
              <p className="mt-1 text-xs text-white/55">北京市经济技术开发区</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#d9ef61]" />
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-white/30">EMAIL</p>
              <p className="mt-1 text-xs text-white/55">EZJKXSH@outlook.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#f3c84b]" />
            <div>
              <p className="font-mono text-[9px] font-bold tracking-[0.14em] text-white/30">PHONE</p>
              <p className="mt-1 text-xs text-white/55">010-6780-2277</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/20 pt-6 font-mono text-[9px] font-bold tracking-[0.12em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} BEIJING NO.2 SCHOOL BDA CAMPUS FORUM</p>
          <p>MADE FOR EVERY CAMPUS STORY</p>
        </div>
      </div>
    </footer>
  )
}
