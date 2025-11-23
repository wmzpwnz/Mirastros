'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { HeroSection } from '../components/sections/HeroSection';
import { TarotSection } from '../components/sections/TarotSection';
import { HoroscopeSection } from '../components/sections/HoroscopeSection';
import { NatalSection } from '../components/sections/NatalSection';

export default function Home() {
  useEffect(() => {
    // Load GSAP and ScrollTrigger from CDN
    const loadScripts = async () => {
      // Load GSAP
      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      document.body.appendChild(gsapScript);

      await new Promise(resolve => gsapScript.onload = resolve);

      // Load ScrollTrigger
      const stScript = document.createElement('script');
      stScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
      document.body.appendChild(stScript);

      await new Promise(resolve => stScript.onload = resolve);

      // Initialize after all scripts loaded
      initSageEastScroll();
    };

    function initSageEastScroll() {
      if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
        setTimeout(initSageEastScroll, 100);
        return;
      }

      const { gsap, ScrollTrigger } = window;
      gsap.registerPlugin(ScrollTrigger);

      // Z-Scroll Gallery Effect
      const slides = gsap.utils.toArray('.mira-section');
      const totalSlides = slides.length;
      const vh = window.innerHeight;
      const scrollPerSlide = vh;
      const totalHeight = totalSlides * scrollPerSlide;

      // Set body height for scroll
      document.body.style.height = `${totalHeight}px`;

      console.log(`Z-Scroll: ${totalSlides} slides, ${totalHeight}px total height`);

      // 1. INITIAL SETUP
      slides.forEach((slide: any, i: number) => {
        let startX = 0;
        if (i > 0) {
          // Zig-zag positioning: odd slides from left, even from right
          startX = (i % 2 !== 0) ? -25 : 25; // vw units
        }

        if (i === 0) {
          // First slide visible
          gsap.set(slide, {
            opacity: 1,
            scale: 1,
            x: 0,
            zIndex: 100,
            filter: 'blur(0px)'
          });
        } else {
          // Other slides start small, blurred, offset
          gsap.set(slide, {
            opacity: 0,
            scale: 0.4,
            x: `${startX}vw`,
            zIndex: 100 - i,
            filter: 'blur(20px)'
          });
        }
      });

      // 2. ANIMATION LOOP
      slides.forEach((slide: any, i: number) => {
        const startScroll = i * scrollPerSlide;
        const endScroll = (i + 1) * scrollPerSlide;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: `${startScroll}px top`,
            end: `${endScroll}px top`,
            scrub: 0.5,
          }
        });

        // PHASE 1: ENTER (for slides after the first)
        if (i > 0) {
          tl.fromTo(slide,
            {
              opacity: 0,
              scale: 0.4,
              filter: 'blur(20px)'
            },
            {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power1.out',
              duration: 0.5
            },
            0
          );
        }

        // PHASE 2: EXIT (all slides zoom out and blur)
        tl.to(slide, {
          scale: 2.5,
          opacity: 0,
          filter: 'blur(10px)',
          ease: 'power1.in',
          duration: 0.5
        }, i === 0 ? 0 : 0.5);
      });

      // 3. SCROLL PROGRESS
      const scrollPercent = document.getElementById('scrollPercent');
      if (scrollPercent) {
        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self: any) => {
            const percentage = Math.round(self.progress * 100);
            scrollPercent.textContent = `${percentage}%`;
          }
        });
      }
    }

    loadScripts();

    return () => {
      // Cleanup
      if (window.ScrollTrigger) {
        window.ScrollTrigger.getAll().forEach((t: any) => t.kill());
      }
    };
  }, []);

  return (
    <>
      {/* Fixed Viewport for Z-Scroll */}
      <main className="viewport">
        <HeroSection id="hero" />
        <TarotSection id="tarot" />
        <HoroscopeSection id="horoscope" />
        <NatalSection id="natal" />
      </main>

      {/* Scroll Indicator */}
      <div className="scroll-indicator-bottom">
        <span>SCROLL</span>
        <span className="scroll-percent" id="scrollPercent">0%</span>
      </div>
    </>
  );
}

// Declare global types
declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}
