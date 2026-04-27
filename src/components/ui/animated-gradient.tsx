"use client"

import { useEffect, useRef } from 'react'

interface AnimatedGradientProps {
  className?: string
  children?: React.ReactNode
}

export function AnimatedGradient({ className = "", children }: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let time = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const animate = () => {
      if (!ctx || !canvas) return
      
      time += 0.005

      // Create animated gradient
      const gradient = ctx.createLinearGradient(
        0, 
        0, 
        canvas.width * (0.5 + 0.5 * Math.sin(time)), 
        canvas.height * (0.5 + 0.5 * Math.cos(time))
      )

      const hue1 = (time * 20) % 360
      const hue2 = (hue1 + 60) % 360
      
      gradient.addColorStop(0, `hsla(${hue1}, 70%, 50%, 0.1)`)
      gradient.addColorStop(0.5, `hsla(${hue2}, 70%, 50%, 0.1)`)
      gradient.addColorStop(1, `hsla(${hue1 + 120}, 70%, 50%, 0.1)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationId = requestAnimationFrame(animate)
    }

    resize()
    animate()

    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.3 }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
