'use client'

/**
 * Z-Scroll container component for VK Mini App
 * Uses design system components and tokens
 */
import React, { useEffect, useRef, useState } from 'react'
import { Card } from '@mirastros-universal/design-system'

interface ZScrollContainerProps {
  children: React.ReactNode
}

export function ZScrollContainer({ children }: ZScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0

      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <>
      {/* Scroll progress indicator using design system colors */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-800/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-gold-500 to-turquoise-400 transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main container */}
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </>
  )
}

interface ZScrollSectionProps {
  children: React.ReactNode
  index: number
}

export function ZScrollSection({ children, index }: ZScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scale, setScale] = useState(0.8)
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const sectionMiddle = rect.top + rect.height / 2

      // Check if section is in viewport
      const inViewport = rect.top < windowHeight && rect.bottom > 0
      setIsVisible(inViewport)

      if (inViewport) {
        // Calculate progress through viewport (0 to 1)
        const progress = 1 - Math.abs(sectionMiddle - windowHeight / 2) / (windowHeight / 2)
        const clampedProgress = Math.max(0, Math.min(1, progress))

        // Animations using design system timing
        setScale(0.8 + clampedProgress * 0.2) // Scale from 0.8 to 1.0
        setOpacity(clampedProgress)
      } else {
        setScale(0.8)
        setOpacity(0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      ref={sectionRef}
      className="min-h-screen flex items-center justify-center p-6 transition-all duration-500"
      style={{
        transform: `scale(${scale})`,
        opacity: opacity,
      }}
    >
      {children}
    </div>
  )
}

interface ZScrollCardProps {
  children: React.ReactNode
  className?: string
}

export function ZScrollCard({ children, className = '' }: ZScrollCardProps) {
  return (
    <Card
      variant="elevated"
      className={`
        max-w-md w-full
        ${className}
      `}
    >
      {children}
    </Card>
  )
}
