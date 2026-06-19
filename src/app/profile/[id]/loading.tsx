export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0a0a] animate-page-enter">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-stone-900 pb-24 pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="skeleton h-24 w-24 sm:h-28 sm:w-28 rounded-3xl" />
            <div className="flex-1 text-center sm:text-left space-y-3">
              <div className="skeleton h-8 w-40 rounded-lg mx-auto sm:mx-0" />
              <div className="skeleton h-4 w-32 rounded mx-auto sm:mx-0" />
              <div className="skeleton h-4 w-64 rounded mx-auto sm:mx-0" />
            </div>
          </div>

          {/* Stats skeleton */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto sm:mx-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
                <div className="skeleton h-4 w-4 rounded mx-auto mb-2" />
                <div className="skeleton h-7 w-12 rounded mx-auto mb-1" />
                <div className="skeleton h-3 w-10 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="relative -mt-12 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="bg-white dark:bg-[#141414] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xl p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="skeleton h-5 w-5 rounded" />
            <div className="skeleton h-6 w-28 rounded-lg" />
            <div className="skeleton h-3 w-12 rounded ml-auto" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 p-5"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="skeleton h-3 w-20 rounded" />
                </div>
                <div className="skeleton h-5 w-2/3 rounded mb-2" />
                <div className="skeleton h-4 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}