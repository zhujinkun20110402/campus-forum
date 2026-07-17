import { cn } from "@/lib/utils"

type LoadingVariant = "feed" | "gallery" | "profile" | "form" | "article"

export function EditorialLoading({ variant = "feed" }: { variant?: LoadingVariant }) {
  return (
    <div className="min-h-screen bg-[#f4efe4] text-[#191914] dark:bg-[#11110f] dark:text-[#f5f0e5]">
      <div className="campus-paper border-b-2 border-[#191914] px-4 pb-14 pt-28 dark:border-[#f5f0e5] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-end justify-between gap-8">
          <div className="w-full max-w-2xl">
            <div className="skeleton h-5 w-32 border border-[#191914]/20" />
            <div className="skeleton mt-5 h-12 w-3/4 max-w-lg" />
            <div className="skeleton mt-3 h-4 w-full max-w-xl" />
            <div className="skeleton mt-2 h-4 w-2/3 max-w-md" />
          </div>
          <div className="skeleton hidden h-28 w-28 border-2 border-[#191914] shadow-[6px_6px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[6px_6px_0_#f5f0e5] md:block" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {variant === "gallery" && <GallerySkeleton />}
        {variant === "profile" && <ProfileSkeleton />}
        {variant === "form" && <FormSkeleton />}
        {variant === "article" && <ArticleSkeleton />}
        {variant === "feed" && <FeedSkeleton />}
      </div>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="mx-auto grid max-w-4xl gap-5">
      {Array.from({ length: 4 }).map((_, index) => <PostSkeleton key={index} />)}
    </div>
  )
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className={cn("skeleton border-2 border-[#191914]/20 dark:border-white/20", index % 3 === 0 ? "aspect-[3/4]" : index % 3 === 1 ? "aspect-square" : "aspect-[4/3]")} />
      ))}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-32 border-2 border-[#191914]/20 dark:border-white/20" />
        <div className="skeleton h-32 border-2 border-[#191914]/20 dark:border-white/20" />
      </div>
      <div className="grid gap-5">{Array.from({ length: 3 }).map((_, index) => <PostSkeleton key={index} />)}</div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="border-2 border-[#191914] bg-[#fffaf0] p-6 dark:border-[#f5f0e5] dark:bg-[#191914] sm:p-8">
        <div className="skeleton h-12 w-full" />
        <div className="skeleton mt-5 h-12 w-full" />
        <div className="skeleton mt-5 h-64 w-full" />
        <div className="skeleton mt-6 h-12 w-40" />
      </div>
      <div className="skeleton hidden h-72 border-2 border-[#191914]/20 dark:border-white/20 lg:block" />
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="mx-auto max-w-4xl border-2 border-[#191914] bg-[#fffaf0] p-6 dark:border-[#f5f0e5] dark:bg-[#191914] sm:p-10">
      <div className="skeleton h-6 w-24" />
      <div className="skeleton mt-6 h-10 w-5/6" />
      <div className="skeleton mt-3 h-10 w-2/3" />
      <div className="skeleton mt-7 h-12 w-48" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 7 }).map((_, index) => <div key={index} className="skeleton h-4" style={{ width: `${96 - index * 6}%` }} />)}
      </div>
      <div className="skeleton mt-8 h-48 w-full" />
    </div>
  )
}

function PostSkeleton() {
  return (
    <div className="border-2 border-[#191914]/25 bg-[#fffaf0] p-5 dark:border-white/25 dark:bg-[#191914] sm:p-6">
      <div className="flex justify-between gap-4"><div className="skeleton h-6 w-20" /><div className="skeleton h-4 w-24" /></div>
      <div className="skeleton mt-5 h-6 w-3/4" />
      <div className="skeleton mt-3 h-4 w-full" />
      <div className="skeleton mt-2 h-4 w-5/6" />
      <div className="mt-5 flex items-center justify-between border-t border-[#191914]/15 pt-4 dark:border-white/15">
        <div className="flex items-center gap-2"><div className="skeleton h-9 w-9 rounded-full" /><div className="skeleton h-4 w-20" /></div>
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  )
}
