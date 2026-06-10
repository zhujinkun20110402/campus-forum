"use client"

import { useIntersection } from "@/hooks/use-intersection"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  duration?: number
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 0.6,
}: ScrollRevealProps) {
  const [ref, isVisible] = useIntersection<HTMLDivElement>({ threshold: 0.1 })

  const directionMap = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all",
        directionMap[direction],
        "opacity-0",
        isVisible && "translate-x-0 translate-y-0 opacity-100",
        className
      )}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  )
}
