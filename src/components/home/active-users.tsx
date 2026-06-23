"use client"

import Link from "next/link"
import { Users } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { LevelBadge } from "@/components/reputation/level-badge"

interface ActiveUser {
  id: string
  name: string | null
  image: string | null
  role?: string | null
  raputation?: number | null
}

interface ActiveUsersProps {
  users: ActiveUser[]
}

export function ActiveUsers({ users }: ActiveUsersProps) {
  if (users.length === 0) return null

  return (
    <div className="h-full rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#141414] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-8 w-8 rounded-lg bg-sky-50 dark:bg-sky-950/30 flex items-center justify-center">
          <Users className="h-4 w-4 text-sky-500" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-800 dark:text-stone-100">新面孔</h3>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">最近加入的同学</p>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-3 gap-4">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/profile/${user.id}`}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <UserAvatar
              name={user.name}
              image={user.image}
              role={user.role}
              size="md"
              className="group-hover:scale-110 transition-transform"
            />
            <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate w-full group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {user.name ?? "匿名用户"}
            </span>
            {user.raputation != null && (
              <LevelBadge raputation={user.raputation} role={user.role} size="xs" showTitle={false} />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
