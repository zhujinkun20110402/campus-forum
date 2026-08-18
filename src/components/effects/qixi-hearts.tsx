"use client"

import { useEffect, useRef } from "react"

interface HeartParticle {
  x: number
  y: number
  size: number
  speedY: number
  sway: number
  swaySpeed: number
  phase: number
  opacity: number
  color: string
}

const HEART_COLORS = ["#ff6b43", "#ffb4aa", "#d9ef61", "#f3c84b", "#e4532f"]

/** 用经典心形参数方程描出轮廓（居中、尖角朝下）。 */
function traceHeart(ctx: CanvasRenderingContext2D, size: number) {
  ctx.beginPath()
  for (let t = 0; t <= Math.PI * 2 + 0.01; t += 0.12) {
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    const px = (x / 32) * size
    const py = (y / 32) * size - size * 0.08
    if (t === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

export function QixiHearts({
  density = 26,
  className = "absolute inset-0 h-full w-full pointer-events-none",
}: {
  density?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let animationId: number
    let particles: HeartParticle[] = []
    let width = 0
    let height = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const createParticles = () => {
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * (width || 1),
        y: Math.random() * (height || 1),
        size: 5 + Math.random() * 11,
        speedY: 0.15 + Math.random() * 0.4,
        sway: 8 + Math.random() * 22,
        swaySpeed: 0.004 + Math.random() * 0.012,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.16 + Math.random() * 0.28,
        color: HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
      }))
    }

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.y -= p.speedY
        p.phase += p.swaySpeed
        const x = p.x + Math.sin(p.phase) * p.sway
        if (p.y < -p.size * 2) {
          p.y = height + p.size * 2
          p.x = Math.random() * width
        }
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.translate(x, p.y)
        ctx.rotate(Math.sin(p.phase) * 0.35)
        traceHeart(ctx, p.size)
        ctx.fill()
        ctx.restore()
      }
    }

    const loop = () => {
      drawFrame()
      animationId = requestAnimationFrame(loop)
    }

    const handleResize = () => {
      resize()
      createParticles()
    }

    resize()
    createParticles()
    if (reducedMotion) {
      drawFrame()
    } else {
      animationId = requestAnimationFrame(loop)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [density])

  return <canvas ref={canvasRef} aria-hidden className={className} />
}
