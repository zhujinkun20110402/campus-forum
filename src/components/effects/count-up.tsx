"use client"

import { useCountUp } from "@/hooks/use-count-up"
import { useIntersection } from "@/hooks/use-intersection"
import { cn } from "@/lib/utils"

interface CountUpProps {
  end: number
  duration?: number
  className?: string
  suffix?: string
  prefix?: string
}

export function CountUp({
  end,
  duration = 2000,
  className,
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [ref, isVisible] = useIntersection<HTMLSpanElement>({ threshold: 0.5 })
  const { count, hasFinished } = useCountUp(end, {
    duration,
    enabled: isVisible,
  })

  const formatted = new Intl.NumberFormat("zh-CN").format(count)

  return (
    <span
      ref={ref}
      className={cn(
        "font-mono tabular-nums inline-block transition-transform",
        hasFinished && "scale-105",
        className
      )}
      style={{
        transitionDuration: "0.3s",
        transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
