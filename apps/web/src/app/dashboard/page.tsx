'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { User } from '../../types';

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
    id: 'dreams',
    title: 'Сны',
    description: 'Толкование снов',
    icon: '💭',
    href: '/services/dreams',
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
    id: 'rituals',
    title: 'Ритуалы',
    description: 'Медитации и практики',
    icon: '🕯️',
    href: '/services/rituals',
    tier: 'platinum',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  const canAccessService = (tier: string) => {
    if (!user) return false;
    
    const tierLevels = {
      freemium: 0,
      premium: 1,
      platinum: 2,
    };

    const userLevel = tierLevels[user.subscriptionTier as keyof typeof tierLevels] || 0;
    const serviceLevel = tierLevels[tier as keyof typeof tierLevels] || 0;

    return userLevel >= serviceLevel;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-cinzel text-4xl font-bold text-white mb-2">
            Добро пожаловать, {user.fullName}
          </h1>
          <p className="text-gray-400">
            Ваш тариф:{' '}
            <span className="text-mirastros-gold font-semibold capitalize">
              {user.subscriptionTier}
            </span>
          </p>
        </div>

        {/* Natal Chart Summary */}
        {user.birthDate && (
          <div className="mb-12 bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="font-cinzel text-2xl font-bold text-white mb-4">
              Ваша натальная карта
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Дата рождения</p>
                <p className="text-white font-semibold">{user.birthDate}</p>
              </div>
              {user.zodiacSign && (
                <div>
                  <p className="text-gray-400 text-sm mb-1">Знак зодиака</p>
                  <p className="text-white font-semibold">{user.zodiacSign}</p>
                </div>
              )}
              <div>
                <Link
                  href="/services/natal"
                  className="inline-block px-4 py-2 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black font-semibold rounded-lg transition"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Service Cards */}
        <div className="mb-12">
          <h2 className="font-cinzel text-2xl font-bold text-white mb-6">
            Эзотерические практики
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const hasAccess = canAccessService(service.tier);
              
              return (
                <Link
                  key={service.id}
                  href={hasAccess ? service.href : '/subscription'}
                  className={`group relative bg-white/5 border border-white/10 rounded-lg p-6 transition ${
                    hasAccess
                      ? 'hover:bg-white/10 hover:border-mirastros-gold/50'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Lock Icon for Premium/Platinum */}
                  {!hasAccess && (
                    <div className="absolute top-4 right-4 text-2xl">🔒</div>
                  )}

                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-cinzel text-xl font-bold text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {service.description}
                  </p>

                  {/* Tier Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        service.tier === 'freemium'
                          ? 'bg-gray-500/20 text-gray-400'
                          : service.tier === 'premium'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}
                    >
                      {service.tier === 'freemium'
                        ? 'Бесплатно'
                        : service.tier === 'premium'
                        ? 'Premium'
                        : 'Platinum'}
                    </span>

                    {hasAccess && (
                      <span className="text-mirastros-gold text-sm group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Readings */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-cinzel text-2xl font-bold text-white">
              Последние предсказания
            </h2>
            <Link
              href="/history"
              className="text-mirastros-gold hover:text-mirastros-gold/80 text-sm transition"
            >
              Смотреть все →
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center text-gray-400">
            <p>У вас пока нет предсказаний</p>
            <p className="text-sm mt-2">Начните с выбора практики выше</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/journal"
            className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-mirastros-gold/50 transition"
          >
            <div className="text-3xl mb-3">📔</div>
            <h3 className="font-cinzel text-lg font-bold text-white mb-2">
              Дневник практик
            </h3>
            <p className="text-gray-400 text-sm">
              Записывайте свои наблюдения
            </p>
          </Link>

          <Link
            href="/shop"
            className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-mirastros-gold/50 transition"
          >
            <div className="text-3xl mb-3">🛍️</div>
            <h3 className="font-cinzel text-lg font-bold text-white mb-2">
              Эзотерический магазин
            </h3>
            <p className="text-gray-400 text-sm">
              Кристаллы, таро, книги
            </p>
          </Link>

          <Link
            href="/profile"
            className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-mirastros-gold/50 transition"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h3 className="font-cinzel text-lg font-bold text-white mb-2">
              Настройки
            </h3>
            <p className="text-gray-400 text-sm">
              Профиль и подписка
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
