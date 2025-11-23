'use client'

/**
 * Lightweight cosmic background for Telegram Mini App
 * CSS-based animation instead of Three.js for better mobile performance
 */
import React from 'react'

export function CosmicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-deep/50 via-black to-purple-deep/30" />
      
      {/* Animated stars */}
      <div className="stars-layer-1" />
      <div className="stars-layer-2" />
      <div className="stars-layer-3" />
      
      {/* Radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-light/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <style jsx>{`
        .stars-layer-1,
        .stars-layer-2,
        .stars-layer-3 {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 60%, white, transparent),
            radial-gradient(1px 1px at 33% 80%, white, transparent),
            radial-gradient(1px 1px at 15% 90%, white, transparent);
          background-size: 200% 200%;
          opacity: 0.5;
        }
        
        .stars-layer-1 {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .stars-layer-2 {
          animation: twinkle 4s ease-in-out infinite;
          animation-delay: 1s;
          opacity: 0.3;
        }
        
        .stars-layer-3 {
          animation: twinkle 5s ease-in-out infinite;
          animation-delay: 2s;
          opacity: 0.2;
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  )
}
