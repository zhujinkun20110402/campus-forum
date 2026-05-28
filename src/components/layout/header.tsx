import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { Search, PlusCircle, LogOut, Settings, User } from "lucide-react"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-sm font-bold">二中</span>
            </div>
            <span className="hidden text-lg font-semibold text-gray-900 dark:text-gray-100 sm:block">
              北京二中经开区学校论坛
            </span>
          </Link>
          <nav className="hidden md:flex md:items-center md:gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              首页
            </Link>
            <Link
              href="/category/study"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              学习交流
            </Link>
            <Link
              href="/category/secondhand"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              二手交易
            </Link>
            <Link
              href="/category/lostfound"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              失物招领
            </Link>
            <Link
              href="/category/activity"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              校园活动
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/search">
            <Button variant="ghost" size="icon" className="dark:hover:bg-gray-800">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {session?.user ? (
            <>
              <Link href="/post/new">
                <Button size="sm">
                  <PlusCircle className="mr-1 h-4 w-4" />
                  发帖
                </Button>
              </Link>
              <div className="relative group">
                <Link href={`/profile/${session.user.id}`}>
                  <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                      {session.user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <User className="h-4 w-4" />
                      我的主页
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                <Button variant="ghost" size="icon" type="submit" className="dark:hover:bg-gray-800">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm">登录</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}