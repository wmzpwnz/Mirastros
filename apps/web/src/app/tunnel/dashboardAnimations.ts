import { createReducedMotionAnimations } from './reducedMotionAnimations';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TunnelAnimationContext } from '../../hooks/useZScrollTunnel';
import { getSectionRange } from '../../utils/tunnelScrollMath';

export const createDashboardAnimations = () => {
  return (ctx: TunnelAnimationContext) => {
    if (ctx.reducedMotion) { createReducedMotionAnimations(ctx); return; }
    const { slides, totalSlides, scrollPerSlide, overlap, registerTimeline, registerTrigger } =
      ctx;

    slides.forEach((slide, i) => {
      const isLastSlide = i === totalSlides - 1;

      if (i === 0) {
        gsap.set(slide, {
          opacity: 1,
          scale: 1,
          x: 0,
          zIndex: 100,
          filter: 'blur(0px)',
        });
        return;
      }

      if (isLastSlide) {
        const shopBg = slide.querySelector('.shop-bg-wrapper');
        const shopContent = slide.querySelector('.shop-welcome-content');

        gsap.set(slide, {
          opacity: 0,
          x: 0,
          zIndex: 100 - i,
        });

        if (shopBg) {
          gsap.set(shopBg, {
            scale: 2.5,
            filter: 'blur(0px)',
          });
        }

        if (shopContent) {
          gsap.set(shopContent, {
            opacity: 0,
            scale: 0.9,
            filter: 'blur(10px)',
          });
        }

        return;
      }

      gsap.set(slide, {
        opacity: 0,
        scale: 0.4,
        x: '0vw',
        zIndex: 100 - i,
        filter: 'blur(0px)',
      });
    });

    slides.forEach((slide, i) => {
      const { start, end } = getSectionRange(i, scrollPerSlide, overlap);
      const isLastSlide = i === totalSlides - 1;

      const tl = registerTimeline(
        gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: `${start}px top`,
            end: `${end}px top`,
            scrub: 0.5,
          },
        })
      );

      if (i === 0) {
        const heroBg = slide.querySelector('.personal-hero-bg') || slide.querySelector('.hero-bg-wrapper');
        const heroBgImg = heroBg?.querySelector('.hero-bg-img');
        const heroOverlay =
          slide.querySelector('.personal-hero-overlay') || slide.querySelector('.hero-overlay');

        if (heroBgImg) {
          tl.to(
            heroBgImg,
            {
              scale: ctx.isLiteMode ? 2.1 : 2.5,
              filter: ctx.isLiteMode ? 'blur(18px)' : 'blur(30px)',
              ease: 'power1.in',
              duration: 0.5,
            },
            0
          );
        } else if (heroBg) {
          tl.to(
            heroBg,
            {
              scale: ctx.isLiteMode ? 2.1 : 2.5,
              filter: ctx.isLiteMode ? 'blur(18px)' : 'blur(30px)',
              ease: 'power1.in',
              duration: 0.5,
            },
            0
          );
        }

        if (heroOverlay) {
          tl.to(
            heroOverlay,
            {
              opacity: 0.95,
              ease: 'power1.in',
              duration: 0.5,
            },
            0
          );
        }

        tl.to(
          slide,
          {
            opacity: 0,
            ease: 'power1.in',
            duration: 0.3,
          },
          0.95
        );

        return;
      }

      if (isLastSlide) {
        const shopBg = slide.querySelector('.shop-bg-wrapper');
        const shopContent = slide.querySelector('.shop-welcome-content');

        tl.from(
          slide,
          {
            opacity: 0,
            ease: 'power1.out',
            duration: 0.3,
          },
          0
        );

        if (shopBg) {
          tl.from(
            shopBg,
            {
              scale: 2.5,
              filter: 'blur(30px)',
              ease: 'power1.out',
              duration: 0.5,
            },
            0
          );
        }

        if (shopContent) {
          tl.from(
            shopContent,
            {
              opacity: 0,
              scale: 0.9,
              filter: 'blur(10px)',
              ease: 'power1.out',
              duration: 0.5,
            },
            0
          );
        }

        return;
      }

      tl.to(
        slide,
        {
          opacity: 1,
          scale: 1,
          x: 0,
          filter: 'blur(0px)',
          ease: 'power2.out',
          duration: 0.6,
        },
        0.1
      );

      tl.to(
        slide,
        {
          opacity: 0,
          scale: 0.4,
          x: '0vw',
          filter: 'blur(0px)',
          ease: 'power2.in',
          duration: 0.3,
        },
        0.9
      );
    });

    registerTrigger(
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const percent = Math.round(self.progress * 100);
          const scrollPercentEl = document.getElementById('scrollPercent');
          if (scrollPercentEl) {
            scrollPercentEl.textContent = `${percent}%`;
          }
        },
      })
    );

    slides.forEach((slide, i) => {
      const { start, end } = getSectionRange(i, scrollPerSlide, overlap);

      registerTrigger(
        ScrollTrigger.create({
          trigger: document.body,
          start: `${start}px top`,
          end: `${end}px top`,
          onEnter: () => {
            slides.forEach((currentSlide) => currentSlide.classList.remove('active'));
            slide.classList.add('active');
          },
          onEnterBack: () => {
            slides.forEach((currentSlide) => currentSlide.classList.remove('active'));
            slide.classList.add('active');
          },
        })
      );
    });
  };
};
