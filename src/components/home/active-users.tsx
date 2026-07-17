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
    <div className="border-2 border-[#191914] bg-[#b9ddbd] p-5 text-[#191914] shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:shadow-[5px_5px_0_#f5f0e5] sm:p-6">
      <div className="mb-5 flex items-center justify-between border-b border-[#191914]/20 pb-4">
        <div>
          <p className="font-mono text-[9px] font-bold tracking-[0.16em] text-[#326b42]">NEW MEMBERS</p>
          <h3 className="mt-1 font-serif text-xl font-bold">新面孔</h3>
        </div>
        <Users className="h-5 w-5" />
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-5">
        {users.map((user) => (
          <Link key={user.id} href={`/profile/${user.id}`} className="group flex min-w-0 flex-col items-center text-center">
            <div className="border-2 border-[#191914] bg-[#fffaf0] p-0.5 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              <UserAvatar name={user.name} image={user.image} role={user.role} size="md" />
            </div>
            <span className="mt-2 w-full truncate text-[11px] font-bold">{user.name ?? "匿名用户"}</span>
            {user.raputation != null && (
              <LevelBadge raputation={user.raputation} role={user.role} size="xs" showTitle={false} />
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
