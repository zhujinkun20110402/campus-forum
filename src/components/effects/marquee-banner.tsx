"use client"

import { useEffect, useRef } from "react"

interface MarqueeBannerProps {
  items: string[]
  speed?: number
  className?: string
}

export function MarqueeBanner({
  items,
  speed = 30,
  className = "",
}: MarqueeBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let position = 0

    function animate() {
      if (!container) return
      position -= speed / 60
      const firstChild = container.firstElementChild as HTMLElement
      if (firstChild && Math.abs(position) >= firstChild.offsetWidth) {
        position += firstChild.offsetWidth
      }
      container.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [speed])

  const duplicatedItems = [...items, ...items, ...items]

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}>
      <div ref={containerRef} className="inline-flex">
        {duplicatedItems.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center px-8 text-sm font-medium tracking-wide"
          >
            <span className="mr-3 h-1.5 w-1.5 rounded-full bg-current opacity-50" />
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
