import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Search, Plus, LogOut, Settings, User } from "lucide-react"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-stone-950/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-800">
              <span className="text-xs font-bold">二</span>
            </div>
            <span className="hidden text-sm font-medium text-stone-700 dark:text-stone-300 sm:block">
              二中经开区学校论坛
            </span>
          </Link>
          <nav className="hidden md:flex md:items-center md:gap-1">
            <Link
              href="/category/announcement"
              className="rounded-lg px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              公告
            </Link>
            <Link
              href="/category/lostfound"
              className="rounded-lg px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              寻物
            </Link>
            <Link
              href="/confession"
              className="rounded-lg px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 transition-colors hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              表白墙
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/search">
            <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-stone-800">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {session?.user ? (
            <>
              <Link href="/post/new">
                <Button size="sm" className="h-8">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  发帖
                </Button>
              </Link>
              <div className="relative group">
                <Link href={`/profile/${session.user.id}`}>
                  <Avatar className="h-7 w-7 cursor-pointer ring-2 ring-transparent hover:ring-stone-300 dark:hover:ring-stone-600 transition-all">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                      {session.user.name?.charAt(0) ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      <User className="h-4 w-4" />
                      我的主页
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                    >
                      <Settings className="h-4 w-4" />
                      账号设置
                    </Link>
                  </div>
                </div>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8 dark:hover:bg-stone-800" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm" className="h-8">
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}