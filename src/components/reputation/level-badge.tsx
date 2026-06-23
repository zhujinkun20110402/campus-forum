import { cn } from "@/lib/utils"
import { getLevelInfo, getDisplayRaputation, type LevelInfo } from "@/lib/reputation"
import { Crown } from "lucide-react"

interface LevelBadgeProps {
  raputation: number
  role?: string | null
  size?: "xs" | "sm" | "md"
  showTitle?: boolean
  className?: string
}

const sizeMap = {
  xs: "text-[9px] px-1.5 py-0.5 gap-0.5",
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1",
}

const crownSizeMap = {
  xs: "h-2 w-2",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
}

/**
 * 等级徽章组件
 * 在用户名旁显示等级，管理员显示 MAX + 皇冠
 */
export function LevelBadge({ raputation, role, size = "sm", showTitle = true, className }: LevelBadgeProps) {
  const info = getLevelInfo(raputation, role)
  const isAdmin = role === "ADMIN"
  const displayRep = getDisplayRaputation(raputation, role)

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium whitespace-nowrap",
        info.bgColor,
        info.borderColor,
        info.color,
        sizeMap[size],
        isAdmin && "ring-1 ring-amber-400/30",
        className
      )}
      title={`${info.title} · ${displayRep} 声望`}
    >
      {isAdmin && <Crown className={crownSizeMap[size]} />}
      <span>
        {isAdmin ? "MAX" : `Lv.${info.level}`}
      </span>
      {showTitle && size !== "xs" && (
        <span className="opacity-70">{info.title}</span>
      )}
    </span>
  )
}

/**
 * 获取等级信息（供其他组件使用）
 */
export { getLevelInfo }
export type { LevelInfo }
