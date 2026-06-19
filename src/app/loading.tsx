export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] dark:bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-6">
        {/* 旋转环 */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-stone-200 dark:border-stone-800" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin-slow" />
        </div>

        {/* 脉冲点 */}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 dot-pulse" style={{ animationDelay: "0s" }} />
          <span className="h-2 w-2 rounded-full bg-amber-400 dot-pulse" style={{ animationDelay: "0.2s" }} />
          <span className="h-2 w-2 rounded-full bg-amber-400 dot-pulse" style={{ animationDelay: "0.4s" }} />
        </div>

        <p className="text-sm text-stone-400 dark:text-stone-500 tracking-wide">
          加载中
        </p>
      </div>
    </div>
  )
}