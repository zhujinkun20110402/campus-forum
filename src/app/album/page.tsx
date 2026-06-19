import Link from "next/link"
import { getAllAlbums, type Album } from "@/lib/album-store"
import { ScrollReveal } from "@/components/effects/scroll-reveal"
import { SafeImage } from "@/components/ui/safe-image"
import { formatRelativeTime } from "@/lib/utils"
import { Images, Plus, Sparkles, Camera, User } from "lucide-react"

const CARD_ASPECTS = [
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[1/1]",
  "aspect-[4/5]",
  "aspect-[5/4]",
]

export default async function AlbumListPage() {
  const albums = await getAllAlbums()
  const featured = albums.filter((a) => a.isFeatured)
  const rest = albums.filter((a) => !a.isFeatured)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50/40 to-white dark:from-stone-950 dark:via-amber-950/10 dark:to-[#0a0a0a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,119,6,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-50/80 dark:to-[#0a0a0a]/80" />

        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <div className="text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 dark:border-amber-800/60 bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-sm px-4 py-1.5 mb-8">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  定格 · 回忆 · 共享
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-950/60 dark:to-stone-800/40 text-amber-500 dark:text-amber-400 mb-6 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/20 animate-pulse-soft">
                <Images className="h-8 w-8" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-800 dark:text-stone-100 sm:text-5xl mb-4">
                校园相册
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <p className="text-base text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed mb-8">
                用镜头记录校园点滴，让每一帧青春都成为永恒的记忆。
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <Link
                href="/album/new"
                className="inline-flex items-center gap-2 rounded-full bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 px-6 py-3 text-sm font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <Plus className="h-4 w-4" />
                创建相册
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 pb-16 -mt-4">
        {albums.length === 0 ? (
          <ScrollReveal>
            <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-20 text-center bg-white/70 dark:bg-stone-900/30 backdrop-blur-sm">
              <Camera className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-600" />
              <p className="mt-4 text-stone-400 dark:text-stone-500 text-lg font-serif">
                还没有相册，来创建第一个吧
              </p>
              <Link
                href="/album/new"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-900 px-5 py-2.5 text-sm font-medium transition-all"
              >
                <Plus className="h-4 w-4" />
                创建相册
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <div className="mb-12">
                <ScrollReveal>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
                        精选相册
                      </h2>
                      <p className="text-xs text-stone-400 dark:text-stone-500">
                        {featured.length} 个精选作品
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                  {featured.map((album, i) => (
                    <ScrollReveal key={album.id} delay={i * 0.05}>
                      <AlbumCard album={album} featured index={i} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}

            {/* All albums */}
            <div>
              <ScrollReveal>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                    <Images className="h-4 w-4 text-stone-500 dark:text-stone-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-semibold text-stone-800 dark:text-stone-100">
                      全部相册
                    </h2>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {albums.length} 个相册
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                {rest.map((album, i) => (
                  <ScrollReveal key={album.id} delay={i * 0.05}>
                    <AlbumCard album={album} index={i} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AlbumCard({
  album,
  featured = false,
  index = 0,
}: {
  album: Album
  featured?: boolean
  index?: number
}) {
  const aspect = CARD_ASPECTS[index % CARD_ASPECTS.length]

  return (
    <Link
      href={`/album/${album.id}`}
      className="group block break-inside-avoid mb-5 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className={`relative w-full overflow-hidden bg-stone-100 dark:bg-stone-900 ${aspect}`}>
        {album.coverUrl ? (
          <SafeImage
            src={album.coverUrl}
            alt={album.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300 dark:text-stone-600">
            <Images className="h-10 w-10" />
          </div>
        )}
        {featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-medium text-white">
            <Sparkles className="h-3 w-3" />
            精选
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-serif text-base font-semibold text-stone-800 dark:text-stone-100 mb-2 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {album.title}
        </h3>
        {album.description && (
          <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 mb-3 leading-relaxed">
            {album.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            <span className="truncate max-w-[80px]">{album.authorName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Images className="h-3.5 w-3.5" />
            {album.photos.length} 张
          </span>
        </div>
        <div className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">
          {formatRelativeTime(album.createdAt)}
        </div>
      </div>
    </Link>
  )
}
