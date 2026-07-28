import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/ui/safe-image"
import { Crown } from "lucide-react"
import { getStatusTextColor } from "@/lib/status-constants"

interface UserAvatarProps {
  name: string | null | undefined
  image: string | null | undefined
  role?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  status?: { color: string; emoji: string | null } | null
}

const sizeMap = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-24 w-24 text-2xl",
}

const crownSizeMap = {
  sm: "h-3 w-3 -top-0.5 -right-0.5",
  md: "h-3.5 w-3.5 -top-1 -right-1",
  lg: "h-4 w-4 -top-1 -right-1",
  xl: "h-6 w-6 -top-1.5 -right-1.5",
}

const imageSizeMap = {
  sm: "28px",
  md: "40px",
  lg: "44px",
  xl: "96px",
}

const emojiSizeMap = {
  sm: "-bottom-1 -right-1 min-h-4 min-w-4 px-0.5 text-[9px]",
  md: "-bottom-1.5 -right-1.5 min-h-5 min-w-5 px-0.5 text-[11px]",
  lg: "-bottom-1.5 -right-1.5 min-h-5 min-w-5 px-0.5 text-xs",
  xl: "-bottom-2 -right-2 min-h-7 min-w-7 px-1 text-base",
}

export function UserAvatar({
  name,
  image,
  role,
  size = "md",
  className,
  status,
}: UserAvatarProps) {
  const isAdmin = role === "ADMIN"
  const initials = (name ?? "?").charAt(0)

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full border-2 bg-stone-200 font-medium text-stone-600 dark:bg-stone-700 dark:text-stone-300",
          status ? "border-current" : "border-stone-100 dark:border-stone-800",
          sizeMap[size]
        )}
        style={status ? { borderColor: status.color, boxShadow: `0 0 0 2px ${status.color}45` } : undefined}
      >
        {image ? (
          <SafeImage
            src={image}
            alt={name ?? "用户头像"}
            fill
            sizes={imageSizeMap[size]}
            fallback={initials}
            className="object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {isAdmin && (
        <div
          className={cn(
            "absolute rounded-full bg-amber-400 text-[#0a0a0a] p-0.5 shadow-sm flex items-center justify-center z-10",
            crownSizeMap[size]
          )}
          title="管理员"
        >
          <Crown className="h-full w-full" />
        </div>
      )}
      {status?.emoji && (
        <span
          className={cn(
            "absolute z-20 flex items-center justify-center rounded-full border border-[#191914] bg-[#fffaf0] leading-none text-[#191914] dark:border-[#f5f0e5]",
            emojiSizeMap[size]
          )}
          style={{ backgroundColor: status.color, color: getStatusTextColor(status.color) }}
          title="24 小时状态"
        >
          {status.emoji}
        </span>
      )}
    </div>
  )
}
