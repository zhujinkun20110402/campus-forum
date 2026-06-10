"use client"

import Image from "next/image"
import { useState } from "react"

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fallback?: string
}

export function SafeImage({ src, alt, fill, width, height, className, priority, fallback }: SafeImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    if (fallback) {
      return (
        <div className={className}>
          <span className="flex h-full w-full items-center justify-center text-sm font-bold text-gold-400">
            {fallback}
          </span>
        </div>
      )
    }
    return null
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  )
}
