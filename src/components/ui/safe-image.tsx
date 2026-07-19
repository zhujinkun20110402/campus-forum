"use client"

import Image from "next/image"
import { useState } from "react"

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  fallback?: string
  onLoad?: () => void
  onError?: () => void
}

export function SafeImage({ src, alt, fill, width, height, sizes, className, priority, fallback, onLoad, onError }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const error = failedSrc === src

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
      sizes={sizes}
      className={className}
      priority={priority}
      onLoad={onLoad}
      onError={() => {
        setFailedSrc(src)
        onError?.()
      }}
    />
  )
}
