export default function PhotowallLoading() {
  return (
    <div className="min-h-screen bg-[#faf9f7] dark:bg-[#0a0a0a] animate-page-enter">
      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-stone-900 pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <div className="skeleton h-14 w-14 rounded-2xl mx-auto mb-6" />
          <div className="skeleton h-10 w-40 rounded-lg mx-auto mb-4" />
          <div className="skeleton h-4 w-64 rounded mx-auto" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="relative -mt-10 mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton rounded-2xl"
              style={{
                aspectRatio: i % 3 === 0 ? "3/4" : i % 3 === 1 ? "1/1" : "4/3",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
