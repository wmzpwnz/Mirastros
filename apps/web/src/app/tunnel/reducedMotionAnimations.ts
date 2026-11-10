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
    const activate = () => {
      slides.forEach(item => item.classList.remove('active'));
      slide.classList.add('active');
    };
    registerTrigger(ScrollTrigger.create({ trigger: document.body, start: `${start}px top`, end: `${end}px top`, onEnter: activate, onEnterBack: activate }));
  });
}
