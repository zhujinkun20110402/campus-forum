import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-stone-400 dark:text-stone-500">
            &copy; {new Date().getFullYear()} 北京二中经开区学校论坛
          </p>
          <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-stone-500">
            <Link href="/" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              首页
            </Link>
            <Link href="/category/announcement" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              公告
            </Link>
            <Link href="/confession" className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
              表白墙
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}