'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { api } from '../../services/api';
import type { User, NatalChart, Horoscope, DestinyMatrix } from '../../types';
import { CompactHoroscopeBlock } from '../CompactHoroscopeBlock';
import { DestinyMatrixBlock } from '../DestinyMatrixBlock';
import { useHeroDensity } from '../hero/heroDensity';
import { TopHeaderBlock } from './TopHeaderBlock';
import { NatalChartBlock } from './NatalChartBlock';
import { LockedNatalChartBlock } from './LockedNatalChartBlock';
import { LockedHoroscopeBlock } from './LockedHoroscopeBlock';
import { ZODIAC_SIGNS } from '../../constants/zodiac';
import { normalizeBirthDate, formatIsoDate, weekStartIso, monthIso } from '../../utils/date';
import { sanitizePlain } from '../../utils/text';
import { getCachedData, setCachedData, MATRIX_UPDATED_EVENT } from '../../utils/cache';
import { useToast } from '../../contexts/ToastContext';

interface PersonalHeroSectionProps {
  user: User;
}

export const PersonalHeroSection: React.FC<PersonalHeroSectionProps> = ({
  user,
}) => {
  const router = useRouter();
  const density = useHeroDensity();
  const { showError } = useToast();
  const [natalChart, setNatalChart] = useState<NatalChart | null>(null);
  const [horoscopes, setHoroscopes] = useState<{
    daily: Horoscope | null;
    weekly: Horoscope | null;
    monthly: Horoscope | null;
  }>({
    daily: null,
    weekly: null,
    monthly: null,
  });
  const [destinyMatrix, setDestinyMatrix] = useState<DestinyMatrix | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const zodiacSign = user.zodiacSign?.toLowerCase() || '';
  const zodiacInfo = zodiacSign ? ZODIAC_SIGNS[zodiacSign] : null;
  const normalizedBirthDate = normalizeBirthDate(user.birthDate);
  const hasBirthData = !!(
    user.birthDate &&
    user.birthTime &&
    user.birthLocation
  );
  const isPremium =
    user.subscriptionTier === 'premium' || user.subscriptionTier === 'platinum';

  // Debug logging
  useEffect(() => {
    console.log('PersonalHeroSection - User data:', {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthLocation: user.birthLocation,
      zodiacSign: user.zodiacSign,
      hasBirthData,
      subscriptionTier: user.subscriptionTier,
    });
  }, [user, hasBirthData]);

  useEffect(() => {
    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * 0.05;
      const y = (e.clientY - window.innerHeight / 2) * 0.05;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!normalizedBirthDate || typeof window === 'undefined') return;

    const onMatrixUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{
        birthDate?: string;
        matrix?: DestinyMatrix | null;
      }>;
      const payload = customEvent.detail;
      if (!payload?.matrix) return;
      const payloadBirthDate = normalizeBirthDate(payload.birthDate);
      if (payloadBirthDate && payloadBirthDate !== normalizedBirthDate) return;

      const matrixKey = `matrix_${normalizedBirthDate}`;
      setDestinyMatrix(payload.matrix);
      setCachedData(matrixKey, payload.matrix);
    };

    window.addEventListener(MATRIX_UPDATED_EVENT, onMatrixUpdated as EventListener);
    return () =>
      window.removeEventListener(MATRIX_UPDATED_EVENT, onMatrixUpdated as EventListener);
  }, [normalizedBirthDate]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Prepare all promises for parallel execution
      const promises: Promise<void>[] = [];

      // Load natal chart (Premium). Don't gate on profile birth data:
      // users may already have a calculated chart stored in DB.
      if (isPremium) {
        const cacheKey = `natal_${user.id || 'curr'}`;
        const cached = getCachedData<NatalChart>(cacheKey);

        if (cached) {
          setNatalChart(cached);
        } else {
          promises.push(
            api
              .getNatalChart()
              .then((chart) => {
                setNatalChart(chart);
                if (chart) setCachedData(cacheKey, chart);
              })
              .catch((err) => {
                console.error('Failed to load natal chart:', err);
                showError('Не удалось загрузить натальную карту', {
                  action: {
                    label: 'Повторить',
                    onClick: () => loadData(),
                  },
                });
              })
          );
        }
      }

      // Load horoscopes
      if (zodiacSign) {
        const now = new Date();
        // Daily
        const dailyKey = `horoscope_daily_${zodiacSign}_${formatIsoDate(now)}`;
        const cachedDaily = getCachedData<Horoscope>(dailyKey);

        if (cachedDaily) {
          setHoroscopes((prev) => ({ ...prev, daily: cachedDaily }));
        } else {
          setRatingsLoading(true);
          promises.push(
            api
              .getHoroscope(zodiacSign, 'daily')
              .then((daily) => {
                setHoroscopes((prev) => ({
                  ...prev,
                  daily: daily
                    ? {
                        ...daily,
                        prediction: sanitizePlain(daily.prediction),
                        plainText: sanitizePlain(daily.plainText || daily.prediction),
                      }
                    : daily,
                }));
                if (daily) setCachedData(dailyKey, daily);
              })
              .catch((err) => {
                console.error('Failed to load daily horoscope:', err);
                showError('Не удалось загрузить гороскоп', {
                  action: {
                    label: 'Повторить',
                    onClick: () => loadData(),
                  },
                });
              })
              .finally(() => setRatingsLoading(false))
          );
        }

        // Weekly & Monthly (Premium)
        if (isPremium) {
          const weeklyKey = `horoscope_weekly_${zodiacSign}_${weekStartIso(now)}`;
          const cachedWeekly = getCachedData<Horoscope>(weeklyKey);

          if (cachedWeekly) {
            setHoroscopes((prev) => ({ ...prev, weekly: cachedWeekly }));
          } else {
            promises.push(
              api
                .getHoroscope(zodiacSign, 'weekly')
                .then((weekly) => {
                  setHoroscopes((prev) => ({ ...prev, weekly }));
                  if (weekly) setCachedData(weeklyKey, weekly);
                })
                .catch((err) => {
                  console.error('Failed to load weekly horoscope:', err);
                })
            );
          }

          const monthlyKey = `horoscope_monthly_${zodiacSign}_${monthIso(now)}`;
          const cachedMonthly = getCachedData<Horoscope>(monthlyKey);

          if (cachedMonthly) {
            setHoroscopes((prev) => ({ ...prev, monthly: cachedMonthly }));
          } else {
            promises.push(
              api
                .getHoroscope(zodiacSign, 'monthly')
                .then((monthly) => {
                  setHoroscopes((prev) => ({ ...prev, monthly }));
                  if (monthly) setCachedData(monthlyKey, monthly);
                })
                .catch((err) => {
                  console.error('Failed to load monthly horoscope:', err);
                })
            );
          }
        }
      }

      // Load destiny matrix
      if (normalizedBirthDate) {
        setMatrixLoading(true);
        const matrixKey = `matrix_${normalizedBirthDate}`;
        const cachedMatrix = getCachedData<DestinyMatrix>(matrixKey);

        if (cachedMatrix) {
          setDestinyMatrix(cachedMatrix);
          setMatrixLoading(false);

          // Cached legacy v1 can hide fresh v2 result from another page.
          if (cachedMatrix.calculation_version === 'v1') {
            promises.push(
              api
                .getDestinyMatrix()
                .then((matrix) => {
                  if (matrix && matrix.calculation_version === 'v2') {
                    setDestinyMatrix(matrix);
                    setCachedData(matrixKey, matrix);
                  }
                })
                .catch((err) => {
                  console.error(
                    '[PersonalHero] Failed to refresh destiny matrix from cache:',
                    err
                  );
                })
            );
          }
        } else {
          promises.push(
            api
              .getDestinyMatrix()
              .then(async (matrix) => {
                if (!matrix && normalizedBirthDate) {
                  try {
                    matrix = await api.calculateDestinyMatrix(normalizedBirthDate);
                  } catch (calcErr: any) {
                    console.error(
                      '[PersonalHero] Failed to calculate destiny matrix:',
                      calcErr
                    );
                    showError('Не удалось рассчитать матрицу судьбы', {
                      action: {
                        label: 'Повторить',
                        onClick: () => loadData(),
                      },
                    });
                  }
                }
                setDestinyMatrix(matrix);
                if (matrix) setCachedData(matrixKey, matrix);
              })
              .catch((err) => {
                console.error(
                  '[PersonalHero] Failed to load destiny matrix:',
                  err
                );
                setDestinyMatrix(null);
                showError('Не удалось загрузить матрицу судьбы', {
                  action: {
                    label: 'Повторить',
                    onClick: () => loadData(),
                  },
                });
              })
              .finally(() => setMatrixLoading(false))
          );
        }
      }

      // Execute all promises in parallel
      try {
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } finally {
        setLoading(false);
        setRatingsLoading(false);
      }
    };

    loadData();
  }, [user, normalizedBirthDate, hasBirthData, zodiacSign, isPremium, showError]);

  // WOW effects: Animate blocks appearing with delay
  useEffect(() => {
    if (loading) return;

    const blocks = document.querySelectorAll('.personal-hero-block');
    const hoverHandlers: Array<{
      element: Element;
      enter: () => void;
      leave: () => void;
    }> = [];
    const animations: gsap.core.Tween[] = [];

    blocks.forEach((block, index) => {
      // Initial animation with stagger
      const initialAnim = gsap.fromTo(
        block,
        {
          opacity: 0,
          y: 80,
          scale: 0.85,
          rotationX: -20,
          filter: 'blur(10px)',
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          delay: index * 0.2,
          ease: 'power4.out',
        }
      );
      animations.push(initialAnim);

      // Hover glow effect
      const handleMouseEnter = () => {
        gsap.to(block, {
          scale: 1.02,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(block, {
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      block.addEventListener('mouseenter', handleMouseEnter);
      block.addEventListener('mouseleave', handleMouseLeave);

      hoverHandlers.push({
        element: block,
        enter: handleMouseEnter,
        leave: handleMouseLeave,
      });
    });

    // Special animation for matrix block (last one)
    const matrixBlock = blocks[blocks.length - 1];
    let matrixAnim: gsap.core.Tween | null = null;
    if (matrixBlock) {
      matrixAnim = gsap.fromTo(
        matrixBlock,
        {
          opacity: 0,
          y: 100,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.5,
          delay: blocks.length * 0.2,
          ease: 'elastic.out(1, 0.5)',
        }
      );
      animations.push(matrixAnim);
    }

    // Cleanup function
    return () => {
      // Kill all animations
      animations.forEach((anim) => {
        if (anim) anim.kill();
      });

      // Remove event listeners
      hoverHandlers.forEach(({ element, enter, leave }) => {
        element.removeEventListener('mouseenter', enter);
        element.removeEventListener('mouseleave', leave);
      });
    };
  }, [loading]);

  const handleFillBirthData = () => {
    router.push('/profile');
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  return (
    <section
      className="personal-hero-root relative w-full h-auto min-h-full max-w-full overflow-x-hidden"
      data-hero-density={density}
      style={{ opacity: 1, pointerEvents: 'auto', minWidth: 0 }}
    >
      {/* Background Tunnel Effect */}
      <div
        className="personal-hero-bg hero-bg-wrapper absolute inset-0 w-full h-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src="/backweb.png"
          alt="Background"
          className="hero-bg-img desktop-only"
          style={{
            transition: 'transform 0.1s ease-out',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px)) scale(1.15)`,
          }}
        />
        <img
          src="/backmobile.png"
          alt="Background"
          className="hero-bg-img mobile-only"
          style={{
            transition: 'transform 0.1s ease-out',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px)) scale(1.15)`,
          }}
        />
      </div>

      {/* Dark Overlay */}
      <div
        className="personal-hero-overlay hero-overlay absolute inset-0"
        style={{
          zIndex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          background:
            'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* 3D Stars Background */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 2 + 1;
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          const delay = Math.random() * 3;
          const duration = 3 + Math.random() * 2;

          return (
            <div
              key={i}
              className="absolute rounded-full bg-white star-twinkle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.3 + Math.random() * 0.7,
                animation: `twinkle ${duration}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
                boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)`,
              }}
            />
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-auto min-h-full max-w-full overflow-x-hidden">
        <div className="personal-hero-shell w-full h-auto min-h-full max-w-[1920px] 2xl:max-w-[2200px] mx-auto px-1 sm:px-2 md:px-3 lg:px-4 xl:px-6 2xl:px-8 py-2 sm:py-3 md:py-4 min-w-0">
          <div
            className="personal-hero-layout w-full h-auto min-h-full flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-5 min-w-0"
            style={{ position: 'relative', willChange: 'auto' }}
          >
            {/* Top Row: User Name + Lunar Phase + Ratings Full Width */}
            <TopHeaderBlock
              user={user}
              horoscope={horoscopes.daily}
              ratingsLoading={ratingsLoading}
              isPremium={isPremium}
              density={density}
            />

            {/* Bottom Row: 3 Columns - Equal Size */}
            <div
              className="personal-hero-bottom grid flex-1 items-stretch grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-3 lg:gap-4 xl:gap-5 2xl:gap-6 w-full max-w-full min-w-0 min-h-0"
              style={{ position: 'relative', willChange: 'auto' }}
            >
              {/* Left: Natal Chart */}
              <div
                className="flex flex-col personal-hero-block min-w-0 h-full"
                style={{ position: 'relative', transform: 'translateZ(0)' }}
              >
                {isPremium ? (
                  <NatalChartBlock
                    natalChart={natalChart}
                    user={user}
                    loading={loading}
                    density={density}
                    onViewFull={() =>
                      router.push(
                        natalChart
                          ? '/natal-chart'
                          : hasBirthData
                          ? '/services/natal'
                          : '/profile'
                      )
                    }
                  />
                ) : (
                  <LockedNatalChartBlock
                    hasData={hasBirthData}
                    tier={user.subscriptionTier}
                    onFillData={handleFillBirthData}
                    onUpgrade={handleUpgrade}
                  />
                )}
              </div>

              {/* Center: Destiny Matrix */}
              <div
                className="flex flex-col personal-hero-block min-w-0 h-full"
                style={{ position: 'relative', transform: 'translateZ(0)' }}
              >
                {user.birthDate ? (
                  <DestinyMatrixBlock
                    matrix={destinyMatrix}
                    loading={matrixLoading}
                    onViewDetails={() => router.push('/destiny-matrix')}
                    fullWidth={false}
                    density={density}
                  />
                ) : (
                  <div className="hero-card mira-card mira-card-hover p-5 text-center h-full flex flex-col items-center justify-center">
                    <div className="text-3xl mb-2 opacity-50">💫</div>
                    <h3 className="hero-title-main mira-card-title mb-2">Матрица судьбы</h3>
                    <p className="hero-body text-silver/70 text-sm mb-3 tracking-wide">
                      Заполните дату рождения
                    </p>
                    <button
                      onClick={handleFillBirthData}
                      className="mira-button w-full sm:max-w-[260px] text-sm"
                    >
                      Заполнить данные
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Horoscope */}
              <div
                className="flex flex-col personal-hero-block min-w-0 h-full"
                style={{ position: 'relative', transform: 'translateZ(0)' }}
              >
                {zodiacSign ? (
                  <CompactHoroscopeBlock
                    horoscopes={horoscopes}
                    loading={loading}
                    density={density}
                    onViewFull={(period) =>
                      router.push(
                        `/services/horoscope?sign=${zodiacSign}&period=${period}`
                      )
                    }
                    tier={user.subscriptionTier}
                    luckyNumbers={horoscopes.daily?.luckyNumbers || undefined}
                    luckyColors={horoscopes.daily?.luckyColors || undefined}
                  />
                ) : (
                  <LockedHoroscopeBlock onFillData={handleFillBirthData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
