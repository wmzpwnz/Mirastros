'use client';

import React from 'react';
import Link from 'next/link';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  tier: 'freemium' | 'premium' | 'platinum';
}

const services: ServiceCard[] = [
  {
    id: 'tarot',
    title: 'Таро',
    description: 'AI-гадания и расклады',
    icon: '🔮',
    href: '/services/tarot',
    tier: 'freemium',
  },
  {
    id: 'horoscope',
    title: 'Гороскоп',
    description: 'Ежедневные прогнозы',
    icon: '♈',
    href: '/services/horoscope',
    tier: 'freemium',
  },
  {
    id: 'natal',
    title: 'Натальная карта',
    description: 'Астрологический анализ',
    icon: '⭐',
    href: '/services/natal',
    tier: 'premium',
  },
  {
    id: 'numerology',
    title: 'Нумерология',
    description: 'Числа судьбы',
    icon: '🔢',
    href: '/services/numerology',
    tier: 'premium',
  },
  {
    id: 'dream',
    title: 'Толкование снов',
    description: 'Значение ваших снов',
    icon: '💭',
    href: '/services/dream',
    tier: 'freemium',
  },
  {
    id: 'runes',
    title: 'Руны',
    description: 'Древняя мудрость',
    icon: 'ᚱ',
    href: '/services/runes',
    tier: 'premium',
  },
  {
    id: 'iching',
    title: 'И-Цзин',
    description: 'Книга перемен',
    icon: '☯',
    href: '/services/iching',
    tier: 'premium',
  },
  {
    id: 'lenormand',
    title: 'Карты Ленорман',
    description: 'Прямые ответы',
    icon: '🎴',
    href: '/services/lenormand',
    tier: 'premium',
  },
  {
    id: 'transits',
    title: 'Транзиты',
    description: 'Планетарные влияния',
    icon: '🌙',
    href: '/services/transits',
    tier: 'premium',
  },
  {
    id: 'synastry',
    title: 'Синастрия',
    description: 'Совместимость',
    icon: '💑',
    href: '/services/synastry',
    tier: 'platinum',
  },
  {
    id: 'lunar',
    title: 'Лунный календарь',
    description: 'Фазы луны',
    icon: '🌕',
    href: '/services/lunar',
    tier: 'premium',
  },
  {
    id: 'crystals',
    title: 'Кристаллы',
    description: 'Энергия камней',
    icon: '💎',
    href: '/services/crystals',
    tier: 'premium',
  },
  {
    id: 'rituals',
    title: 'Ритуалы',
    description: 'Медитации и практики',
    icon: '🕯️',
    href: '/services/rituals',
    tier: 'platinum',
  },
  {
    id: 'horary',
    title: 'Хорарная астрология',
    description: 'Ответы на вопросы',
    icon: '❓',
    href: '/services/horary',
    tier: 'premium',
  },
  {
    id: 'chakra',
    title: 'Анализ чакр',
    description: 'Энергетический баланс',
    icon: '🔷',
    href: '/services/chakra',
    tier: 'premium',
  },
  {
    id: 'solar-return',
    title: 'Соляр',
    description: 'Годовой прогноз',
    icon: '☀️',
    href: '/services/solar-return',
    tier: 'platinum',
  },
  {
    id: 'karmic',
    title: 'Кармические уроки',
    description: 'Духовный рост',
    icon: '🌟',
    href: '/services/karmic',
    tier: 'platinum',
  },
  {
    id: 'mandala',
    title: 'Генератор мандал',
    description: 'Персональные мандалы',
    icon: '🎨',
    href: '/services/mandala',
    tier: 'platinum',
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <Link
          href="/dashboard"
          className="inline-block text-mirastros-gold hover:text-mirastros-gold/80 mb-4 transition"
        >
          ← Назад к панели
        </Link>
        <h1 className="font-cinzel text-4xl font-bold text-white mb-4">
          Все услуги
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Выберите интересующую вас услугу и получите мистическое руководство
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className="group bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-mirastros-gold/50 transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{service.icon}</div>
              <span className="text-xs px-2 py-1 rounded bg-mirastros-gold/20 text-mirastros-gold">
                {service.tier === 'freemium' && 'Бесплатно'}
                {service.tier === 'premium' && 'Premium'}
                {service.tier === 'platinum' && 'Platinum'}
              </span>
            </div>
            <h3 className="font-cinzel text-xl font-bold text-white mb-2 group-hover:text-mirastros-gold transition">
              {service.title}
            </h3>
            <p className="text-gray-400 text-sm">
              {service.description}
            </p>
          </Link>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="font-cinzel text-lg font-bold text-white mb-3">
          О наших услугах
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Миrastros предлагает 18 различных эзотерических услуг, от классического Таро до современной астрологии.
          Каждая услуга использует AI для персонализированных интерпретаций и рекомендаций.
          Выберите услугу, соответствующую вашему уровню подписки, и начните свой путь самопознания.
        </p>
      </div>
    </div>
  );
}
