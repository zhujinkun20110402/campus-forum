import Link from "next/link"
import { auth, signOut } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Search, PlusCircle, LogOut } from "lucide-react"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-sm font-bold">二中</span>
            </div>
            <span className="hidden text-lg font-semibold text-gray-900 sm:block">
              北京二中经开区学校论坛
            </span>
          </Link>
          <nav className="hidden md:flex md:items-center md:gap-4">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              首页
            </Link>
            <Link
              href="/category/study"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              学习交流
            </Link>
            <Link
              href="/category/secondhand"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              二手交易
            </Link>
            <Link
              href="/category/lostfound"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              失物招领
            </Link>
            <Link
              href="/category/activity"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              校园活动
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/search">
            <Button variant="ghost" size="icon">
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
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback>
                      {session.user.name?.charAt(0) ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button variant="ghost" size="icon" type="submit">
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