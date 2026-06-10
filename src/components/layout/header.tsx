"use client"

import Link from "next/link"
import Image from "next/image"
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

// 模拟用户状态，实际项目中从 session 获取
function useSession() {
  // 这是占位符，实际应使用 next-auth 的 useSession
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
            ? "bg-white/90 dark:bg-indigo-950/90 backdrop-blur-xl shadow-sm shadow-slate-200/50 dark:shadow-indigo-950/50"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-900 dark:from-indigo-600 dark:to-indigo-800 shadow-lg shadow-indigo-700/20 group-hover:shadow-indigo-700/30 transition-shadow">
                <Image
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-1.5"
                  onError={(e) => {
                    // 如果图片加载失败，显示文字 fallback
                    const target = e.target as HTMLElement
                    target.style.display = "none"
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = '<span class="flex h-full w-full items-center justify-center text-sm font-bold text-white">二</span>'
                    }
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100 tracking-wide">
                  北京二中经开区学校
                </span>
                <span className="hidden lg:inline text-xs text-slate-400 dark:text-slate-500 ml-2">
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
                  className="relative px-3 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-lg transition-all hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-3 right-3 h-px bg-gold-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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
                  className="h-9 w-9 text-slate-500 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {user ? (
                <>
                  <Link href="/post/new" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="h-9 gap-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full px-4 shadow-md shadow-indigo-700/20 hover:shadow-lg hover:shadow-indigo-700/30 hover:-translate-y-0.5 transition-all"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      <span>发帖</span>
                    </Button>
                  </Link>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50"
                    >
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-800 dark:to-indigo-700 flex items-center justify-center text-xs font-medium text-indigo-700 dark:text-indigo-200">
                        {user.name?.charAt(0) ?? "?"}
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                    </Button>
                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 dark:border-indigo-800 bg-white/95 dark:bg-indigo-900/95 backdrop-blur-xl shadow-xl shadow-slate-200/20 dark:shadow-indigo-950/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                      <div className="py-1.5">
                        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-indigo-800 mb-1">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                            {user.name ?? "用户"}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {user.role === "ADMIN" ? "管理员" : "学生"}
                          </p>
                        </div>
                        <Link
                          href={`/profile/${user.id}`}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-800/60 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          我的主页
                        </Link>
                        <Link
                          href="/profile/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-800/60 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          账号设置
                        </Link>
                        <button
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors border-t border-slate-100 dark:border-indigo-800 mt-1"
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
                    className="h-9 bg-indigo-700 hover:bg-indigo-800 text-white rounded-full px-5 shadow-md shadow-indigo-700/20 hover:shadow-lg hover:shadow-indigo-700/30 hover:-translate-y-0.5 transition-all"
                  >
                    登录
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-slate-600 dark:text-slate-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom border line with gold accent */}
        <div
          className={cn(
            "h-px transition-opacity duration-300",
            isScrolled
              ? "bg-gradient-to-r from-transparent via-gold-400/30 to-transparent opacity-100"
              : "opacity-0"
          )}
        />
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-indigo-950 border-b border-slate-200 dark:border-indigo-800 shadow-xl animate-fade-in-up">
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base text-slate-700 dark:text-slate-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-indigo-800">
                <Link
                  href="/post/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-base text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
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
