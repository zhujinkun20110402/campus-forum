import Link from "next/link"
import { Crown, Trophy } from "lucide-react"
import { UserAvatar } from "@/components/user/user-avatar"
import { HONOR_WALL_REP, getHonorWallCached } from "@/lib/cacheable-queries"
import { TITLES } from "@/lib/reputation-milestones"

/**
 * 首页传奇荣誉墙（声望之路 8800 解锁的展示位）
 * 声望达到门槛的成员自动上榜，最多展示 8 位；没有人达标时整块隐藏。
 */
export async function HonorWall() {
  const members = await getHonorWallCached()
  if (members.length === 0) return null

  return (
    <div className="border-2 border-[#191914] bg-[#fffaf0] p-5 shadow-[5px_5px_0_#191914] dark:border-[#f5f0e5] dark:bg-[#191914] dark:shadow-[5px_5px_0_#f5f0e5]">
      <div className="flex items-center justify-between gap-3 border-b-2 border-[#191914] pb-3 dark:border-[#f5f0e5]">
        <h3 className="flex items-center gap-2 font-serif text-lg font-bold">
          <Trophy className="h-4 w-4 text-[#e4532f]" />
          传奇荣誉墙
        </h3>
        <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-[#918b80]">
          {HONOR_WALL_REP}+
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {members.map((member, index) => {
          const title = TITLES.find((item) => item.id === member.equippedTitle)
          return (
            <li key={member.id}>
              <Link
                href={`/profile/${member.id}`}
                className="group flex items-center gap-3 border border-transparent p-1.5 transition-colors hover:border-[#191914]/30 hover:bg-[#ece6da]/60 dark:hover:border-white/30 dark:hover:bg-[#292821]/60"
              >
                <span className="w-4 shrink-0 font-mono text-[10px] font-bold text-[#918b80]">
                  {index + 1}
                </span>
                <UserAvatar name={member.name} image={member.image} role={member.role} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-sm font-bold group-hover:text-[#d44120] dark:group-hover:text-[#ff8a68]">
                      {member.name ?? "未命名用户"}
                    </span>
                    {index === 0 && <Crown className="h-3.5 w-3.5 shrink-0 text-[#e4532f]" />}
                  </span>
                  {title && (
                    <span className="mt-0.5 block truncate font-mono text-[9px] tracking-[0.08em] text-[#777268] dark:text-[#989389]">
                      {title.name}
                    </span>
                  )}
                </span>
                <span className="shrink-0 font-mono text-xs font-bold text-[#e4532f]">
                  {member.raputation}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <Link
        href="/reputation"
        className="mt-4 flex h-9 items-center justify-center gap-2 border-2 border-[#191914] bg-[#f3c84b] font-mono text-[10px] font-bold tracking-[0.12em] text-[#191914] transition-transform hover:-translate-y-0.5 dark:border-[#f5f0e5]"
      >
        查看声望之路
      </Link>
    </div>
  )
}
