"use client"

import Link from "next/link"
import { SafeImage } from "@/components/ui/safe-image"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
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
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/category/announcement", label: "公告" },
  { href: "/category/lostfound", label: "寻物" },
  { href: "/confession", label: "表白墙" },
  { href: "/category/study", label: "学习" },
  { href: "/category/activity", label: "活动" },
  { href: "/album", label: "相册" },
]

export function Header() {
  const { scrollDirection, scrollY } = useScrollDirection()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { data: session } = useSession()
  const user = session?.user
  const isScrolled = scrollY > 20
  const isHidden = scrollDirection === "down" && scrollY > 100

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isHidden ? "-translate-y-full" : "translate-y-0",
          isScrolled
            ? "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-stone-200/60 dark:border-[#1c1c1c]/60"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-stone-100 dark:bg-[#1c1c1c] border border-stone-200 dark:border-[#262626] shadow-sm transition-shadow group-hover:shadow-md">
                <SafeImage
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-stone-800 dark:text-stone-200 tracking-wide">
                  北京二中经开区学校
                </span>
                <span className="hidden lg:inline text-xs text-stone-400 dark:text-stone-500 ml-2">
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
                  className="relative px-3 py-2 text-sm text-stone-600 dark:text-stone-400 rounded-lg transition-all hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1c1c1c] group"
                >
                  {link.label}
                  <span className="absolute bottom-1 left-3 right-3 h-px bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
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
                  className="h-9 w-9 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1c1c1c]"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </Link>

              {user ? (
                <>
                  <Link href="/post/new" className="hidden sm:block">
                    <Button
                      size="sm"
                      className="h-9 gap-1.5 bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 rounded-full px-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <PenLine className="h-3.5 w-3.5" />
                      <span>发帖</span>
                    </Button>
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#1c1c1c]"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="h-7 w-7 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs font-medium text-stone-600 dark:text-stone-300">
                        {(user.name ?? "?").charAt(0)}
                      </div>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
                    </Button>

                    {dropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#141414] shadow-xl z-20 overflow-hidden">
                          <div className="py-1.5">
                            <div className="px-4 py-2.5 border-b border-stone-100 dark:border-stone-800">
                              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                                {user.name ?? "用户"}
                              </p>
                              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                                {user.role === "ADMIN" ? "管理员" : "学生"}
                              </p>
                            </div>
                            <Link
                              href={`/profile/${user.id}`}
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                            >
                              <User className="h-4 w-4" />
                              我的主页
                            </Link>
                            <Link
                              href="/profile/settings"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                            >
                              <Settings className="h-4 w-4" />
                              账号设置
                            </Link>
                            {user.role === "ADMIN" && (
                              <Link
                                href="/admin"
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                              >
                                <Shield className="h-4 w-4" />
                                管理后台
                              </Link>
                            )}
                            <button
                              onClick={() => {
                                setDropdownOpen(false)
                                signOut({ callbackUrl: "/" })
                              }}
                              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-t border-stone-100 dark:border-stone-800 mt-1"
                            >
                              <LogOut className="h-4 w-4" />
                              退出登录
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button
                    size="sm"
                    className="h-9 bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 rounded-full px-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    登录
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-stone-600 dark:text-stone-400"
                onClick={() => {
                  setMobileMenuOpen(!mobileMenuOpen)
                  setDropdownOpen(false)
                }}
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0a0a0a] border-b border-stone-200 dark:border-stone-800 shadow-xl animate-fade-in-up">
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-base text-stone-700 dark:text-stone-300 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-800">
                {user ? (
                  <>
                    <Link
                      href="/post/new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-base text-amber-600 dark:text-amber-400 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                      发布新帖
                    </Link>
                    <Link
                      href={`/profile/${user.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-base text-stone-600 dark:text-stone-400 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                    >
                      <User className="h-5 w-5" />
                      我的主页
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-base text-stone-500 dark:text-stone-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      退出登录
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-base text-amber-600 dark:text-amber-400 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
                  >
                    登录
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}