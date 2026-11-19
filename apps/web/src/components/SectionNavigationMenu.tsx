'use client';

import React, { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  getScrollPerSlide,
  getSectionProgress,
  getSectionRange,
  TUNNEL_OVERLAP,
} from '../utils/tunnelScrollMath';

interface Section {
  id: string;
  name: string;
  index: number;
}

const SECTION_TITLES: Record<string, string> = {
  hero: 'Главная',
  tarot: 'Таро',
  astrology: 'Астрология',
  horoscope: 'Гороскоп',
  natal: 'Натальная карта',
  'destiny-matrix': 'Матрица судьбы',
  runes: 'Руны',
  numerology: 'Нумерология',
  dream: 'Толкование снов',
  iching: 'И-Цзин',
  lenormand: 'Ленорман',
  chakra: 'Чакры',
  transits: 'Транзиты',
  synastry: 'Синастрия',
  lunar: 'Лунный календарь',
  crystals: 'Кристаллы',
  rituals: 'Ритуалы',
  horary: 'Хорарная астрология',
  'solar-return': 'Соляр',
  karmic: 'Кармические задачи',
  mandala: 'Мандала',
  shop: 'Магазин',
};

const getSectionLabel = (id: string) => SECTION_TITLES[id] || id;

export const SectionNavigationMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [sections, setSections] = useState<Section[]>([]);

  const totalSections = sections.length;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const slides = Array.from(document.querySelectorAll<HTMLElement>('.mira-section[id]'));
    const normalizedSections: Section[] = slides.map((slide, index) => ({
      id: slide.id,
      name: getSectionLabel(slide.id),
      index,
    }));

    setSections(normalizedSections);

    let scrollPerSlide = getScrollPerSlide(window.innerHeight);

    const updateCurrentSection = () => {
      if (!slides.length) return;

      if (!document.body.classList.contains('zscroll-enabled')) {
        let index = 0;
        slides.forEach((slide, candidate) => {
          if (slide.getBoundingClientRect().top <= window.innerHeight * .35) index = candidate;
        });
        const rect = slides[index].getBoundingClientRect();
        setCurrentSection(index);
        setScrollProgress(Math.max(0, Math.min(100, -rect.top / Math.max(1, rect.height) * 100)));
        return;
      }
      const activeSlide = document.querySelector('.mira-section.active');
      const activeIndex = activeSlide ? slides.indexOf(activeSlide as HTMLElement) : -1;
      const calculatedIndex = Math.floor(window.scrollY / scrollPerSlide);
      const currentIndex = Math.min(
        activeIndex !== -1 ? activeIndex : calculatedIndex,
        slides.length - 1
      );

      setCurrentSection(currentIndex);
      setScrollProgress(
        getSectionProgress(window.scrollY, currentIndex, scrollPerSlide, TUNNEL_OVERLAP)
      );
    };

    const tunnelTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: updateCurrentSection,
    });

    updateCurrentSection();
    window.addEventListener('scroll', updateCurrentSection, { passive: true });
    const handleResize = () => {
      scrollPerSlide = getScrollPerSlide(window.innerHeight);
      updateCurrentSection();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', updateCurrentSection);
      window.removeEventListener('resize', handleResize);
      tunnelTrigger.kill();
    };
  }, []);

  const scrollToSection = (index: number) => {
    if (typeof window === 'undefined') return;

    if (!document.body.classList.contains('zscroll-enabled')) {
      document.getElementById(sections[index]?.id)?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      setIsOpen(false);
      return;
    }
    const scrollPerSlide = getScrollPerSlide(window.innerHeight);
    const { start } = getSectionRange(index, scrollPerSlide, TUNNEL_OVERLAP);
    const targetScroll = start;

    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth',
    });

    const handleScroll = () => {
      if (Math.abs(window.scrollY - targetScroll) < 10) {
        ScrollTrigger.refresh();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    setTimeout(() => {
      ScrollTrigger.refresh();
      window.removeEventListener('scroll', handleScroll);
    }, 2000);

    setIsOpen(false);
  };

  if (!sections.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40" style={{ position: 'fixed', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 2000 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-black/90 transition-all duration-300 group"
        aria-label="Меню секций"
        aria-expanded={isOpen}
        aria-controls="mirastros-section-menu"
        style={{ background: 'rgba(16, 15, 34, .92)', borderColor: 'rgba(201, 164, 92, .4)' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8d5a3" strokeWidth="1.3" aria-hidden="true">
          <path d={isOpen ? 'M6 6l12 12M6 18 18 6' : 'M5 7h14M5 12h14M5 17h14'} />
        </svg>
      </button>

      <div
        id="mirastros-section-menu"
        role="navigation"
        aria-label="Навигация по разделам"
        className={`absolute right-0 top-16 w-64 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl transition-all duration-300 overflow-hidden ${
          isOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="mb-4 pb-4 border-b border-white/10">
            <h3 className="text-white font-cinzel font-semibold text-sm mb-1">
              Навигация по секциям
            </h3>
            <p className="text-gray-400 text-xs">
              {Math.min(currentSection + 1, totalSections)} / {totalSections}
            </p>
          </div>

          <div className="space-y-1">
            {sections.map((section) => {
              const isActive = section.index === currentSection;

              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.index)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-mirastros-gold/20 text-mirastros-gold border border-mirastros-gold/50'
                      : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{section.name}</span>
                    {isActive && <span className="text-mirastros-gold text-xs">●</span>}
                  </div>
                  {isActive && (
                    <div className="mt-1.5 h-0.5 bg-mirastros-gold/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-mirastros-gold transition-all duration-300"
                        style={{ width: `${scrollProgress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>Прогресс</span>
              <span>{Math.round(scrollProgress)}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-mirastros-gold transition-all duration-300"
                style={{
                  width: `${((Math.min(currentSection + 1, totalSections)) / totalSections) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(190, 143, 68, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(190, 143, 68, 0.7);
        }
      `}</style>
    </div>
  );
};
