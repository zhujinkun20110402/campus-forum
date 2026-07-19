import Link from "next/link"
import { ArrowUpRight, MessageSquare, NotebookPen, Users } from "lucide-react"
import { FollowButton } from "@/components/social/follow-button"
import { LevelBadge } from "@/components/reputation/level-badge"
import { UserAvatar } from "@/components/user/user-avatar"

interface UserResultCardProps {
  user: {
    id: string
    name: string | null
    image: string | null
    bio?: string | null
    role: string
    raputation: number
    _count?: { posts?: number; comments?: number; followers?: number }
  }
  viewerId: string
  isFollowing: boolean
}

export function UserResultCard({ user, viewerId, isFollowing }: UserResultCardProps) {
  return (
    <article className="grid gap-4 border-b border-[#191914]/20 py-5 last:border-b-0 dark:border-white/20 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
      <Link href={`/profile/${user.id}`} className="w-fit">
        <UserAvatar name={user.name} image={user.image} role={user.role} size="lg" />
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/profile/${user.id}`} className="font-serif text-lg font-bold hover:text-[#d44120] dark:hover:text-[#ff8a68]">{user.name ?? "未命名用户"}</Link>
          {user.role === "ADMIN" && <span className="border border-[#191914] bg-[#f3c84b] px-1.5 py-0.5 font-mono text-[8px] font-bold text-[#191914] dark:border-[#f5f0e5]">ADMIN</span>}
          <LevelBadge raputation={user.raputation} role={user.role} size="xs" />
        </div>
        <p className="mt-1 line-clamp-1 text-xs text-[#777268] dark:text-[#aaa69c]">{user.bio || "这位同学还没有填写个人简介。"}</p>
        {user._count && (
          <div className="mt-2 flex flex-wrap gap-3 font-mono text-[9px] text-[#918b80]">
            {user._count.posts != null && <span className="flex items-center gap-1"><NotebookPen className="h-3 w-3" />{user._count.posts} 帖</span>}
            {user._count.comments != null && <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{user._count.comments} 评</span>}
            {user._count.followers != null && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{user._count.followers} 粉丝</span>}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 sm:justify-end">
        {viewerId !== user.id && <FollowButton targetUserId={user.id} initialFollowing={isFollowing} compact />}
        <Link href={`/profile/${user.id}`} className="flex h-9 w-9 items-center justify-center border border-[#191914] hover:bg-[#f3c84b] dark:border-[#f5f0e5]" aria-label={`查看 ${user.name ?? "用户"} 的主页`}><ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </article>
  )
}
