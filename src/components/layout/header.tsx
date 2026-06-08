import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Search, Plus, LogOut, Settings, User, PenLine } from "lucide-react"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-stone-700 to-stone-800 dark:from-stone-200 dark:to-stone-300 text-white dark:text-stone-800 transition-transform group-hover:scale-105">
              <span className="text-xs font-bold">二</span>
            </div>
            <span className="hidden text-sm font-medium text-stone-700 dark:text-stone-300 sm:block">
              二中经开区学校论坛
            </span>
          </Link>
          <nav className="hidden md:flex md:items-center md:gap-0.5">
            {[
              { href: "/category/announcement", label: "公告" },
              { href: "/category/lostfound", label: "寻物" },
              { href: "/confession", label: "表白墙" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 transition-all hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-stone-800/60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link href="/search">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100/80 dark:hover:bg-stone-800/60"
            >
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {session?.user ? (
            <>
              <Link href="/post/new">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800 hover:bg-stone-700 dark:hover:bg-stone-300"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">发帖</span>
                </Button>
              </Link>
              <div className="relative group ml-1">
                <Link href={`/profile/${session.user.id}`}>
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-stone-300 dark:hover:ring-stone-600 transition-all">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                      {session.user.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-stone-200/80 dark:border-stone-700/80 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl shadow-xl shadow-stone-200/20 dark:shadow-stone-900/40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                  <div className="py-1.5">
                    <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800 mb-1">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">
                        {session.user.name ?? "用户"}
                      </p>
                    </div>
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      我的主页
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      账号设置
                    </Link>
                    <form
                      action={async () => {
                        "use server"
                        await signOut({ redirectTo: "/" })
                      }}
                      className="border-t border-stone-100 dark:border-stone-800 mt-1 pt-1"
                    >
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-stone-500 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        退出登录
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button
                size="sm"
                className="h-8 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800 hover:bg-stone-700 dark:hover:bg-stone-300"
              >
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
