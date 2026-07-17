"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import {
  ChevronDown,
  LogOut,
  Menu,
  PenLine,
  Search,
  Settings,
  Shield,
  User,
  X,
} from "lucide-react"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { UserAvatar } from "@/components/user/user-avatar"
import { SafeImage } from "@/components/ui/safe-image"
import { Button } from "@/components/ui/button"
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
  const pathname = usePathname()
  const { scrollDirection, scrollY } = useScrollDirection()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { data: session } = useSession()
  const user = session?.user
  const isScrolled = scrollY > 18
  const isHidden = scrollDirection === "down" && scrollY > 120 && !mobileMenuOpen && !dropdownOpen

  return (
    <>
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-transform duration-300 sm:px-5",
          isHidden ? "-translate-y-[calc(100%+1rem)]" : "translate-y-0"
        )}
      >
        <div
          className={cn(
            "pointer-events-auto mx-auto max-w-7xl border-2 border-[#191914] bg-[#fffaf0]/90 text-[#191914] shadow-[4px_4px_0_#191914] backdrop-blur-xl transition-all dark:border-[#f5f0e5] dark:bg-[#171713]/90 dark:text-[#f5f0e5] dark:shadow-[4px_4px_0_#f5f0e5]",
            isScrolled && "bg-[#fffaf0]/95 dark:bg-[#171713]/95"
          )}
        >
          <div className="flex h-14 items-center justify-between px-3 sm:px-4">
            <Link href="/" className="group flex min-w-0 items-center gap-2.5" aria-label="返回校园论坛首页">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden border border-[#191914] bg-white dark:border-[#f5f0e5]">
                <SafeImage
                  src="/images/school-logo.png"
                  alt="校徽"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 leading-none">
                <span className="block truncate font-serif text-sm font-bold tracking-tight sm:text-[15px]">
                  北京二中经开区学校
                </span>
                <span className="mt-1 block font-mono text-[8px] font-bold tracking-[0.18em] text-[#e4532f]">
                  CAMPUS FORUM
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="主导航">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#191914] text-[#fffaf0] dark:bg-[#f5f0e5] dark:text-[#191914]"
                        : "hover:bg-[#d9ef61] hover:text-[#191914]"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />

              <Link
                href="/search"
                aria-label="搜索帖子"
                className="hidden h-9 w-9 items-center justify-center border border-transparent transition-colors hover:border-[#191914] hover:bg-[#f3c84b] dark:hover:border-[#f5f0e5] sm:flex"
              >
                <Search className="h-4 w-4" />
              </Link>

              {user ? (
                <>
                  <Link
                    href="/post/new"
                    className="hidden h-9 items-center gap-1.5 border-2 border-[#191914] bg-[#ff6b43] px-3.5 text-xs font-bold text-[#191914] shadow-[2px_2px_0_#191914] transition-transform hover:-translate-y-0.5 sm:flex dark:border-[#f5f0e5] dark:shadow-[2px_2px_0_#f5f0e5]"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    发帖
                  </Link>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="打开用户菜单"
                      aria-expanded={dropdownOpen}
                      className="h-9 gap-1 border border-transparent px-1.5 hover:border-[#191914] hover:bg-[#ece6da] dark:hover:border-[#f5f0e5] dark:hover:bg-[#2a2924]"
                      onClick={() => setDropdownOpen((open) => !open)}
                    >
                      <UserAvatar name={user.name} image={user.image} role={user.role} size="sm" />
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", dropdownOpen && "rotate-180")} />
                    </Button>

                    {dropdownOpen && (
                      <>
                        <button
                          type="button"
                          aria-label="关闭用户菜单"
                          className="fixed inset-0 z-10 cursor-default"
                          onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-3 w-56 border-2 border-[#191914] bg-[#fffaf0] text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:text-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5]">
                          <div className="border-b border-[#191914]/20 px-4 py-3 dark:border-white/20">
                            <p className="truncate text-sm font-bold">{user.name ?? "用户"}</p>
                            <p className="mt-1 font-mono text-[9px] font-bold tracking-[0.15em] text-[#e4532f]">
                              {user.role === "ADMIN" ? "ADMIN" : "STUDENT"}
                            </p>
                          </div>
                          <div className="p-1.5 text-sm">
                            <Link href={`/profile/${user.id}`} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#d9ef61] hover:text-[#191914]">
                              <User className="h-4 w-4" /> 我的主页
                            </Link>
                            <Link href="/profile/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#d9ef61] hover:text-[#191914]">
                              <Settings className="h-4 w-4" /> 账号设置
                            </Link>
                            {user.role === "ADMIN" && (
                              <Link href="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-[#d44120] hover:bg-[#f3c84b] hover:text-[#191914]">
                                <Shield className="h-4 w-4" /> 管理后台
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => signOut({ callbackUrl: "/" })}
                              className="mt-1 flex w-full items-center gap-2.5 border-t border-[#191914]/15 px-3 py-2.5 text-left text-[#777268] hover:bg-[#ffb4aa] hover:text-[#191914] dark:border-white/15 dark:text-[#aaa69c]"
                            >
                              <LogOut className="h-4 w-4" /> 退出登录
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="inline-flex h-9 items-center border-2 border-[#191914] bg-[#ff6b43] px-4 text-xs font-bold text-[#191914] shadow-[2px_2px_0_#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5] dark:shadow-[2px_2px_0_#f5f0e5]"
                >
                  登录
                </Link>
              )}

              <Button
                variant="ghost"
                size="icon"
                aria-label={mobileMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
                aria-expanded={mobileMenuOpen}
                className="h-9 w-9 border border-transparent hover:border-[#191914] hover:bg-[#d9ef61] hover:text-[#191914] dark:hover:border-[#f5f0e5] lg:hidden"
                onClick={() => {
                  setMobileMenuOpen((open) => !open)
                  setDropdownOpen(false)
                }}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="关闭导航菜单"
            className="absolute inset-0 bg-[#191914]/45 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute inset-x-3 top-[82px] border-2 border-[#191914] bg-[#fffaf0] p-3 text-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#171713] dark:text-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] sm:inset-x-5">
            <nav className="grid grid-cols-2 gap-2" aria-label="移动端导航">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex min-h-16 flex-col justify-between border border-[#191914] p-3 dark:border-[#f5f0e5]",
                      isActive ? "bg-[#d9ef61] text-[#191914]" : "hover:bg-[#ece6da] dark:hover:bg-[#2a2924]"
                    )}
                  >
                    <span className="font-mono text-[8px] font-bold tracking-[0.15em] text-[#e4532f]">0{index + 1}</span>
                    <span className="font-serif text-lg font-bold">{link.label}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-3 flex items-center gap-2 border-t border-[#191914]/20 pt-3 dark:border-white/20">
              <Link href="/search" onClick={() => setMobileMenuOpen(false)} className="flex h-11 flex-1 items-center justify-center gap-2 border border-[#191914] text-sm font-bold hover:bg-[#f3c84b] dark:border-[#f5f0e5]">
                <Search className="h-4 w-4" /> 搜索
              </Link>
              {user && (
                <Link href="/post/new" onClick={() => setMobileMenuOpen(false)} className="flex h-11 flex-1 items-center justify-center gap-2 border border-[#191914] bg-[#ff6b43] text-sm font-bold text-[#191914] dark:border-[#f5f0e5]">
                  <PenLine className="h-4 w-4" /> 发帖
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
