export default function AlbumDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 animate-page-enter">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="skeleton h-4 w-20 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
        <div className="skeleton h-4 w-32 rounded" />
      </div>

      {/* Title skeleton */}
      <div className="flex items-center gap-3 mb-5">
        <div className="skeleton h-6 w-16 rounded-full" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="skeleton h-9 w-3/4 rounded-lg mb-4" />
      <div className="skeleton h-9 w-1/2 rounded-lg mb-6" />

      {/* Description skeleton */}
      <div className="space-y-2 mb-6">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
      </div>

      {/* Author row skeleton */}
      <div className="flex items-center gap-4 mb-10">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-12 rounded" />
        </div>
        <div className="skeleton h-4 w-40 rounded ml-auto" />
      </div>

      {/* Photo grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="skeleton aspect-square rounded-2xl"
          />
        ))}
      </div>
    </div>
  )
}
