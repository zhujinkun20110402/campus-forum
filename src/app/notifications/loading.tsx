export default function NotificationsLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#ece6da] px-4 pb-16 pt-32 dark:bg-[#10100e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="h-4 w-36 bg-[#d2cabd] dark:bg-[#34332d]" />
        <div className="mt-6 h-12 max-w-xl bg-[#d2cabd] dark:bg-[#34332d]" />
        <div className="mt-16 border-2 border-[#191914] bg-[#fffaf0] p-5 dark:border-[#f5f0e5] dark:bg-[#191914]">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="grid grid-cols-[48px_1fr] gap-4 border-b border-[#191914]/15 py-5 last:border-0 dark:border-white/15">
              <div className="h-12 w-12 rounded-full bg-[#d2cabd] dark:bg-[#34332d]" />
              <div><div className="h-4 w-2/3 bg-[#d2cabd] dark:bg-[#34332d]" /><div className="mt-3 h-3 w-1/3 bg-[#e1dacf] dark:bg-[#2b2a25]" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
