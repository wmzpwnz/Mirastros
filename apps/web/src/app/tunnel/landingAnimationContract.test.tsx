import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { HeroSection } from '../../components/sections/HeroSection';
import { createLandingAnimations } from './landingAnimations';
import type { TunnelAnimationContext } from '../../hooks/useZScrollTunnel';
const m = vi.hoisted(() => ({ set: vi.fn() }));
vi.mock('gsap', () => ({ gsap: { set: m.set, timeline: () => ({ set() { return this; }, to() { return this; }, from() { return this; }, fromTo() { return this; } }) } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { create: vi.fn(() => ({ kill: vi.fn() })) } }));
beforeEach(() => { vi.clearAllMocks(); vi.stubGlobal('innerWidth', 390); vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function initialize(reducedMotion: boolean) {
  const { container } = render(<HeroSection />);
  const hero = container.querySelector<HTMLElement>('#hero')!;
  const shop = document.createElement('section'); shop.className = 'mira-section'; shop.id = 'shop'; container.appendChild(shop);
  const context: TunnelAnimationContext = { slides: [hero, shop], totalSlides: 2, scrollPerSlide: 1000, overlap: 1.82, isMobile: true, isLiteMode: true, reducedMotion, registerTimeline: tl => tl, registerTrigger: trigger => trigger };
  const media = Array.from({ length: 6 }, (_, i) => ({ webm: `/${i}.webm`, mp4: `/${i}.mp4` }));
  createLandingAnimations({ mediaTrack: media })(context);
  return hero;
}
it('the real landing markup supports the original bounded mobile portal fly-through', () => {
  const hero = initialize(false);
  const videos = hero.querySelectorAll<HTMLVideoElement>('.hero-flying-gifs .hero-flying-gif');
  expect(videos).toHaveLength(4);
  expect([...videos].every(video => video.muted && video.playsInline && video.querySelectorAll('source').length === 2)).toBe(true);
});
it('reduced motion retains the screen scene without generating flying video layers', () => {
  const hero = initialize(true);
  expect(hero.querySelectorAll('.hero-flying-gif')).toHaveLength(0);
  expect(m.set).toHaveBeenCalledWith(hero, expect.objectContaining({ scale: 1, x: 0, filter: 'none' }));
});
