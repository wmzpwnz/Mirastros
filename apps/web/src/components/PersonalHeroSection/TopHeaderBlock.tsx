'use client';

import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { api } from '../../services/api';
import type { User, Horoscope } from '../../types';
import type { HeroDensity } from '../hero/heroDensity';
import { LifeAreaRatings } from '../LifeAreaRatings';
import { ZODIAC_EMOJIS } from '../../constants/zodiac';
import { MOON_PHASES, MOON_PHASE_NAMES } from '../../constants/moon';
import { ACTIVITY_NAMES_RU } from '../../constants/activities';

type LunarPhaseData = {
  phase?: string;
  phase_name?: string;
  illumination?: number;
  date?: string;
  zodiac_sign?: string;
  moon_degree?: number;
  next_full_moon?: string;
  next_new_moon?: string;
  description?: string;
};

type LunarActivityRecommendation = {
  activity: string;
  favorability: string;
  score?: number;
  recommendation?: string;
};

type LunarRecommendationsData = {
  date?: string;
  lunar_phase?: string;
  moon_sign?: string;
  recommendations?: LunarActivityRecommendation[];
  general_advice?: string;
  is_personalized?: boolean;
};

interface TopHeaderBlockProps {
  user: User;
  horoscope: Horoscope | null;
  ratingsLoading: boolean;
  isPremium: boolean;
  density: HeroDensity;
}

