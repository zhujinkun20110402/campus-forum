"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2, Star, Loader2, ExternalLink } from "lucide-react"

interface AlbumManageProps {
  albums: {
    id: string
    title: string
    description: string
    coverUrl: string
    photos: { url: string }[]
    authorName: string
    createdAt: string
    isFeatured: boolean
  }[]
}

export function AlbumManage({ albums }: AlbumManageProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [localAlbums, setLocalAlbums] = useState(albums)

  async function handleDelete(id: string, title: string) {
    if (!confirm(`确定要删除相册「${title}」吗？此操作不可撤销。`)) return
    setLoadingId(id)
    try {
      await fetch(`/api/albums/${id}`, { method: "DELETE" })
      setLocalAlbums((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch {
      alert("删除失败")
    } finally {
      setLoadingId(null)
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    setLoadingId(id)
    try {
      await fetch(`/api/albums/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
      })
      setLocalAlbums((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isFeatured: !current } : a))
      )
      router.refresh()
    } catch {
      alert("操作失败")
    } finally {
      setLoadingId(null)
    }
  }

  if (localAlbums.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 dark:border-stone-700 py-16 text-center">
        <p className="text-sm text-stone-400 dark:text-stone-500">暂无相册</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {localAlbums.map((album) => (
        <div
          key={album.id}
          className="flex items-center gap-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 p-4 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
        >
          {/* Cover */}
          <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-stone-200 dark:bg-stone-800">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-stone-400 text-xs">
                无图
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate">
                {album.title}
              </h4>
              {album.isFeatured && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-full">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  精选
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              <span>{album.photos.length} 张照片</span>
              <span>·</span>
              <span>{album.authorName}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/album/${album.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="查看"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              disabled={loadingId === album.id}
              onClick={() => toggleFeatured(album.id, album.isFeatured)}
              title={album.isFeatured ? "取消精选" : "设为精选"}
            >
              <Star className={`h-3.5 w-3.5 ${album.isFeatured ? "fill-current" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              disabled={loadingId === album.id}
              onClick={() => handleDelete(album.id, album.title)}
            >
              {loadingId === album.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
