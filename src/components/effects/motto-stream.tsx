"use client"

import { useIntersection } from "@/hooks/use-intersection"
import { cn } from "@/lib/utils"

interface MottoStreamProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
}

const sizeMap = {
  sm: "text-xl sm:text-2xl",
  md: "text-2xl sm:text-3xl md:text-4xl",
  lg: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl",
  xl: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
}

export function MottoStream({ className, size = "lg", animated = true }: MottoStreamProps) {
  const [ref, isVisible] = useIntersection<HTMLDivElement>({ threshold: 0.3 })
  const motto = "本固枝盛，学富国强"
  const chars = motto.split("")

  return (
    <div ref={ref} className={cn("font-serif tracking-wider", className)}>
      <div className={cn("flex justify-center flex-wrap", sizeMap[size])}>
        {chars.map((char, index) => (
          <span
            key={index}
            className={cn(
              "inline-block transition-all duration-700",
              animated && "opacity-0 translate-y-4",
              isVisible && "opacity-100 translate-y-0",
              char === "，" ? "mx-1 sm:mx-2" : ""
            )}
            style={{
              transitionDelay: animated ? `${index * 0.12}s` : "0s",
              color: "#d4af37",
              textShadow: "0 0 40px rgba(212, 175, 55, 0.15)",
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}
