"use client"

import { useTheme } from "@/components/theme/theme-provider"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 border border-transparent text-[#5f5c54] hover:border-[#191914] hover:bg-[#f3c84b] hover:text-[#191914] dark:text-[#b4afa5] dark:hover:border-[#f5f0e5] dark:hover:bg-[#d9ef61] dark:hover:text-[#191914]"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
