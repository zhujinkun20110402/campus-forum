export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-sm font-bold">二中</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              北京二中经开区学校校园论坛
            </span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            为师生提供学习交流的平台 &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}