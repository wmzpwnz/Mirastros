'use client';

import { useEffect, ReactNode } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface LenisProviderProps { children: ReactNode; }

export const LenisProvider = ({ children }: LenisProviderProps) => {
  useEffect(() => {
    const touch = window.matchMedia('(pointer: coarse)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = () => {};
    const configure = () => {
      stop();
      stop = () => {};
      // Touch pages use native scrolling, or ScrollTrigger's touch normalizer
      // in a tunnel. Never attach a second scroll controller on top of it.
      if (touch.matches || reduce.matches) return;
      const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), orientation: 'vertical', gestureOrientation: 'vertical', smoothWheel: true, wheelMultiplier: 1, infinite: false });
      document.documentElement.classList.add('lenis');
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const onTunnelInit = () => requestAnimationFrame(() => lenis.resize());
      window.addEventListener('tunnel-initialized', onTunnelInit);
      stop = () => {
        window.removeEventListener('tunnel-initialized', onTunnelInit);
        gsap.ticker.remove(raf);
        lenis.destroy();
        document.documentElement.classList.remove('lenis');
      };
    };
    configure();
    touch.addEventListener('change', configure);
    reduce.addEventListener('change', configure);
    return () => { touch.removeEventListener('change', configure); reduce.removeEventListener('change', configure); stop(); };
  }, []);
  return <>{children}</>;
};
