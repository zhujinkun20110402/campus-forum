export default function SearchLoading() {
  return (
    <div className="min-h-screen mx-auto max-w-3xl px-4 py-12 animate-page-enter">
      {/* Search bar skeleton */}
      <div className="mb-8">
        <div className="skeleton h-12 w-full rounded-xl" />
      </div>

      {/* Title */}
      <div className="skeleton h-7 w-40 rounded-lg mb-6" />

      {/* Results skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
            <div className="skeleton h-5 w-2/3 rounded mb-2" />
            <div className="skeleton h-4 w-full rounded mb-1.5" />
            <div className="skeleton h-4 w-4/5 rounded mb-4" />
            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="skeleton h-6 w-6 rounded-full" />
                <div className="skeleton h-3 w-14 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="skeleton h-3 w-6 rounded" />
                <div className="skeleton h-3 w-6 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}