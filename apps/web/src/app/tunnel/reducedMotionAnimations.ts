import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TunnelAnimationContext } from '../../hooks/useZScrollTunnel';
import { getSectionRange } from '../../utils/tunnelScrollMath';

/** Keep section navigation while replacing spatial travel with a short fade. */
export function createReducedMotionAnimations(ctx: TunnelAnimationContext) {
  const { slides, scrollPerSlide, overlap, registerTimeline, registerTrigger } = ctx;
  slides.forEach((slide, index) => {
    gsap.set(slide, { opacity: index === 0 ? 1 : 0, scale: 1, x: 0, filter: 'none', zIndex: 100 - index });
    gsap.set(slide.querySelectorAll('.hero-bg-wrapper, .hero-logo-buttons-group, .hero-subtitle-text, .section-media-card, .section-text-card, .section-category, .shop-bg-wrapper, .shop-welcome-content'), { clearProps: 'transform,filter,opacity' });
    const { start, end } = getSectionRange(index, scrollPerSlide, overlap);
    const tl = registerTimeline(gsap.timeline({ scrollTrigger: { trigger: document.body, start: `${start}px top`, end: `${end}px top`, scrub: true } }));
    if (index !== 0) tl.to(slide, { opacity: 1, duration: .12, ease: 'none' }, 0);
    if (index !== slides.length - 1) tl.to(slide, { opacity: 0, duration: .12, ease: 'none' }, .88);

  });
  // Overlapping timelines cannot each own pointer activation. In particular,
  // rebuilding at a later scene and returning to the start must restore CTA clicks.
  const updateActive = () => {
    let active = 0;
    for (let index = 0; index < slides.length - 1; index++) {
      const { start, end } = getSectionRange(index, scrollPerSlide, overlap);
      if (window.scrollY < start + (end - start) * .94) break;
      active = index + 1;
    }
    slides.forEach((slide, index) => slide.classList.toggle('active', index === active));
  };
  registerTrigger(ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: updateActive, onRefresh: updateActive }));
  updateActive();
}
