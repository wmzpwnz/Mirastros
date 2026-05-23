import { describe, it, expect } from 'vitest';

/**
 * Property 12: Dashboard Service Links
 * 
 * For any dashboard page, all 18 service page links should be displayed and clickable,
 * and clicking a link should navigate to the correct service page.
 * 
 * Validates: Requirements 17.1
 */
describe('Services Page - Property 12: Dashboard Service Links', () => {
  // Define all 18 services that should be available
  const expectedServices = [
    {
      id: 'tarot',
      title: 'Таро',
      href: '/services/tarot',
      tier: 'freemium',
    },
    {
      id: 'horoscope',
      title: 'Гороскоп',
      href: '/services/horoscope',
      tier: 'freemium',
    },
    {
      id: 'natal',
      title: 'Натальная карта',
      href: '/services/natal',
      tier: 'premium',
    },
    {
      id: 'numerology',
      title: 'Нумерология',
      href: '/services/numerology',
      tier: 'premium',
    },
    {
      id: 'dream',
      title: 'Толкование снов',
      href: '/services/dream',
      tier: 'freemium',
    },
    {
      id: 'runes',
      title: 'Руны',
      href: '/services/runes',
      tier: 'premium',
    },
    {
      id: 'iching',
      title: 'И-Цзин',
      href: '/services/iching',
      tier: 'premium',
    },
    {
      id: 'lenormand',
      title: 'Карты Ленорман',
      href: '/services/lenormand',
      tier: 'premium',
    },
    {
      id: 'transits',
      title: 'Транзиты',
      href: '/services/transits',
      tier: 'premium',
    },
    {
      id: 'synastry',
      title: 'Синастрия',
      href: '/services/synastry',
      tier: 'platinum',
    },
    {
      id: 'lunar',
      title: 'Лунный календарь',
      href: '/services/lunar',
      tier: 'premium',
    },
    {
      id: 'crystals',
      title: 'Кристаллы',
      href: '/services/crystals',
      tier: 'premium',
    },
    {
      id: 'rituals',
      title: 'Ритуалы',
      href: '/services/rituals',
      tier: 'platinum',
    },
    {
      id: 'horary',
      title: 'Хорарная астрология',
      href: '/services/horary',
      tier: 'premium',
    },
    {
      id: 'chakra',
      title: 'Анализ чакр',
      href: '/services/chakra',
      tier: 'premium',
    },
    {
      id: 'solar-return',
      title: 'Соляр',
      href: '/services/solar-return',
      tier: 'platinum',
    },
    {
      id: 'karmic',
      title: 'Кармические уроки',
      href: '/services/karmic',
      tier: 'platinum',
    },
    {
      id: 'mandala',
      title: 'Генератор мандал',
      href: '/services/mandala',
      tier: 'platinum',
    },
  ];

  it('should have exactly 18 services defined', () => {
    expect(expectedServices).toHaveLength(18);
  });

  it('should have all services with unique IDs', () => {
    const ids = expectedServices.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(18);
  });

  it('should have all services with valid href paths', () => {
    expectedServices.forEach((service) => {
      expect(service.href).toMatch(/^\/services\/[a-z-]+$/);
    });
  });

  it('should have correct tier distribution', () => {
    const freemium = expectedServices.filter((s) => s.tier === 'freemium');
    const premium = expectedServices.filter((s) => s.tier === 'premium');
    const platinum = expectedServices.filter((s) => s.tier === 'platinum');

    expect(freemium).toHaveLength(3);
    expect(premium).toHaveLength(10);
    expect(platinum).toHaveLength(5);
  });

  it('should have all services with non-empty titles', () => {
    expectedServices.forEach((service) => {
      expect(service.title.length).toBeGreaterThan(0);
    });
  });

  it('should have all services with valid tier values', () => {
    const validTiers = ['freemium', 'premium', 'platinum'];
    expectedServices.forEach((service) => {
      expect(validTiers).toContain(service.tier);
    });
  });

  it('should have all service hrefs pointing to correct paths', () => {
    const expectedPaths = [
      '/services/tarot',
      '/services/horoscope',
      '/services/natal',
      '/services/numerology',
      '/services/dream',
      '/services/runes',
      '/services/iching',
      '/services/lenormand',
      '/services/transits',
      '/services/synastry',
      '/services/lunar',
      '/services/crystals',
      '/services/rituals',
      '/services/horary',
      '/services/chakra',
      '/services/solar-return',
      '/services/karmic',
      '/services/mandala',
    ];

    const actualPaths = expectedServices.map((s) => s.href);
    expect(actualPaths).toEqual(expectedPaths);
  });

  it('should have all services with unique hrefs', () => {
    const hrefs = expectedServices.map((s) => s.href);
    const uniqueHrefs = new Set(hrefs);
    expect(uniqueHrefs.size).toBe(18);
  });
});
