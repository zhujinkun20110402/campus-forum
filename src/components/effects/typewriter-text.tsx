"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  texts: string[]
  speed?: number
  pause?: number
  className?: string
}

export function TypewriterText({
  texts,
  speed = 80,
  pause = 2000,
  className = "",
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("")
  const [textIndex, setTextIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const currentText = texts[textIndex]

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentText.length) {
            setDisplayText(currentText.slice(0, displayText.length + 1))
          } else {
            setTimeout(() => setIsDeleting(true), pause)
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.slice(0, -1))
          } else {
            setIsDeleting(false)
            setTextIndex((prev) => (prev + 1) % texts.length)
          }
        }
      },
      isDeleting ? speed / 2 : speed
    )

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, textIndex, texts, speed, pause])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={className}>
      {displayText}
      <span
        className={`inline-block w-[2px] h-[1em] ml-0.5 align-middle transition-opacity duration-100 ${
          showCursor ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundColor: "currentColor" }}
      />
    </span>
  )
}
