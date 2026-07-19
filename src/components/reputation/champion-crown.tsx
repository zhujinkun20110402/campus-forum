import { Crown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function ChampionCrown({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("champion-crown-cluster relative flex items-center justify-center", compact ? "h-10 w-12" : "h-16 w-20", className)} aria-label="校园声望榜第一名">
      <Sparkles className="champion-spark champion-spark-one absolute left-0 top-1 h-4 w-4" />
      <Crown className={cn("champion-crown relative z-10", compact ? "h-8 w-8" : "h-12 w-12")} strokeWidth={1.8} />
      <Sparkles className="champion-spark champion-spark-two absolute bottom-0 right-0 h-4 w-4" />
    </div>
  )
}
