export default function CategoryLoading() {
  return (
    <div className="min-h-screen animate-page-enter">
      {/* Hero skeleton */}
      <div className="relative h-48 sm:h-56 flex items-center justify-center overflow-hidden bg-stone-100 dark:bg-stone-900">
        <div className="text-center px-4">
          <div className="skeleton h-8 w-48 rounded-lg mx-auto mb-3" />
          <div className="skeleton h-4 w-64 rounded mx-auto" />
        </div>
      </div>

      {/* Post list skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-3 w-20 rounded" />
              </div>
            </div>
            <div className="skeleton h-5 w-3/4 rounded mb-2.5" />
            <div className="skeleton h-4 w-full rounded mb-1.5" />
            <div className="skeleton h-4 w-5/6 rounded mb-5" />
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="skeleton h-7 w-7 rounded-full" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="skeleton h-3 w-8 rounded" />
                <div className="skeleton h-3 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}