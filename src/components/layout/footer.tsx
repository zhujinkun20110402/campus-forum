"use client"

import Link from "next/link"
import Image from "next/image"
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
    <footer className="relative bg-indigo-950 text-slate-300 overflow-hidden">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-indigo-600 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold-500 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Motto Section */}
        <ScrollReveal>
          <div className="py-16 sm:py-20 text-center border-b border-indigo-800/50">
            <div className="flex justify-center mb-6">
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-800 to-indigo-900 border border-indigo-700/50 shadow-lg shadow-indigo-900/50 overflow-hidden">
                <Image
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-2"
                  onError={(e) => {
                    const target = e.target as HTMLElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = '<span class="flex h-full w-full items-center justify-center text-lg font-bold text-gold-400">二</span>'
                    }
                  }}
                />
              </div>
            </div>
            <MottoStream size="md" className="mb-4" />
            <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              北京二中经开区学校秉承"本固枝盛，学富国强"的校训，
              致力于培养德智体美劳全面发展的社会主义建设者和接班人。
            </p>
          </div>
        </ScrollReveal>

        {/* Links Grid */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <GraduationCap className="h-6 w-6 text-gold-400" />
              <span className="text-lg font-serif font-semibold text-white">
                北京二中经开区学校论坛
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-sm">
              为师生搭建学习交流、失物招领、校园公告、匿名表白的线上社区平台，
              连接每一个校园故事，共建温暖校园。
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-400/70" />
                <span>北京市经济技术开发区</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold-400/70" />
                <span>contact@bje2school.cn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold-400/70" />
                <span>010-XXXXXXXX</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">
                {group.title}
              </h3>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-gold-400 transition-colors duration-200"
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
        <div className="py-6 border-t border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} 北京二中经开区学校 · 校园论坛
          </p>
          <p className="text-xs text-slate-600">
            本固枝盛，学富国强
          </p>
        </div>
      </div>
    </footer>
  )
}
