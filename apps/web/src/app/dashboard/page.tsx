'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { User } from '../../types';
import { DailyOverview } from '../../components/dashboard/DailyOverview';
import { TarotSection } from '../../components/sections/TarotSection';
import { AstrologySection } from '../../components/sections/AstrologySection';
import { HoroscopeSection } from '../../components/sections/HoroscopeSection';
import { NatalSection } from '../../components/sections/NatalSection';
import DestinyMatrixSection from '../../components/sections/DestinyMatrixSection';
import { RunesSection } from '../../components/sections/RunesSection';
import { NumerologySection } from '../../components/sections/NumerologySection';
import { DreamSection } from '../../components/sections/DreamSection';
import { IChingSection } from '../../components/sections/IChingSection';
import { LenormandSection } from '../../components/sections/LenormandSection';
import { ChakraSection } from '../../components/sections/ChakraSection';
import { TransitsSection } from '../../components/sections/TransitsSection';
import { SynastrySection } from '../../components/sections/SynastrySection';
import { LunarSection } from '../../components/sections/LunarSection';
import { CrystalsSection } from '../../components/sections/CrystalsSection';
import { RitualsSection } from '../../components/sections/RitualsSection';
import { HorarySection } from '../../components/sections/HorarySection';
import { SolarReturnSection } from '../../components/sections/SolarReturnSection';
import { KarmicSection } from '../../components/sections/KarmicSection';
import { MandalaSection } from '../../components/sections/MandalaSection';
import { ShopSection } from '../../components/sections/ShopSection';
import { DynamicBackground } from '../../components/DynamicBackground';
import { Background3D } from '../../components/Background3D';
import { SectionNavigationMenu } from '../../components/SectionNavigationMenu';
import { config } from '../../config';
import { DASHBOARD_TUNNEL_MEDIA } from '../../constants/tunnelMedia';
import { useZScrollTunnel } from '../../hooks/useZScrollTunnel';
import { createDashboardAnimations } from '../tunnel/dashboardAnimations';

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
  const [recentReadings, setRecentReadings] = useState<any[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    const loadUser = async () => {
      try {
        console.log('Loading user data...');
        const userData = await api.getCurrentUser();
        console.log('User data loaded:', userData);
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Failed to load user:', error);
        console.error('Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack
        });
        if (isMounted) {
          setLoading(false);
          // Redirect to login on any error (user not authenticated or network issue)
          router.push('/auth/login');
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // Set timeout for loading state
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.error('Timeout: User data loading took too long');
        setLoading(false);
        router.push('/auth/login');
      }
    }, 5000); // 5 second timeout

    loadUser();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router]);

  const dashboardTunnelInit = useMemo(() => createDashboardAnimations(), []);

  useZScrollTunnel({
    enabled: config.features.enableZScroll && !!user,
    enableMobile: config.features.enableZScrollMobile,
    desktopMinWidth: config.features.zScrollDesktopMinWidth,
    onInit: dashboardTunnelInit,
  });

  useEffect(() => {
    const loadRecentReadings = async () => {
      if (!user) return;
      setLoadingReadings(true);
      try {
        // Load recent readings from different services
        const [tarotHistory, numerologyHistory, dreamHistory] = await Promise.allSettled([
          api.getTarotHistory(5, 0).catch(() => ({ readings: [], total: 0 })),
          api.request('/numerology/history?limit=5&offset=0').catch(() => ({ calculations: [], total: 0 })),
          api.request('/dreams/history?limit=5&offset=0').catch(() => ({ dreams: [], total: 0 })),
        ]);

        const readings: any[] = [];

        // Add Tarot readings
        if (tarotHistory.status === 'fulfilled' && tarotHistory.value.readings) {
          tarotHistory.value.readings.forEach((r: any) => {
            readings.push({
              type: 'tarot',
              title: `Расклад Таро: ${r.spread_type || 'Неизвестно'}`,
              question: r.question,
              timestamp: r.created_at || r.timestamp,
              id: r.id,
            });
          });
        }

        // Add Numerology calculations
        if (numerologyHistory.status === 'fulfilled' && (numerologyHistory.value as any).calculations) {
          (numerologyHistory.value as any).calculations.forEach((c: any) => {
            readings.push({
              type: 'numerology',
              title: 'Нумерологический расчет',
              question: c.name || 'Расчет',
              timestamp: c.created_at || c.timestamp,
              id: c.id,
            });
          });
        }

        // Add Dream interpretations
        if (dreamHistory.status === 'fulfilled' && (dreamHistory.value as any).dreams) {
          (dreamHistory.value as any).dreams.forEach((d: any) => {
            readings.push({
              type: 'dream',
              title: 'Толкование сна',
              question: d.description?.substring(0, 50) || 'Сон',
              timestamp: d.created_at || d.timestamp,
              id: d.id,
            });
          });
        }

        // Sort by timestamp (most recent first)
        readings.sort((a, b) => {
          const timeA = new Date(a.timestamp).getTime();
          const timeB = new Date(b.timestamp).getTime();
          return timeB - timeA;
        });

        setRecentReadings(readings.slice(0, 10));
      } catch (error) {
        console.error('Failed to load readings:', error);
      } finally {
        setLoadingReadings(false);
      }
    };

    if (user) {
      loadRecentReadings();
    }
  }, [user]);

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
    <>
      {/* Background 3D Stars */}
      <Background3D />

      {/* Dynamic Backgrounds */}
      <DynamicBackground
        sources={DASHBOARD_TUNNEL_MEDIA}
        blurAmount={100}
        scale={1.2}
      />

      {/* Fixed Viewport for Z-Scroll */}
      <main className="viewport">
        {/* Personal Hero Section - First Section */}
        {user && (
          <section
            className="mira-section mira-hero"
            id="hero"
            style={{ alignItems: 'flex-start', justifyContent: 'center' }}
          >
            <DailyOverview key={user.id} user={user} />
          </section>
        )}

        {/* Service Sections with Tunnel Effect */}
        <TarotSection id="tarot" />
        <AstrologySection id="astrology" />
        <HoroscopeSection id="horoscope" />
        <NatalSection id="natal" />
        <DestinyMatrixSection id="destiny-matrix" embedded />
        <RunesSection id="runes" />
        <NumerologySection id="numerology" />
        <DreamSection id="dream" />
        <IChingSection id="iching" />
        <LenormandSection id="lenormand" />
        <ChakraSection id="chakra" />
        <TransitsSection id="transits" />
        <SynastrySection id="synastry" />
        <LunarSection id="lunar" />
        <CrystalsSection id="crystals" />
        <RitualsSection id="rituals" />
        <HorarySection id="horary" />
        <SolarReturnSection id="solar-return" />
        <KarmicSection id="karmic" />
        <MandalaSection id="mandala" />
        <ShopSection id="shop" />
      </main>

      {/* Scroll Indicator */}
      <div className="scroll-indicator-bottom">
        <span>SCROLL</span>
        <span className="scroll-percent text-shine" id="scrollPercent">0%</span>
      </div>

      {/* Section Navigation Menu */}
      <SectionNavigationMenu />
    </>
  );
}
