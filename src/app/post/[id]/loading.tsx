export default function PostDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-page-enter">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-4 w-12 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
        <div className="skeleton h-4 w-16 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>

      {/* Category badge + time */}
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>

      {/* Title */}
      <div className="skeleton h-9 w-3/4 rounded-lg mb-4" />
      <div className="skeleton h-9 w-1/2 rounded-lg mb-6" />

      {/* Author */}
      <div className="flex items-center gap-3 mb-8">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4 rounded"
            style={{ width: `${85 - i * 8}%` }}
          />
        ))}
      </div>

      {/* Content block */}
      <div className="skeleton h-48 w-full rounded-xl mb-8" />

      {/* More content lines */}
      <div className="space-y-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-4 rounded"
            style={{ width: `${75 - i * 6}%` }}
          />
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 py-5 border-t border-stone-200 dark:border-stone-800 mb-10">
        <div className="skeleton h-10 w-24 rounded-full" />
        <div className="skeleton h-10 w-24 rounded-full" />
        <div className="skeleton h-10 w-10 rounded-full" />
      </div>

      {/* Comments section */}
      <div className="space-y-4">
        <div className="skeleton h-6 w-32 rounded-lg" />
        <div className="skeleton h-24 w-full rounded-xl" />
        <div className="skeleton h-24 w-full rounded-xl" />
      </div>
    </div>
  )
}