import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/ui/safe-image"
import { Crown } from "lucide-react"

interface UserAvatarProps {
  name: string | null | undefined
  image: string | null | undefined
  role?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
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

export function UserAvatar({
  name,
  image,
  role,
  size = "md",
  className,
}: UserAvatarProps) {
  const isAdmin = role === "ADMIN"
  const initials = (name ?? "?").charAt(0)

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full ring-2 ring-stone-100 dark:ring-stone-800 bg-stone-200 dark:bg-stone-700 flex items-center justify-center font-medium text-stone-600 dark:text-stone-300",
          sizeMap[size]
        )}
      >
        {image ? (
          <SafeImage src={image} alt={name ?? ""} fill className="object-cover" />
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
    </div>
  )
}
