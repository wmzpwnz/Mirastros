import { createReducedMotionAnimations } from './reducedMotionAnimations';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { TunnelMediaTrack } from '../../constants/tunnelMedia';
import type { TunnelAnimationContext } from '../../hooks/useZScrollTunnel';
import { getFlyingVideoBudget } from '../../utils/tunnelPerf';
import { getSectionRange } from '../../utils/tunnelScrollMath';

interface LandingAnimationOptions {
  mediaTrack: TunnelMediaTrack;
}

const seededScatter = (index: number, salt: number) => {
  const value = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453123;
  return value - Math.floor(value);
};

export const createLandingAnimations = ({ mediaTrack }: LandingAnimationOptions) => {
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

      const direction = i % 2 === 1 ? 1 : -1;
      const entryX = ctx.isMobile ? 18 : 34;

      gsap.set(slide, {
        opacity: 0,
        scale: ctx.isMobile ? 0.7 : 0.58,
        x: `${direction * entryX}vw`,
        zIndex: 100 - i,
        filter: ctx.isMobile || ctx.isLiteMode ? 'blur(5px)' : 'blur(10px)',
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
        const heroBg = slide.querySelector('.hero-bg-wrapper');
        const heroOverlay = slide.querySelector('.hero-overlay');
        const heroLogoButtons = slide.querySelectorAll('.hero-logo-buttons-group');
        const heroSubtitle = slide.querySelector('.hero-subtitle-text');
        const heroFlying = slide.querySelector('.hero-flying-gifs') as HTMLElement | null;

        if (heroBg) {
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

        heroLogoButtons.forEach((element) => {
          tl.to(
            element,
            {
              opacity: 0,
              scale: 0.9,
              filter: 'blur(10px)',
              ease: 'power1.in',
              duration: 0.2,
            },
            0.5
          );
        });

        if (heroOverlay) {
          tl.to(
            heroOverlay,
            {
              background:
                'radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.98) 100%)',
              ease: 'power1.in',
              duration: 0.15,
            },
            0.7
          );
        }

        if (heroFlying) {
          heroFlying.querySelectorAll('.hero-flying-gif').forEach((node) => node.remove());

          const allSources = mediaTrack.filter(
            (source, index) => source && index !== 0 && index !== mediaTrack.length - 1
          );
          const budget = getFlyingVideoBudget(window.innerWidth, ctx.isLiteMode);
          const flyingSources = allSources.slice(0, budget);

          const containerRect = heroFlying.getBoundingClientRect();
          const startX = containerRect.width / 2;
          const startY = containerRect.height / 2;
          const spreadBase = Math.max(window.innerWidth, window.innerHeight);

          flyingSources.forEach((source, index) => {
            if (!source) return;

            const node = document.createElement('video');
            node.className = 'hero-flying-gif';
            node.muted = true;
            node.playsInline = true;
            node.loop = true;
            node.autoplay = true;
            node.preload = 'none';
            node.style.position = 'absolute';
            node.style.width = ctx.isLiteMode ? '72px' : '96px';
            node.style.height = ctx.isLiteMode ? '72px' : '96px';
            node.style.objectFit = 'contain';
            node.style.pointerEvents = 'none';

            const webmSource = document.createElement('source');
            webmSource.src = source.webm;
            webmSource.type = 'video/webm';
            node.appendChild(webmSource);

            const mp4Source = document.createElement('source');
            mp4Source.src = source.mp4;
            mp4Source.type = 'video/mp4';
            node.appendChild(mp4Source);

            heroFlying.appendChild(node);
            void node.play().catch(() => null);

            const baseAngle = (Math.PI * 2 * index) / Math.max(1, flyingSources.length);
            const angleJitter = (seededScatter(index, 1) - 0.5) * 1.55;
            const angle = baseAngle + angleJitter;
            const distance =
              spreadBase *
              (ctx.isLiteMode
                ? 0.42 + seededScatter(index, 2) * 0.42
                : 0.58 + seededScatter(index, 2) * 0.62);
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            const offset = 0.68 + seededScatter(index, 3) * 0.16;
            const burstDuration = ctx.isLiteMode
              ? 0.22 + seededScatter(index, 4) * 0.24
              : 0.34 + seededScatter(index, 4) * 0.34;
            const startScale = 0.14 + seededScatter(index, 5) * 0.12;
            const endScale = ctx.isLiteMode
              ? 1.25 + seededScatter(index, 6) * 0.75
              : 1.75 + seededScatter(index, 6) * 1.25;

            gsap.set(node, {
              x: startX,
              y: startY,
              xPercent: -50,
              yPercent: -50,
              opacity: 0,
              scale: startScale,
              rotation: (seededScatter(index, 7) - 0.5) * 24,
              filter: 'blur(0px)',
              transformOrigin: '50% 50%',
            });

            tl.to(
              node,
              {
                opacity: 1,
                scale: 0.75 + seededScatter(index, 8) * 0.5,
                ease: 'power2.out',
                duration: 0.06 + seededScatter(index, 9) * 0.08,
              },
              offset
            );

            tl.to(
              node,
              {
                x: endX,
                y: endY,
                scale: endScale,
                rotation: (seededScatter(index, 10) - 0.5) * 42,
                opacity: 0,
                filter: ctx.isLiteMode ? 'blur(8px)' : 'blur(22px)',
                ease: 'power2.out',
                duration: burstDuration,
              },
              offset + 0.05 + seededScatter(index, 11) * 0.08
            );
          });
        }

        if (heroSubtitle) {
          tl.to(
            heroSubtitle,
            {
              opacity: 0,
              scale: 0.9,
              filter: 'blur(10px)',
              ease: 'power1.in',
              duration: 0.05,
            },
            0.65
          );
        }

        tl.to(
          slide,
          {
            opacity: 0,
            duration: 0.02,
          },
          0.98
        );

        return;
      }

      if (isLastSlide) {
        const shopBg = slide.querySelector('.shop-bg-wrapper');
        const shopContent = slide.querySelector('.shop-welcome-content');
        const shopWipe = slide.querySelector('.shop-tunnel-wipe');
        const previousSlide = slides[i - 1];

        if (shopWipe) {
          gsap.set(shopWipe, {
            opacity: 1,
          });
        }

        if (shopContent) {
          tl.fromTo(
            shopContent,
            {
              opacity: 0,
              scale: 0.9,
              filter: 'blur(10px)',
            },
            {
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              ease: 'power2.out',
              duration: 0.36,
            },
            0.12
          );
        }

        if (previousSlide) {
          tl.to(
            previousSlide,
            {
              opacity: 0,
              scale: 2.45,
              filter: ctx.isLiteMode ? 'blur(8px)' : 'blur(16px)',
              ease: 'power2.in',
              duration: 0.22,
            },
            0
          );
          tl.set(
            previousSlide,
            {
              visibility: 'hidden',
              pointerEvents: 'none',
            },
            0.24
          );
        }

        if (shopBg) {
          tl.fromTo(
            shopBg,
            {
              scale: 2.5,
              filter: 'blur(0px)',
            },
            {
              scale: 1.15,
              filter: 'blur(0px)',
              ease: 'power2.out',
              duration: 0.52,
            },
            0.12
          );
        }

        if (shopWipe) {
          tl.fromTo(
            shopWipe,
            {
              opacity: 1,
            },
            {
              opacity: 0.78,
              ease: 'power1.out',
              duration: 0.4,
            },
            0.12
          );
        }

        tl.fromTo(
          slide,
          {
            opacity: 0,
            scale: 1,
            x: 0,
            filter: 'blur(0px)',
            zIndex: 140,
          },
          {
            opacity: 1,
            scale: 1,
            x: 0,
            filter: 'blur(0px)',
            zIndex: 140,
            duration: 0.1,
          },
          0
        );

        return;
      }

      const sectionCategory = slide.querySelector('.section-media .section-category');
      const sectionMediaCard = slide.querySelector('.section-media-card');
      const sectionTextCard = slide.querySelector('.section-text-card');
      const direction = i % 2 === 1 ? 1 : -1;
      const entryX = ctx.isMobile ? 18 : 34;
      const settleX = ctx.isMobile ? 0 : 8;
      const exitX = ctx.isMobile ? 16 : ctx.isLiteMode ? 28 : 38;
      const exitScale = ctx.isMobile ? 1.72 : ctx.isLiteMode ? 1.95 : 2.32;

      if (sectionCategory) {
        gsap.set(sectionCategory, {
          opacity: 0,
          scale: 0.4,
          y: 0,
          x: 0,
        });

        tl.fromTo(
          sectionCategory,
          {
            opacity: 0,
            scale: 0.4,
            y: 0,
          },
          {
            opacity: 1,
            scale: 1,
            y: -25,
            ease: 'power1.out',
            duration: 0.32,
          },
          0
        );
      }

      if (sectionMediaCard) {
        gsap.set(sectionMediaCard, {
          opacity: 0,
          scale: 0.82,
          y: 0,
          filter: ctx.isLiteMode ? 'blur(4px)' : 'blur(8px)',
          transformOrigin: '50% 50%',
        });

        tl.to(
          sectionMediaCard,
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            ease: 'power2.out',
            duration: 0.42,
          },
          0.06
        );
      }

      if (sectionTextCard) {
        gsap.set(sectionTextCard, {
          opacity: 0,
          x: direction * -26,
          y: 0,
          scale: 0.98,
          filter: 'blur(6px)',
        });

        tl.to(
          sectionTextCard,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            ease: 'power2.out',
            duration: 0.34,
          },
          0.16
        );
      }

      tl.fromTo(
        slide,
        {
          opacity: 0,
          scale: ctx.isMobile ? 0.7 : 0.58,
          x: `${direction * entryX}vw`,
          filter: ctx.isMobile || ctx.isLiteMode ? 'blur(5px)' : 'blur(10px)',
        },
        {
          opacity: 1,
          scale: 0.98,
          x: `${direction * settleX}vw`,
          filter: 'blur(0px)',
          ease: 'power2.out',
          duration: 0.5,
        },
        0
      );

      tl.to(
        slide,
        {
          scale: exitScale,
          x: `${direction * exitX}vw`,
          opacity: 0,
          filter: ctx.isMobile || ctx.isLiteMode ? 'blur(4px)' : 'blur(8px)',
          ease: 'power2.in',
          duration: 0.68,
        },
        0.34
      );

      if (sectionCategory) {
        tl.to(
          sectionCategory,
          {
            opacity: 0,
            scale: 1.7,
            y: -25,
            ease: 'power2.in',
            duration: 0.52,
          },
          0.4
        );
      }

      if (sectionMediaCard) {
        tl.to(
          sectionMediaCard,
          {
            opacity: 0,
            scale: ctx.isLiteMode ? 1.55 : 1.92,
            y: 0,
            filter: ctx.isLiteMode ? 'blur(6px)' : 'blur(12px)',
            ease: 'power2.in',
            duration: 0.56,
          },
          0.4
        );
      }

      if (sectionTextCard) {
        tl.to(
          sectionTextCard,
          {
            opacity: 0,
            x: direction * -18,
            y: 0,
            scale: 0.98,
            filter: 'blur(8px)',
            ease: 'power2.in',
            duration: 0.28,
          },
          0.44
        );
      }
    });

    registerTrigger(
      ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const scrollPercent = document.getElementById('scrollPercent');
          if (scrollPercent) {
            scrollPercent.textContent = `${Math.round(self.progress * 100)}%`;
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
          onLeave: () => {
            if (i !== 0) slide.classList.remove('active');
          },
          onLeaveBack: () => {
            if (i !== 0) slide.classList.remove('active');
          },
        })
      );
    });
  };
};
