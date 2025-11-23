'use client'

/**
 * Simplified Z-Scroll effect for Telegram Mini App
 * Optimized for mobile web view constraints
 */
import React, { useEffect, useRef, useState } from 'react'

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
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = Math.min(scrollTop / docHeight, 1)
      
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Scroll progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-purple-deep/30 z-50">
        <div
          className="h-full bg-gradient-to-r from-gold to-purple-light transition-all duration-300"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Content */}
      {children}
    </div>
  )
}

interface ZScrollSectionProps {
  children: React.ReactNode
  index: number
  className?: string
}

export function ZScrollSection({ children, index, className = '' }: ZScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '-10% 0px -10% 0px',
      }
    )

    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      // Calculate progress based on section position
      const sectionTop = rect.top
      const sectionHeight = rect.height
      
      // Progress from 0 (entering) to 1 (exiting)
      const progress = Math.max(
        0,
        Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight))
      )
      
      setScrollProgress(progress)
    }

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Calculate transform values based on scroll progress
  const opacity = isVisible ? Math.min(1, scrollProgress * 2) : 0
  const scale = 0.8 + scrollProgress * 0.2
  const translateY = (1 - scrollProgress) * 50
  
  // Alternate left/right positioning
  const translateX = index % 2 === 0 ? -20 + scrollProgress * 20 : 20 - scrollProgress * 20

  return (
    <div
      ref={sectionRef}
      className={`min-h-screen flex items-center justify-center p-6 ${className}`}
      style={{
        opacity,
        transform: `
          translateY(${translateY}px)
          translateX(${translateX}px)
          scale(${scale})
        `,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

interface ZScrollCardProps {
  children: React.ReactNode
  className?: string
}

export function ZScrollCard({ children, className = '' }: ZScrollCardProps) {
  return (
    <div
      className={`
        bg-purple-deep/30 backdrop-blur-sm
        rounded-2xl p-6
        border border-gold/20
        shadow-2xl shadow-purple-light/10
        ${className}
      `}
    >
      {children}
    </div>
  )
}
