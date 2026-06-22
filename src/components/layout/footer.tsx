"use client"

import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { MottoStream } from "@/components/effects/motto-stream"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react"

const footerLinks = [
  {
    title: "版块",
    links: [
      { href: "/category/announcement", label: "校园公告" },
      { href: "/category/lostfound", label: "失物招领" },
      { href: "/category/study", label: "学习交流" },
      { href: "/confession", label: "表白墙" },
      { href: "/category/activity", label: "校园活动" },
    ],
  },
  {
    title: "关于",
    links: [
      { href: "#", label: "学校简介" },
      { href: "#", label: "使用条款" },
      { href: "#", label: "隐私政策" },
      { href: "#", label: "联系我们" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative bg-[#0a0a0a] text-[#a3a3a3] overflow-hidden">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Motto Section */}
        <ScrollReveal>
          <div className="py-16 sm:py-20 text-center border-b border-[#1c1c1c]">
            <div className="flex justify-center mb-6">
              <div className="relative h-16 w-16 rounded-2xl bg-[#141414] border border-[#262626] shadow-lg overflow-hidden">
                <SafeImage
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-2"
                />
              </div>
            </div>
            <MottoStream size="md" className="mb-4" />
            <p className="text-sm text-[#525252] max-w-md mx-auto leading-relaxed">
              北京二中经开区学校秉承&ldquo;本固枝盛，学富国强&rdquo;的校训，
              致力于培养德智体美劳全面发展的社会主义建设者和接班人。
            </p>
          </div>
        </ScrollReveal>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-6 w-6 text-[#d4af37]" />
              <span className="text-lg font-serif font-semibold text-[#e8e6e3]">
                北京二中经开区学校论坛
              </span>
            </div>
            <p className="text-sm text-[#525252] leading-relaxed mb-6 max-w-sm">
              为师生搭建自由的线上社区平台，
              连接每一个校园故事，共建温暖校园。
            </p>
            <div className="space-y-2 text-sm text-[#525252]">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d4af37]/70" />
                <span>北京市经济技术开发区</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#d4af37]/70" />
                <span>EZJKXSH@outlook.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#d4af37]/70" />
                <span>010-6780-2277</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-[#e8e6e3] mb-4 tracking-wide">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#525252] hover:text-[#d4af37] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#1c1c1c] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#404040]">
            &copy; {new Date().getFullYear()} 北京二中经开区学校 · 校园论坛
          </p>
          <p className="text-xs text-[#404040]">
            本固枝盛，学富国强
          </p>
        </div>
      </div>
    </footer>
  )
}
