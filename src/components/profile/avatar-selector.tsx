"use client"

import { cn } from "@/lib/utils"

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
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        选择头像
      </p>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {PRESET_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.url)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-full transition-all duration-200",
              "hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
              value === avatar.url
                ? "ring-2 ring-blue-600 dark:ring-blue-400 ring-offset-2 dark:ring-offset-gray-900 scale-105 shadow-md"
                : "ring-1 ring-gray-200 dark:ring-gray-700 opacity-70 hover:opacity-100"
            )}
            title={avatar.label}
          >
            <img
              src={avatar.url}
              alt={avatar.label}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export { PRESET_AVATARS }