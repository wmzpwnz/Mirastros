'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface LenisProviderProps {
  children: ReactNode;
}

export const LenisProvider = ({ children }: LenisProviderProps) => {
  useEffect(() => {
    // Инициализация Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Добавить класс к HTML
    document.documentElement.classList.add('lenis');

    // Синхронизация с GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Пересчёт размеров при инициализации tunnel (body.height меняется динамически)
    const onTunnelInit = () => {
      requestAnimationFrame(() => lenis.resize());
    };
    window.addEventListener('tunnel-initialized', onTunnelInit);

    // Cleanup
    return () => {
      window.removeEventListener('tunnel-initialized', onTunnelInit);
      gsap.ticker.remove(raf);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  return <>{children}</>;
};
