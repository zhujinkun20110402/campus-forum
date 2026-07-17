import { cn } from "@/lib/utils"
import { getLevelInfo, getLevelProgress, getDisplayRaputation } from "@/lib/reputation"
import { Crown, Sparkles } from "lucide-react"

interface ReputationBarProps {
  raputation: number
  role?: string | null
  className?: string
}

/**
 * 声望进度条组件
 * 显示当前等级、声望值、到下一级的进度
 */
export function ReputationBar({ raputation, role, className }: ReputationBarProps) {
  const info = getLevelInfo(raputation, role)
  const progress = getLevelProgress(raputation, role)
  const displayRep = getDisplayRaputation(raputation, role)
  const isAdmin = role === "ADMIN"
  const barColors = ["bg-[#777268]", "bg-[#3f8450]", "bg-[#849326]", "bg-[#d29b20]", "bg-[#a47537]", "bg-[#df6b35]", "bg-[#d94d5a]", "bg-[#f3c84b]"]
  const barColor = isAdmin ? "bg-[#ff6b43]" : barColors[Math.max(0, Math.min(info.level - 1, barColors.length - 1))]

  return (
    <div className={cn("rounded-2xl border p-5", info.borderColor, info.bgColor, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <Crown className={cn("h-5 w-5", info.color)} />
          ) : (
            <Sparkles className={cn("h-4 w-4", info.color)} />
          )}
          <div>
            <div className={cn("text-sm font-bold", info.color)}>
              {isAdmin ? "Lv.MAX" : `Lv.${info.level}`} · {info.title}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400">
              {displayRep} 声望
            </div>
          </div>
        </div>
        {!isAdmin && progress.next !== null && (
          <div className="text-right">
            <div className="text-[11px] text-stone-400 dark:text-stone-500">
              距下一级
            </div>
            <div className={cn("text-sm font-mono font-semibold", info.color)}>
              {progress.remaining}
            </div>
          </div>
        )}
        {isAdmin && (
          <div className="text-right">
            <div className="text-[11px] text-amber-500/70">特权</div>
            <div className="text-sm font-semibold text-amber-500">管理员</div>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="h-2 w-full overflow-hidden border border-[#191914]/20 bg-[#fffaf0]/60 dark:border-white/20 dark:bg-[#11110f]/50">
        <div
          className={cn(
            "h-full transition-all duration-700",
            barColor
          )}
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {!isAdmin && progress.next !== null && (
        <div className="flex items-center justify-between mt-1.5 text-[10px] text-stone-400 dark:text-stone-500">
          <span>{info.minRep}</span>
          <span>{info.maxRep}</span>
        </div>
      )}
    </div>
  )
}