export const TopHeaderBlock: React.FC<TopHeaderBlockProps> = ({
  user,
  horoscope,
  ratingsLoading,
  isPremium,
  density,
}) => {
  const [lunarData, setLunarData] = useState<LunarPhaseData | null>(null);
  const [lunarRecommendations, setLunarRecommendations] =
    useState<LunarRecommendationsData | null>(null);
  const zodiacEmojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let hourlyInterval: ReturnType<typeof setInterval> | null = null;
    let midnightRefreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const loadLunarData = async () => {
      try {
        const lunar = await api.getLunarPhase();
        if (!isMounted) return;
        setLunarData(lunar);

        // Load recommendations if premium
        if (isPremium) {
          try {
            const recommendations = await api.getLunarRecommendations();
            if (!isMounted) return;
            setLunarRecommendations(recommendations);
          } catch (err) {
            console.error('Failed to load lunar recommendations:', err);
          }
        } else {
          setLunarRecommendations(null);
        }
      } catch (err) {
        console.error('Failed to load lunar data:', err);
      }
    };

    const scheduleMidnightRefresh = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = nextMidnight.getTime() - now.getTime();

      midnightRefreshTimeout = setTimeout(async () => {
        await loadLunarData();
        scheduleMidnightRefresh();
      }, delay);
    };

    loadLunarData();

    // Keep lunar content relevant during long dashboard sessions
    hourlyInterval = setInterval(loadLunarData, 60 * 60 * 1000);
    scheduleMidnightRefresh();

    return () => {
      isMounted = false;
      if (hourlyInterval) clearInterval(hourlyInterval);
      if (midnightRefreshTimeout) clearTimeout(midnightRefreshTimeout);
    };
  }, [isPremium]);

  // Calculate days until next moon event
  const getDaysUntil = (dateString: string): number => {
    if (!dateString) return 0;
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getDaysWord = (days: number): string => {
    const mod10 = days % 10;
    const mod100 = days % 100;
    if (mod10 === 1 && mod100 !== 11) return 'день';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
    return 'дней';
  };

  const normalizeMoonSign = (value?: string): string => {
    if (!value) return '—';
    const normalized = value.trim().toLowerCase();

    const moonSignsRu: Record<string, string> = {
      aries: 'Овен',
      ari: 'Овен',
      taurus: 'Телец',
      tau: 'Телец',
      gemini: 'Близнецы',
      gem: 'Близнецы',
      cancer: 'Рак',
      can: 'Рак',
      leo: 'Лев',
      virgo: 'Дева',
      vir: 'Дева',
      libra: 'Весы',
      lib: 'Весы',
      scorpio: 'Скорпион',
      sco: 'Скорпион',
      sagittarius: 'Стрелец',
      sag: 'Стрелец',
      capricorn: 'Козерог',
      cap: 'Козерог',
      aquarius: 'Водолей',
      aqu: 'Водолей',
      pisces: 'Рыбы',
      pis: 'Рыбы',
    };

    return moonSignsRu[normalized] || value;
  };

  // Determine energy level based on phase
  const getEnergyLevel = (phase: string): { level: string; emoji: string } => {
    const highEnergyPhases = ['full_moon', 'waxing_gibbous'];
    const mediumEnergyPhases = [
      'first_quarter',
      'last_quarter',
      'waxing_crescent',
      'waning_gibbous',
    ];

    if (highEnergyPhases.includes(phase)) {
      return { level: 'Высокая', emoji: '⚡' };
    } else if (mediumEnergyPhases.includes(phase)) {
      return { level: 'Средняя', emoji: '✨' };
    } else {
      return { level: 'Низкая', emoji: '🌙' };
    }
  };

  // 3D rotation effect for zodiac emoji
  useEffect(() => {
    if (zodiacEmojiRef.current && user.zodiacSign) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = zodiacEmojiRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = (y / rect.height) * 20;
        const rotateY = (x / rect.width) * 20;

        gsap.to(zodiacEmojiRef.current, {
          rotateX: -rotateX,
          rotateY: rotateY,
          duration: 0.3,
          ease: 'power2.out',
        });
      };

      const handleMouseLeave = () => {
        gsap.to(zodiacEmojiRef.current, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      };

      zodiacEmojiRef.current.addEventListener('mousemove', handleMouseMove);
      zodiacEmojiRef.current.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        zodiacEmojiRef.current?.removeEventListener(
          'mousemove',
          handleMouseMove
        );
        zodiacEmojiRef.current?.removeEventListener(
          'mouseleave',
          handleMouseLeave
        );
      };
    }
  }, [user.zodiacSign]);

  const zodiacEmoji = user.zodiacSign
    ? ZODIAC_EMOJIS[user.zodiacSign] || '⭐'
    : '⭐';

  const moonEmoji = lunarData?.phase
    ? MOON_PHASES[lunarData.phase] || '🌙'
    : '🌙';
  const moonPhaseName = lunarData?.phase
    ? MOON_PHASE_NAMES[lunarData.phase] || lunarData.phase_name || '—'
    : lunarData?.phase_name || 'Загрузка...';
  const moonSignName = normalizeMoonSign(lunarData?.zodiac_sign);
  const isComfort = density === 'comfort';
  const isCompact = density === 'compact';
  const isUltra = density === 'ultra';
  const recommendationLimit = isComfort ? 3 : 2;
  const luckyNumberLimit = isCompact ? 4 : 5;
  const luckyColorLimit = isCompact ? 3 : 99;

  return (
    <div className="personal-hero-block personal-hero-top w-full min-w-0 overflow-x-hidden">
      <div className="hero-card mira-card mira-card-hover p-2 sm:p-3 md:p-3 lg:p-4 xl:p-5 2xl:p-6 overflow-x-hidden">
        <div className="personal-hero-top-grid grid gap-2 sm:gap-3 md:gap-3 lg:gap-4 xl:gap-5 2xl:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 min-w-0">
          {/* 1) Lunar */}
          <div className="hero-top-lunar flex flex-col gap-3 sm:gap-4 min-w-0">
            <div className="hero-card flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-md">
              <div className="relative">
                <div className="absolute inset-0 bg-mirastros-gold/20 blur-xl rounded-full"></div>
                <span className="hero-top-symbol text-5xl relative z-10 drop-shadow-lg">
                  {moonEmoji}
                </span>
              </div>
              <div className="min-w-0 flex-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="hero-kicker text-silver/50 text-xs font-bold uppercase tracking-widest mb-1">
                    Лунная фаза
                  </p>
                  <p className="hero-title-main text-white text-2xl font-cinzel font-bold tracking-wide leading-none mb-2">
                    {moonPhaseName}
                  </p>

                  {lunarData?.moon_degree !== undefined &&
                    lunarData?.zodiac_sign && (
                      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-silver/80">
                        {lunarData.moon_degree.toFixed(1)}° в {moonSignName}
                      </div>
                    )}
                </div>

                {lunarData?.illumination !== undefined && (
                  <div className="w-full sm:w-[150px] flex-shrink-0">
                    <p className="hero-kicker text-[10px] text-silver/50 uppercase tracking-wider text-left mb-1">
                      Освещенность
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-black/55 border border-white/15 rounded-full overflow-hidden flex-1">
                        <div
                          className="h-full bg-gradient-to-r from-mirastros-gold/60 to-mirastros-gold rounded-full"
                          style={{
                            width: `max(6px, ${Math.max(
                              0,
                              Math.min(100, lunarData.illumination)
                            )}%)`,
                          }}
                        />
                      </div>
                      <p className="text-white text-sm font-semibold tabular-nums min-w-[40px] text-right">
                        {Math.round(lunarData.illumination)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:gap-3 sm:grid-cols-2 min-w-0">
              {lunarData?.phase && (
                <div className="hero-card bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => {
                      const energy = getEnergyLevel(lunarData.phase);
                      return (
                        <>
                          <span className="text-xl text-mirastros-gold">
                            {energy.emoji}
                          </span>
                          <span className="text-sm font-bold text-white uppercase tracking-wider">
                            Энергия
                          </span>
                        </>
                      );
                    })()}
                  </div>
                  {(() => {
                    const energy = getEnergyLevel(lunarData.phase);
                    return (
                      <p className="text-mirastros-gold text-lg font-bold mb-3">
                        {energy.level}
                      </p>
                    );
                  })()}

                  {isPremium &&
                    !isUltra &&
                    lunarRecommendations?.recommendations &&
                    lunarRecommendations.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-white text-xs mb-2 font-medium tracking-wide flex items-center gap-1.5">
                          <span className="text-mirastros-gold">💫</span>
                          <span>Рекомендации</span>
                        </p>
                        <div
                          className={isCompact ? 'space-y-1' : 'space-y-1.5'}
                        >
                          {lunarRecommendations.recommendations
                            .filter(
                              (rec: LunarActivityRecommendation) =>
                                rec.favorability === 'favorable'
                            )
                            .slice(0, recommendationLimit)
                            .map(
                              (rec: LunarActivityRecommendation, i: number) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-white text-xs">✓</span>
                                  <span className="text-white text-xs tracking-wide">
                                    {ACTIVITY_NAMES_RU[rec.activity] ||
                                      rec.activity}
                                  </span>
                                </div>
                              )
                            )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {!isUltra &&
                (lunarData?.next_full_moon || lunarData?.next_new_moon) && (
                  <div className="hero-card bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                    <p className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                      Ближайшие события
                    </p>
                    <div className={isCompact ? 'space-y-1.5' : 'space-y-2.5'}>
                      {lunarData.next_full_moon && (
                        <div className="flex items-start gap-2">
                          <span className="text-lg flex-shrink-0">🌕</span>
                          <div className="flex-1 min-w-0">
                            <p className="hero-body text-silver/80 text-sm font-medium tracking-wide">
                              Полнолуние
                            </p>
                            <p className="text-silver/60 text-xs tracking-wide">
                              {new Date(
                                lunarData.next_full_moon
                              ).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                            {(() => {
                              const days = getDaysUntil(
                                lunarData.next_full_moon
                              );
                              return !isUltra ? (
                                <p className="text-mirastros-gold text-xs font-semibold mt-0.5">
                                  {days > 0
                                    ? isCompact
                                      ? `${days} ${getDaysWord(days)}`
                                      : `через ${days} ${getDaysWord(days)}`
                                    : 'сегодня'}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                      {lunarData.next_new_moon && (
                        <div className="flex items-start gap-2">
                          <span className="text-lg flex-shrink-0">🌑</span>
                          <div className="flex-1 min-w-0">
                            <p className="hero-body text-silver/80 text-sm font-medium tracking-wide">
                              Новолуние
                            </p>
                            <p className="text-silver/60 text-xs tracking-wide">
                              {new Date(
                                lunarData.next_new_moon
                              ).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                            {(() => {
                              const days = getDaysUntil(
                                lunarData.next_new_moon
                              );
                              return !isUltra ? (
                                <p className="text-mirastros-gold text-xs font-semibold mt-0.5">
                                  {days > 0
                                    ? isCompact
                                      ? `${days} ${getDaysWord(days)}`
                                      : `через ${days} ${getDaysWord(days)}`
                                    : 'сегодня'}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* 2) User */}
          <div className="hero-card hero-top-user flex items-start gap-4 h-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm min-w-0">
            <div
              ref={zodiacEmojiRef}
              className="hero-top-symbol text-5xl cursor-pointer flex-shrink-0 drop-shadow-md"
              style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
            >
              {zodiacEmoji}
            </div>
            <div className="min-w-0 flex-1 flex flex-col h-full">
              <div className="flex-shrink-0">
                <h2 className="hero-title-main text-3xl font-cinzel font-bold text-white bg-gradient-to-r from-white via-mirastros-gold to-white bg-clip-text text-transparent leading-none mb-2 tracking-wide break-words drop-shadow-sm">
                  {user.fullName}
                </h2>
                {user.zodiacSign && (
                  <p className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-mirastros-gold/10 text-mirastros-gold border border-mirastros-gold/20 mb-2">
                    {user.zodiacSign}
                  </p>
                )}
                {user.birthDate && (
                  <p className="hero-kicker text-silver/50 text-xs tracking-wider uppercase font-medium">
                    {user.birthDate}
                  </p>
                )}
              </div>

              {lunarData?.description && !isUltra && (
                <div className="hero-lunar-description flex-shrink-0 mt-auto pt-4 relative">
                  <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <p className="hero-kicker text-silver/50 text-[10px] uppercase tracking-widest text-center mb-1">
                    Лунное влияние
                  </p>
                  <p
                    className={`hero-body text-silver/80 text-sm leading-relaxed text-center italic ${
                      isCompact ? 'line-clamp-2' : ''
                    }`}
                  >
                    "{lunarData.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3) Ratings / Lucky */}
          <div className="hero-card hero-top-ratings min-w-0 h-full p-4 rounded-xl bg-gradient-to-br from-black/40 via-slate-900/20 to-black/20 border border-mirastros-gold/25 shadow-[0_0_30px_rgba(212,175,55,0.16)] backdrop-blur-sm flex flex-col justify-between">
            {isPremium && horoscope?.ratings ? (
              <>
                <h3 className="hero-kicker text-sm font-bold text-white mb-3 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-mirastros-gold">📊</span> Рейтинги дня
                </h3>
                <LifeAreaRatings
                  ratings={horoscope.ratings}
                  explanations={horoscope.explanations}
                  loading={ratingsLoading}
                />

                {!isUltra &&
                  horoscope &&
                  ((horoscope.luckyNumbers &&
                    Array.isArray(horoscope.luckyNumbers) &&
                    horoscope.luckyNumbers.length > 0) ||
                    (horoscope.luckyColors &&
                      Array.isArray(horoscope.luckyColors) &&
                      horoscope.luckyColors.length > 0)) && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 mira-divider">
                      <div className="hero-top-lucky-grid grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 min-w-0">
                        {horoscope.luckyNumbers &&
                          horoscope.luckyNumbers.length > 0 && (
                            <div className="min-w-0 overflow-x-hidden">
                              <p className="text-silver/80 text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium flex items-center gap-1 sm:gap-1.5 tracking-wide">
                                <span className="text-sm sm:text-base flex-shrink-0">
                                  🍀
                                </span>
                                <span className="uppercase tracking-wider text-xs sm:text-sm truncate">
                                  Счастливые числа
                                </span>
                              </p>
                              <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                                {horoscope.luckyNumbers
                                  .slice(0, luckyNumberLimit)
                                  .map((num, i) => (
                                    <span
                                      key={i}
                                      className="mira-chip-gold text-xs sm:text-sm"
                                      style={{
                                        minWidth: 'clamp(2rem, 5vw, 2.5rem)',
                                      }}
                                    >
                                      {num}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}

                        {horoscope.luckyColors &&
                          horoscope.luckyColors.length > 0 && (
                            <div className="min-w-0 overflow-x-hidden">
                              <p className="text-silver/80 text-sm mb-2 font-medium flex items-center gap-1.5 tracking-wide">
                                <span className="text-base flex-shrink-0">
                                  🎨
                                </span>
                                <span className="uppercase tracking-wider text-sm truncate">
                                  Цвета
                                </span>
                              </p>
                              <div className="flex gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden">
                                {horoscope.luckyColors
                                  .slice(0, luckyColorLimit)
                                  .map((color, i) => (
                                    <span
                                      key={i}
                                      className="mira-chip-neutral flex-shrink-0 text-xs sm:text-sm"
                                    >
                                      {color}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              !isUltra &&
              horoscope &&
              ((horoscope.luckyNumbers &&
                Array.isArray(horoscope.luckyNumbers) &&
                horoscope.luckyNumbers.length > 0) ||
                (horoscope.luckyColors &&
                  Array.isArray(horoscope.luckyColors) &&
                  horoscope.luckyColors.length > 0)) && (
                <>
                  <h3 className="text-sm sm:text-base font-semibold text-white mb-3 bg-gradient-to-r from-white to-mirastros-gold bg-clip-text text-transparent tracking-wide">
                    🍀 Счастливые числа и цвета
                  </h3>
                  <div className="hero-top-lucky-grid grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 min-w-0">
                    {horoscope.luckyNumbers &&
                      horoscope.luckyNumbers.length > 0 && (
                        <div className="min-w-0 overflow-x-hidden">
                          <p className="text-silver/80 text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium flex items-center gap-1 sm:gap-1.5 tracking-wide">
                            <span className="text-sm sm:text-base flex-shrink-0">
                              🍀
                            </span>
                            <span className="uppercase tracking-wider text-xs sm:text-sm truncate">
                              Счастливые числа
                            </span>
                          </p>
                          <div className="flex gap-1 sm:gap-1.5 flex-wrap">
                            {horoscope.luckyNumbers
                              .slice(0, luckyNumberLimit)
                              .map((num, i) => (
                                <span
                                  key={i}
                                  className="mira-chip-gold text-xs sm:text-sm"
                                  style={{
                                    minWidth: 'clamp(2rem, 5vw, 2.5rem)',
                                  }}
                                >
                                  {num}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                    {horoscope.luckyColors &&
                      horoscope.luckyColors.length > 0 && (
                        <div className="min-w-0 overflow-x-hidden">
                          <p className="text-silver/80 text-sm mb-2 font-medium flex items-center gap-1.5 tracking-wide">
                            <span className="text-base flex-shrink-0">🎨</span>
                            <span className="uppercase tracking-wider text-sm truncate">
                              Цвета
                            </span>
                          </p>
                          <div className="flex gap-1 sm:gap-1.5 flex-nowrap overflow-x-auto overflow-y-hidden">
                            {horoscope.luckyColors
                              .slice(0, luckyColorLimit)
                              .map((color, i) => (
                                <span
                                  key={i}
                                  className="mira-chip-neutral flex-shrink-0 text-xs sm:text-sm"
                                >
                                  {color}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
