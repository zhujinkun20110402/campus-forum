export default function ConfessionLoading() {
  return (
    <div className="min-h-screen animate-page-enter">
      {/* Hero skeleton */}
      <div className="relative h-64 flex items-center justify-center overflow-hidden bg-stone-100 dark:bg-stone-900">
        <div className="text-center">
          <div className="skeleton h-16 w-16 rounded-2xl mx-auto mb-4" />
          <div className="skeleton h-9 w-32 rounded-lg mx-auto mb-2" />
          <div className="skeleton h-4 w-48 rounded mx-auto" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-6 mb-8">
          <div className="skeleton h-24 w-full rounded-xl mb-4" />
          <div className="skeleton h-10 w-32 rounded-full" />
        </div>

        {/* Posts skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="skeleton h-7 w-7 rounded-full" />
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-20 rounded ml-auto" />
              </div>
              <div className="skeleton h-4 w-full rounded mb-1.5" />
              <div className="skeleton h-4 w-5/6 rounded mb-4" />
              <div className="flex items-center gap-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div className="skeleton h-3 w-8 rounded" />
                <div className="skeleton h-3 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}