export default function AlbumListLoading() {
  return (
    <div className="min-h-screen animate-page-enter">
      {/* Hero skeleton */}
      <div className="relative h-72 flex items-center justify-center overflow-hidden bg-stone-100 dark:bg-stone-900">
        <div className="text-center">
          <div className="skeleton h-16 w-16 rounded-2xl mx-auto mb-4" />
          <div className="skeleton h-9 w-40 rounded-lg mx-auto mb-2" />
          <div className="skeleton h-4 w-56 rounded mx-auto mb-6" />
          <div className="skeleton h-10 w-28 rounded-full mx-auto" />
        </div>
      </div>

      {/* Masonry grid skeleton */}
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="skeleton h-8 w-8 rounded-lg" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => {
            const heights = ["h-48", "h-64", "h-56", "h-72", "h-52", "h-60"]
            return (
              <div
                key={i}
                className="break-inside-avoid mb-5 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414]"
              >
                <div className={`skeleton w-full ${heights[i % heights.length]}`} />
                <div className="p-4">
                  <div className="skeleton h-4 w-3/4 rounded mb-3" />
                  <div className="skeleton h-3 w-full rounded mb-1.5" />
                  <div className="skeleton h-3 w-5/6 rounded mb-4" />
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-3 w-12 rounded" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
