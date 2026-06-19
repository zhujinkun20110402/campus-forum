"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trash2, Pencil, Loader2 } from "lucide-react"

interface AlbumActionsProps {
  albumId: string
  isOwner: boolean
  isAdmin: boolean
}

export function AlbumActions({ albumId, isOwner, isAdmin }: AlbumActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm("确定要删除这个相册吗？此操作不可撤销。")) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? "删除失败")
      }

      router.push("/album")
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "删除失败，请重试")
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {isOwner && (
        <Link
          href={`/album/${albumId}/edit`}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          编辑
        </Link>
      )}

      {(isOwner || isAdmin) && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {deleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          删除
        </button>
      )}
    </div>
  )
}
