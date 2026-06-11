"use client"

import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { useState } from "react"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  LogOut,
  Settings,
  User,
  PenLine,
  Menu,
  X,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

function useSession() {
  return { user: null as { id: string; name: string; image?: string; role?: string } | null }
}

const navLinks = [
  { href: "/category/announcement", label: "公告" },
  { href: "/category/lostfound", label: "寻物" },
  { href: "/confession", label: "表白墙" },
  { href: "/category/study", label: "学习" },
  { href: "/category/activity", label: "活动" },
]

export function Header() {
  const { scrollDirection, scrollY } = useScrollDirection()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useSession()
  const isScrolled = scrollY > 20
  const isHidden = scrollDirection === "down" && scrollY > 100

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isHidden ? "-translate-y-full" : "translate-y-0",
          isScrolled
            ? "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#e7e5e4]/60 dark:border-[#1c1c1c]/60"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-[#1c1917] dark:bg-[#d4af37]/10 border border-[#e7e5e4] dark:border-[#d4af37]/20 shadow-sm transition-shadow">
                <SafeImage
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-1.5"
                  fallback="二"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-[#1c1917] dark:text-[#e8e6e3] tracking-wide">
                  北京二中经开区学校
                </span>
                <span className="hidden lg:inline text-xs text-[#a8a29e] dark:text-[#525252] ml-2">
                  校园论坛
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-sm text-[#57534e] dark:text-[#a3a3a3] rounded-lg transition-all hover:text-[#1c1917] dark:hover:text-[#e8e6e3] hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c] group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-3 right-3 h-px bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <Link href="/search">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-[#78716c] dark:text-[#737373] hover:text-[#1c1917] dark:hover:text-[#e8e6e3] hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c]"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {user ? (
                <>
                  <Link href="/post/new" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="h-9 gap-1.5 bg-[#1c1917] hover:bg-[#292524] dark:bg-[#d4af37] dark:hover:bg-[#e6c65c] text-white dark:text-[#0a0a0a] rounded-full px-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      <span>发帖</span>
                    </Button>
                  </Link>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 text-[#57534e] dark:text-[#a3a3a3] hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c]"
                    >
                      <div className="h-7 w-7 rounded-full bg-[#f5f5f4] dark:bg-[#262626] flex items-center justify-center text-xs font-medium text-[#57534e] dark:text-[#a3a3a3]">
                        {user.name?.charAt(0) ?? "?"}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-[#e7e5e4] dark:border-[#262626] bg-white/95 dark:bg-[#141414]/95 backdrop-blur-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                      <div className="py-1.5">
                        <div className="px-4 py-2.5 border-b border-[#f5f5f4] dark:border-[#262626] mb-1">
                          <p className="text-sm font-medium text-[#1c1917] dark:text-[#e8e6e3] truncate">
                            {user.name ?? "用户"}
                          </p>
                          <p className="text-xs text-[#a8a29e] dark:text-[#525252] mt-0.5">
                            {user.role === "ADMIN" ? "管理员" : "学生"}
                          </p>
                        </div>
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#57534e] dark:text-[#a3a3a3] hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c] transition-colors"
                        >
                          <User className="h-4 w-4" />
                          我的主页
                        </Link>
                        <Link
                          href="/profile/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#57534e] dark:text-[#a3a3a3] hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c] transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          账号设置
                        </Link>
                        <button
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#78716c] dark:text-[#737373] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors border-t border-[#f5f5f4] dark:border-[#262626] mt-1"
                        >
                          <LogOut className="h-4 w-4" />
                          退出登录
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button
                    size="sm"
                    className="h-9 bg-[#1c1917] hover:bg-[#292524] dark:bg-[#d4af37] dark:hover:bg-[#e6c65c] text-white dark:text-[#0a0a0a] rounded-full px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    登录
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-[#57534e] dark:text-[#a3a3a3]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-b border-[#e7e5e4] dark:border-[#1c1c1c] shadow-xl animate-fade-in-up">
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base text-[#57534e] dark:text-[#a3a3a3] rounded-lg hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-[#f5f5f4] dark:border-[#1c1c1c]">
                <Link
                  href="/post/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-base text-[#d4af37] rounded-lg hover:bg-[#f5f5f4] dark:hover:bg-[#1c1c1c] transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  发布新帖
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
