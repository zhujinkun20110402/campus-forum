"use client"

import { cn } from "@/lib/utils"
import { SafeImage } from "@/components/ui/safe-image"

const PRESET_AVATARS = Array.from({ length: 8 }, (_, i) => ({
  id: `avatar-${String(i + 1).padStart(2, "0")}`,
  url: `/avatars/avatar-${String(i + 1).padStart(2, "0")}.svg`,
  label: `头像 ${i + 1}`,
}))

interface AvatarSelectorProps {
  value: string
  onChange: (url: string) => void
}

export function AvatarSelector({ value, onChange }: AvatarSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-center font-mono text-[9px] font-bold tracking-[0.14em] text-[#777268] dark:text-[#aaa69c]">
        选择头像
      </p>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {PRESET_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.url)}
            className={cn(
              "relative aspect-square overflow-hidden border-2 border-[#191914] bg-[#fffaf0] transition-all duration-200 dark:border-[#f5f0e5] dark:bg-[#191914]",
              "hover:-rotate-3 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#ff6b43] focus:ring-offset-2 dark:focus:ring-offset-[#191914]",
              value === avatar.url
                ? "-rotate-2 scale-105 bg-[#d9ef61] shadow-[4px_4px_0_#191914] dark:shadow-[4px_4px_0_#f5f0e5]"
                : "opacity-65 hover:opacity-100"
            )}
            title={avatar.label}
          >
            <SafeImage
              src={avatar.url}
              alt={avatar.label}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export { PRESET_AVATARS }
