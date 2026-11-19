'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  getScrollPerSlide,
  getTotalHeight,
  TUNNEL_OVERLAP,
} from '../utils/tunnelScrollMath';
import { isTunnelLiteMode } from '../utils/tunnelPerf';

export interface TunnelAnimationContext {
  slides: HTMLElement[];
  totalSlides: number;
  scrollPerSlide: number;
  overlap: number;
  isLiteMode: boolean;
  isMobile: boolean;
  reducedMotion: boolean;
  registerTrigger: (trigger: ScrollTrigger) => ScrollTrigger;
  registerTimeline: (timeline: gsap.core.Timeline) => gsap.core.Timeline;
}

interface UseZScrollTunnelOptions {
  enabled: boolean;
  enableMobile: boolean;
  desktopMinWidth: number;
  expectedFirstSlideId?: string;
  expectedLastSlideId?: string;
  overlap?: number;
  onInit: (ctx: TunnelAnimationContext) => void;
}

const TUNNEL_SECTION_SELECTOR = '.mira-section';

export const useZScrollTunnel = ({
  enabled,
  enableMobile,
  desktopMinWidth,
  expectedFirstSlideId,
  expectedLastSlideId,
  overlap = TUNNEL_OVERLAP,
  onInit,
}: UseZScrollTunnelOptions) => {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const createdTriggers: ScrollTrigger[] = [];
    const createdTimelines: gsap.core.Timeline[] = [];

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let retryInitTimer: ReturnType<typeof setTimeout> | null = null;
    let preloaderObserver: MutationObserver | null = null;
    let currentScrollPerSlide: number | null = null;
    let touchNormalizer: ReturnType<typeof ScrollTrigger.normalizeScroll>;
    let layoutWidth = window.innerWidth;
    let layoutHeight = window.innerHeight;

    const root = document.documentElement;
    const body = document.body;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const clearModeClasses = () => {
      body.classList.remove('zscroll-enabled');
      body.classList.remove('zscroll-disabled');
    };

    const setModeClass = (isEnabled: boolean) => {
      clearModeClasses();
      body.classList.add(isEnabled ? 'zscroll-enabled' : 'zscroll-disabled');
    };

    const updateAppVh = () => {
      const visualViewportHeight = window.visualViewport?.height;
      const value = visualViewportHeight ?? window.innerHeight;
      root.style.setProperty('--app-vh', `${Math.round(value)}px`);
    };

    const killRegisteredAnimations = () => {
      document.querySelectorAll<HTMLVideoElement>('.hero-flying-gif').forEach(video => {
        video.pause();
        video.removeAttribute('src');
        video.querySelectorAll('source').forEach(source => source.remove());
        video.load();
        video.remove();
      });
      if (touchNormalizer) {
        if (ScrollTrigger.normalizeScroll() === touchNormalizer) ScrollTrigger.normalizeScroll(false);
        else touchNormalizer.kill();
        touchNormalizer = undefined;
      }
      createdTimelines.forEach((timeline) => {
        try {
          timeline.kill();
        } catch (error) {
          console.warn('[useZScrollTunnel] timeline.kill failed', error);
        }
      });
      createdTimelines.length = 0;

      const uniqueTriggers = Array.from(new Set(createdTriggers));
      uniqueTriggers.forEach((trigger) => {
        try {
          trigger.kill();
        } catch (error) {
          console.warn('[useZScrollTunnel] trigger.kill failed', error);
        }
      });
      createdTriggers.length = 0;
    };

    const resetSlideState = () => {
      const slides = gsap.utils.toArray<HTMLElement>(TUNNEL_SECTION_SELECTOR);
      gsap.killTweensOf(slides);
      slides.forEach((slide) => {
        gsap.set(slide, {
          clearProps: 'transform,filter,opacity,x,scale,zIndex',
        });
      });
    };

    const hardCleanup = ({ removeClasses = false }: { removeClasses?: boolean } = {}) => {
      killRegisteredAnimations();
      body.style.height = '';
      resetSlideState();

      if (removeClasses) {
        clearModeClasses();
      }
    };

    const isDesktopViewport = () => window.innerWidth >= desktopMinWidth;

    const canEnableTunnel = () => {
      if (!enabled) return false;
      if (isDesktopViewport()) return true;
      return enableMobile;
    };

    const registerTrigger = (trigger: ScrollTrigger) => {
      createdTriggers.push(trigger);
      return trigger;
    };

    const registerTimeline = (timeline: gsap.core.Timeline) => {
      createdTimelines.push(timeline);
      if (timeline.scrollTrigger) {
        createdTriggers.push(timeline.scrollTrigger);
      }
      return timeline;
    };

    const initTunnel = () => {
      updateAppVh();
      if (retryInitTimer) {
        clearTimeout(retryInitTimer);
        retryInitTimer = null;
      }
      killRegisteredAnimations();
      resetSlideState();

      if (!canEnableTunnel()) {
        body.style.height = '';
        setModeClass(false);
        ScrollTrigger.refresh();
        window.dispatchEvent(new CustomEvent('tunnel-initialized'));
        return;
      }

      const slides = gsap.utils.toArray<HTMLElement>(TUNNEL_SECTION_SELECTOR);
      if (!slides.length) {
        retryInitTimer = setTimeout(initTunnel, 100);
        return;
      }

      const firstSlideReady = !expectedFirstSlideId || slides[0]?.id === expectedFirstSlideId;
      const lastSlideReady =
        !expectedLastSlideId || slides[slides.length - 1]?.id === expectedLastSlideId;

      if (!firstSlideReady || !lastSlideReady) {
        retryInitTimer = setTimeout(initTunnel, 100);
        return;
      }

      const viewportHeight = window.innerHeight;
      const scrollPerSlide = getScrollPerSlide(viewportHeight);
      currentScrollPerSlide = scrollPerSlide;
      layoutWidth = window.innerWidth;
      layoutHeight = viewportHeight;
      const totalHeight = getTotalHeight(slides.length, viewportHeight, overlap);

      body.style.height = `${totalHeight}px`;

      const animationContext: TunnelAnimationContext = {
        slides,
        totalSlides: slides.length,
        scrollPerSlide,
        overlap,
        isLiteMode: isTunnelLiteMode(),
        isMobile: !isDesktopViewport(),
        reducedMotion: reducedMotion.matches,
        registerTrigger,
        registerTimeline,
      };

      onInit(animationContext);

      setModeClass(true);
      ScrollTrigger.refresh();
      if (!isDesktopViewport()) {
        // GSAP's touch normalizer works around Safari scroll/pinning quirks.
        // https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.normalizeScroll()/
        touchNormalizer = ScrollTrigger.normalizeScroll({ type: 'touch', allowNestedScroll: true });
      }
      window.dispatchEvent(new CustomEvent('tunnel-initialized'));
    };

    const initAfterPreloader = () => {
      if (preloaderObserver) {
        preloaderObserver.disconnect();
        preloaderObserver = null;
      }

      if (!body.classList.contains('preloader-active')) {
        initTunnel();
        return;
      }

      preloaderObserver = new MutationObserver(() => {
        if (!body.classList.contains('preloader-active')) {
          preloaderObserver?.disconnect();
          preloaderObserver = null;
          initTunnel();
        }
      });

      preloaderObserver.observe(body, {
        attributes: true,
        attributeFilter: ['class'],
      });
    };

    const scheduleRebuild = () => {
      updateAppVh();
      if (resizeTimer) clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        // Browser chrome and orientation changes alter the mobile viewport.
        // Preserve the position within the scene rather than jumping sections.
        const progress = body.classList.contains('zscroll-enabled') && currentScrollPerSlide
          ? window.scrollY / currentScrollPerSlide : null;
        initAfterPreloader();
        if (progress !== null && body.classList.contains('zscroll-enabled') && currentScrollPerSlide) {
          window.scrollTo({ top: progress * currentScrollPerSlide, behavior: 'auto' });
          ScrollTrigger.update();
        }
      }, 150);
    };

    const handleResize = () => {
      // Safari address-bar changes must not tear down a gesture in progress.
      if (!isDesktopViewport() && body.classList.contains('zscroll-enabled') &&
          Math.abs(window.innerWidth - layoutWidth) <= 1 &&
          Math.abs(window.innerHeight - layoutHeight) < layoutHeight * .25) {
        updateAppVh();
        return;
      }
      scheduleRebuild();
    };

    updateAppVh();
    initAfterPreloader();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);
    reducedMotion.addEventListener('change', scheduleRebuild);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (retryInitTimer) clearTimeout(retryInitTimer);

      if (preloaderObserver) {
        preloaderObserver.disconnect();
      }

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
      reducedMotion.removeEventListener('change', scheduleRebuild);

      hardCleanup({ removeClasses: true });
      root.style.removeProperty('--app-vh');
    };
  }, [enabled, enableMobile, desktopMinWidth, overlap, onInit]);
};
