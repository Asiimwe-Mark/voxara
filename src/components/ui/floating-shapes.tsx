"use client"

import { useEffect, useRef } from 'react'

interface FloatingShape {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  color: string
}

interface FloatingShapesProps {
  className?: string
  count?: number
}

export function FloatingShapes({ className = "", count = 6 }: FloatingShapesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shapesRef = useRef<FloatingShape[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const initShapes = () => {
      const shapes: FloatingShape[] = []
      const colors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
      
      for (let i = 0; i < count; i++) {
        shapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 60 + 20,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      shapesRef.current = shapes
    }

    const drawShape = (ctx: CanvasRenderingContext2D, shape: FloatingShape) => {
      ctx.globalAlpha = shape.opacity
      ctx.fillStyle = shape.color
      
      // Draw rounded rectangle as shape
      const radius = shape.size / 4
      ctx.beginPath()
      ctx.moveTo(shape.x + radius, shape.y)
      ctx.lineTo(shape.x + shape.size - radius, shape.y)
      ctx.quadraticCurveTo(shape.x + shape.size, shape.y, shape.x + shape.size, shape.y + radius)
      ctx.lineTo(shape.x + shape.size, shape.y + shape.size - radius)
      ctx.quadraticCurveTo(shape.x + shape.size, shape.y + shape.size, shape.x + shape.size - radius, shape.y + shape.size)
      ctx.lineTo(shape.x + radius, shape.y + shape.size)
      ctx.quadraticCurveTo(shape.x, shape.y + shape.size, shape.x, shape.y + shape.size - radius)
      ctx.lineTo(shape.x, shape.y + radius)
      ctx.quadraticCurveTo(shape.x, shape.y, shape.x + radius, shape.y)
      ctx.closePath()
      ctx.fill()
    }

    const animate = () => {
      if (!ctx || !canvas) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapesRef.current.forEach(shape => {
        // Update position
        shape.x += shape.speedX
        shape.y += shape.speedY

        // Bounce off walls
        if (shape.x <= 0 || shape.x + shape.size >= canvas.width) {
          shape.speedX *= -1
        }
        if (shape.y <= 0 || shape.y + shape.size >= canvas.height) {
          shape.speedY *= -1
        }

        // Keep shapes within bounds
        shape.x = Math.max(0, Math.min(shape.x, canvas.width - shape.size))
        shape.y = Math.max(0, Math.min(shape.y, canvas.height - shape.size))

        drawShape(ctx, shape)
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    initShapes()
    animate()

    window.addEventListener('resize', () => {
      resize()
      initShapes()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
