'use client'

/**
 * Cosmic background component for VK Mini App
 * Simplified version optimized for VK web view
 */
import React, { useEffect, useRef } from 'react'

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create stars
    const stars: Array<{
      x: number
      y: number
      radius: number
      opacity: number
      speed: number
    }> = []

    const starCount = 150 // Reduced for better performance in VK web view

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
      })
    }

    // Animation loop
    let animationId: number
    let rotation = 0

    const animate = () => {
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      rotation += 0.0005

      // Draw stars
      stars.forEach((star) => {
        // Rotate stars
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const dx = star.x - centerX
        const dy = star.y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const angle = Math.atan2(dy, dx) + rotation

        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.02
        star.opacity = Math.max(0.2, Math.min(0.8, star.opacity))

        ctx.beginPath()
        ctx.arc(x, y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()

        // Add glow for larger stars
        if (star.radius > 1) {
          ctx.beginPath()
          ctx.arc(x, y, star.radius * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(212, 175, 55, ${star.opacity * 0.2})`
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#050505' }}
    />
  )
}
