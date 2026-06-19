import Link from "next/link"
import { notFound } from "next/navigation"
import { getAlbumById } from "@/lib/album-store"
import { auth } from "@/lib/auth"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { SafeImage } from "@/components/ui/safe-image"
import { AlbumActions } from "@/components/album/album-actions"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { ArrowLeft, Clock, Images, User, Calendar, Sparkles } from "lucide-react"

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [album, session] = await Promise.all([getAlbumById(id), auth()])

  if (!album) {
    notFound()
  }

  const currentUser = session?.user
  const isOwner = currentUser?.id === album.authorId
  const isAdmin = currentUser?.role === "ADMIN"
  const canManage = isOwner || isAdmin

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {/* Breadcrumb */}
      <ScrollReveal>
        <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500 mb-6">
          <Link
            href="/album"
            className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            校园相册
          </Link>
          <span>/</span>
          <span className="text-stone-300 dark:text-stone-600 truncate max-w-[240px]">
            {album.title}
          </span>
        </div>
      </ScrollReveal>

      {/* Header */}
      <ScrollReveal delay={0.05}>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            {album.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                精选
              </span>
            )}
            <span className="flex items-center gap-1 text-sm text-stone-400 dark:text-stone-500">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(album.createdAt)}
            </span>
            <span className="flex items-center gap-1 text-sm text-stone-400 dark:text-stone-500">
              <Images className="h-3.5 w-3.5" />
              {album.photos.length} 张照片
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-800 dark:text-stone-100 mb-4 leading-tight">
            {album.title}
          </h1>

          {album.description && (
            <p className="text-base text-stone-500 dark:text-stone-400 leading-relaxed mb-6 max-w-3xl">
              {album.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center ring-2 ring-stone-100 dark:ring-stone-800">
                <User className="h-4 w-4 text-stone-500 dark:text-stone-400" />
              </div>
              <div>
                <p className="font-medium text-stone-800 dark:text-stone-100">
                  {album.authorName}
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">作者</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500">
              <Calendar className="h-4 w-4" />
              <span>创建于 {formatDate(album.createdAt)}</span>
            </div>

            {canManage && (
              <div className="ml-auto">
                <AlbumActions
                  albumId={album.id}
                  isOwner={isOwner}
                  isAdmin={isAdmin}
                />
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Photo grid */}
      {album.photos.length === 0 ? (
        <ScrollReveal delay={0.1}>
          <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center bg-white/70 dark:bg-stone-900/30">
            <Images className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600" />
            <p className="mt-4 text-stone-400 dark:text-stone-500 font-serif">
              这个相册还没有照片
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {album.photos.map((photo, i) => (
            <ScrollReveal key={`${photo.url}-${i}`} delay={Math.min(i * 0.03, 0.3)}>
              <figure className="group relative aspect-square rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <SafeImage
                  src={photo.url}
                  alt={photo.caption ?? album.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {photo.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 pt-8 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <p className="text-xs text-white leading-relaxed line-clamp-2">
                      {photo.caption}
                    </p>
                  </figcaption>
                )}
              </figure>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  )
}
