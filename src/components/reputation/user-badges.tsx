import { cn } from "@/lib/utils"
import { getUserBadges, type UserStatsForBadges, type BadgeInfo } from "@/lib/reputation"
import {
  PenSquare,
  MessageSquare,
  Heart,
  BookOpen,
  Users,
  Pin,
  Shield,
  Lock,
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PenSquare,
  MessageSquare,
  Heart,
  BookOpen,
  Users,
  Pin,
  Shield,
}

interface UserBadgesProps {
  stats: UserStatsForBadges
  className?: string
  showLocked?: boolean
}

/**
 * 用户成就徽章展示
 * 已获得的徽章高亮显示，未获得的灰色锁定
 */
export function UserBadges({ stats, className, showLocked = true }: UserBadgesProps) {
  const badges = getUserBadges(stats)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          成就徽章
        </h3>
        <span className="text-xs text-stone-400 dark:text-stone-500">
          {earnedCount} / {badges.length}
        </span>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
        {badges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} showLocked={showLocked} />
        ))}
      </div>
    </div>
  )
}

function BadgeItem({ badge, showLocked }: { badge: BadgeInfo; showLocked: boolean }) {
  const Icon = iconMap[badge.icon] ?? Lock

  if (!badge.earned && !showLocked) return null

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 text-center group relative",
        !badge.earned && "opacity-40"
      )}
      title={badge.description}
    >
      <div
        className={cn(
          "h-11 w-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110",
          badge.earned
            ? cn(badge.bgColor, "border-current/20", badge.color)
            : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-600"
        )}
      >
        {badge.earned ? (
          <Icon className="h-5 w-5" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </div>
      <span
        className={cn(
          "text-[10px] leading-tight",
          badge.earned
            ? "text-stone-600 dark:text-stone-300"
            : "text-stone-400 dark:text-stone-600"
        )}
      >
        {badge.name}
      </span>

      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="whitespace-nowrap rounded-md bg-stone-900 dark:bg-stone-700 px-2 py-1 text-[10px] text-white shadow-lg">
          {badge.description}
        </div>
      </div>
    </div>
  )
}
