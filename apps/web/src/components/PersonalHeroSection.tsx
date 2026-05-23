'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { api } from '../services/api';
import type { User, NatalChart, Horoscope, DestinyMatrix } from '../types';
import { UserInfoBlock } from './UserInfoBlock';
import { CompactHoroscopeBlock } from './CompactHoroscopeBlock';
import { DestinyMatrixBlock } from './DestinyMatrixBlock';
import { LifeAreaRatings } from './LifeAreaRatings';
import { NatalChartWheel } from './natal/NatalChartWheel';
import { useHeroDensity } from './hero/heroDensity';
import type { HeroDensity } from './hero/heroDensity';

// Top Header Block: User Name + Lunar Phase + Ratings
const TopHeaderBlock: React.FC<{
  user: User;
  horoscope: Horoscope | null;
  ratingsLoading: boolean;
  isPremium: boolean;
  density: HeroDensity;
}> = ({ user, horoscope, ratingsLoading, isPremium, density }) => {
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

  const [lunarData, setLunarData] = useState<LunarPhaseData | null>(null);
  const [lunarRecommendations, setLunarRecommendations] =
    useState<LunarRecommendationsData | null>(null);
  const zodiacEmojiRef = React.useRef<HTMLDivElement>(null);

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
    if (!zodiacEmojiRef.current || !user.zodiacSign) return;

    let ctx = gsap.context(() => {
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

      zodiacEmojiRef.current?.addEventListener('mousemove', handleMouseMove);
      zodiacEmojiRef.current?.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => ctx.revert();
  }, [user.zodiacSign]);

  const ZODIAC_EMOJIS: Record<string, string> = {
    Овен: '♈',
    Aries: '♈',
    Телец: '♉',
    Taurus: '♉',
    Близнецы: '♊',
    Gemini: '♊',
    Рак: '♋',
    Cancer: '♋',
    Лев: '♌',
    Leo: '♌',
    Дева: '♍',
    Virgo: '♍',
    Весы: '♎',
    Libra: '♎',
    Скорпион: '♏',
    Scorpio: '♏',
    Стрелец: '♐',
    Sagittarius: '♐',
    Козерог: '♑',
    Capricorn: '♑',
    Водолей: '♒',
    Aquarius: '♒',
    Рыбы: '♓',
    Pisces: '♓',
  };

  const MOON_PHASES: Record<string, string> = {
    new_moon: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full_moon: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
  };

  const MOON_PHASE_NAMES: Record<string, string> = {
    new_moon: 'Новолуние',
    waxing_crescent: 'Растущая',
    first_quarter: 'Первая четверть',
    waxing_gibbous: 'Прибывающая',
    full_moon: 'Полнолуние',
    waning_gibbous: 'Убывающая',
    last_quarter: 'Последняя четверть',
    waning_crescent: 'Убывающий серп',
  };

  const ACTIVITY_NAMES_RU: Record<string, string> = {
    spiritual: 'Духовные практики',
    planning: 'Планирование',
    meditation: 'Медитация',
    intention_setting: 'Постановка намерений',
    creative: 'Творчество',
    learning: 'Обучение',
    surgery: 'Операции',
    major_decisions: 'Важные решения',
    launching: 'Запуск проектов',
    business: 'Бизнес',
    planting: 'Посадка растений',
    starting_projects: 'Начало проектов',
    travel: 'Путешествия',
    moving: 'Переезд',
    ending_relationships: 'Завершение отношений',
    financial: 'Финансы',
    negotiations: 'Переговоры',
    competitions: 'Соревнования',
    haircut: 'Стрижка',
    risky_ventures: 'Рискованные начинания',
    networking: 'Нетворкинг',
    major_purchases: 'Крупные покупки',
    wedding: 'Свадьба',
    celebration: 'Празднование',
    manifestation: 'Манифестация',
    completion: 'Завершение',
    starting_new_projects: 'Начало новых проектов',
    teaching: 'Обучение других',
    sharing: 'Делиться',
    gratitude_practices: 'Практики благодарности',
    starting_new_ventures: 'Новые начинания',
    cleansing: 'Очищение',
    releasing: 'Освобождение',
    decluttering: 'Расхламление',
    rest: 'Отдых',
    healing: 'Исцеление',
    reflection: 'Рефлексия',
  };

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
                              (rec: any) => rec.favorability === 'favorable'
                            )
                            .slice(0, recommendationLimit)
                            .map((rec: any, i: number) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="text-white text-xs">✓</span>
                                <span className="text-white text-xs tracking-wide">
                                  {ACTIVITY_NAMES_RU[rec.activity] ||
                                    rec.activity}
                                </span>
                              </div>
                            ))}
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
                          <span className="text-lg flex-shrink-0 text-mirastros-gold">
                            🌕
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium tracking-wide">
                              Полнолуние
                            </p>
                            <p className="text-white text-xs tracking-wide">
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
                                <p className="text-mirastros-gold text-xs font-bold mt-0.5">
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
                            <p className="text-white text-sm font-medium tracking-wide">
                              Новолуние
                            </p>
                            <p className="text-white text-xs tracking-wide">
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
                                <p className="text-mirastros-gold text-xs font-bold mt-0.5">
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
                    className={`hero-body text-silver/80 text-sm leading-relaxed text-center italic ${isCompact ? 'line-clamp-2' : ''
                      }`}
                  >
                    "{lunarData.description}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3) Daily focus */}
          {isPremium && horoscope?.ratings ? (
            <div className="hero-card hero-top-ratings min-w-0 h-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center gap-2">
                <span className="text-mirastros-gold">📊</span> Рейтинги дня
              </h3>
              <LifeAreaRatings
                ratings={horoscope.ratings}
                explanations={horoscope.explanations}
                loading={ratingsLoading}
              />
            </div>
          ) : (
            <div className="hero-card hero-top-focus min-w-0 h-full p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <p className="hero-kicker text-silver/50 text-xs font-bold uppercase tracking-widest mb-2">
                  Фокус дня
                </p>
                <h3 className="hero-title-main text-white font-bold mb-3">
                  {horoscope?.prediction ? 'Личный ритм уже открыт' : 'Карта дня настраивается'}
                </h3>
                <p className="hero-body text-silver/75 line-clamp-3">
                  {horoscope?.prediction
                    ? sanitizePlain(horoscope.prediction).slice(0, 190)
                    : 'Mirastros собирает лунные и персональные координаты, чтобы показать первый ориентир дня.'}
                </p>
              </div>
              <div className="hero-focus-chips">
                <span>ежедневно</span>
                <span>{isPremium ? 'premium' : 'free'}</span>
                {user.zodiacSign && <span>{user.zodiacSign}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PersonalHeroSectionProps {
  user: User;
}

const ZODIAC_SIGNS: Record<
  string,
  {
    name: string;
    emoji: string;
    dates: string;
    element: string;
    planet: string;
    image: string;
  }
> = {
  aries: {
    name: 'Овен',
    emoji: '♈',
    dates: '21 марта - 19 апреля',
    element: 'Огонь',
    planet: 'Марс',
    image: '/zodiac/aries.png',
  },
  taurus: {
    name: 'Телец',
    emoji: '♉',
    dates: '20 апреля - 20 мая',
    element: 'Земля',
    planet: 'Венера',
    image: '/zodiac/taurus.png',
  },
  gemini: {
    name: 'Близнецы',
    emoji: '♊',
    dates: '21 мая - 20 июня',
    element: 'Воздух',
    planet: 'Меркурий',
    image: '/zodiac/gemini.png',
  },
  cancer: {
    name: 'Рак',
    emoji: '♋',
    dates: '21 июня - 22 июля',
    element: 'Вода',
    planet: 'Луна',
    image: '/zodiac/cancer.png',
  },
  leo: {
    name: 'Лев',
    emoji: '♌',
    dates: '23 июля - 22 августа',
    element: 'Огонь',
    planet: 'Солнце',
    image: '/zodiac/leo.png',
  },
  virgo: {
    name: 'Дева',
    emoji: '♍',
    dates: '23 августа - 22 сентября',
    element: 'Земля',
    planet: 'Меркурий',
    image: '/zodiac/virgo.png',
  },
  libra: {
    name: 'Весы',
    emoji: '♎',
    dates: '23 сентября - 22 октября',
    element: 'Воздух',
    planet: 'Венера',
    image: '/zodiac/libra.png',
  },
  scorpio: {
    name: 'Скорпион',
    emoji: '♏',
    dates: '23 октября - 21 ноября',
    element: 'Вода',
    planet: 'Плутон',
    image: '/zodiac/scorpio.png',
  },
  sagittarius: {
    name: 'Стрелец',
    emoji: '♐',
    dates: '22 ноября - 21 декабря',
    element: 'Огонь',
    planet: 'Юпитер',
    image: '/zodiac/sagittarius.png',
  },
  capricorn: {
    name: 'Козерог',
    emoji: '♑',
    dates: '22 декабря - 19 января',
    element: 'Земля',
    planet: 'Сатурн',
    image: '/zodiac/capricorn.png',
  },
  aquarius: {
    name: 'Водолей',
    emoji: '♒',
    dates: '20 января - 18 февраля',
    element: 'Воздух',
    planet: 'Уран',
    image: '/zodiac/aquarius.png',
  },
  pisces: {
    name: 'Рыбы',
    emoji: '♓',
    dates: '19 февраля - 20 марта',
    element: 'Вода',
    planet: 'Нептун',
    image: '/zodiac/pisces.png',
  },
};

const ZODIAC_KEYS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

// Cache helpers
const CACHE_PREFIX = 'mira_hero_cache_';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const MATRIX_UPDATED_EVENT = 'mira:matrix-updated';
const normalizeBirthDate = (value?: string | null) =>
  (value || '').split('T')[0];
const formatIsoDate = (d: Date) => d.toISOString().slice(0, 10);
const weekStartIso = (d: Date) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7));
  return formatIsoDate(copy);
};
const monthIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const sanitizePlain = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/[*_~#[\]()]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

const getCachedData = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const item = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCachedData = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    console.warn('Cache quota exceeded');
  }
};

export const PersonalHeroSection: React.FC<PersonalHeroSectionProps> = ({
  user,
}) => {
  const router = useRouter();
  const density = useHeroDensity();
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
  const [lunarData, setLunarData] = useState<any | null>(null);

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

    window.addEventListener(
      MATRIX_UPDATED_EVENT,
      onMatrixUpdated as EventListener
    );
    return () =>
      window.removeEventListener(
        MATRIX_UPDATED_EVENT,
        onMatrixUpdated as EventListener
      );
  }, [normalizedBirthDate]);

  useEffect(() => {
    let cancelled = false;

    api
      .getLunarPhase()
      .then((data) => {
        if (!cancelled) setLunarData(data);
      })
      .catch((err) => {
        console.error('Failed to load lunar phase:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
              .catch((err) => console.error('Failed to load natal chart:', err))
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
                      plainText: sanitizePlain(
                        daily.plainText || daily.prediction
                      ),
                    }
                    : daily,
                }));
                if (daily) setCachedData(dailyKey, daily);
              })
              .catch((err) =>
                console.error('Failed to load daily horoscope:', err)
              )
              .finally(() => setRatingsLoading(false))
          );
        }

        // Weekly & Monthly (Premium)
        if (isPremium) {
          const weeklyKey = `horoscope_weekly_${zodiacSign}_${weekStartIso(
            now
          )}`;
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
                .catch((err) =>
                  console.error('Failed to load weekly horoscope:', err)
                )
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
                .catch((err) =>
                  console.error('Failed to load monthly horoscope:', err)
                )
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
                    matrix = await api.calculateDestinyMatrix(
                      normalizedBirthDate
                    );
                  } catch (calcErr: any) {
                    console.error(
                      '[PersonalHero] Failed to calculate destiny matrix:',
                      calcErr
                    );
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
  }, [user, normalizedBirthDate, hasBirthData, zodiacSign, isPremium]);

  // WOW effects: Animate blocks appearing with delay
  useEffect(() => {
    if (loading) return;

    let ctx = gsap.context(() => {
      const blocks = document.querySelectorAll('.personal-hero-block');

      blocks.forEach((block, index) => {
        // Initial animation with stagger
        gsap.fromTo(
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

        // Hover glow effect using local functions within ctx
        const onEnter = () => gsap.to(block, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
        const onLeave = () => gsap.to(block, { scale: 1, duration: 0.3, ease: 'power2.out' });

        block.addEventListener('mouseenter', onEnter);
        block.addEventListener('mouseleave', onLeave);
      });

      // Special animation for matrix block (last one)
      const matrixBlock = blocks[blocks.length - 1];
      if (matrixBlock) {
        gsap.fromTo(
          matrixBlock,
          { opacity: 0, y: 100, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            delay: blocks.length * 0.2,
            ease: 'elastic.out(1, 0.5)',
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading]);

  const handleFillBirthData = () => {
    router.push('/profile');
  };

  const handleUpgrade = () => {
    router.push('/subscription');
  };

  const displayName = user.fullName?.split(' ')[0] || 'Искатель';
  const todayLabel = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  const dailyText = sanitizePlain(
    horoscopes.daily?.plainText ||
    horoscopes.daily?.prediction ||
    'Персональный прогноз уже готовится. Заполните данные рождения, чтобы Mirastros точнее настроил дневной ритм.'
  );
  const lunarTitle =
    lunarData?.phaseName ||
    lunarData?.phase_name ||
    lunarData?.phase ||
    'Лунный ритм';
  const lunarSign = lunarData?.zodiac_sign || lunarData?.moon_sign || 'Скорпион';
  const lunarIllumination =
    typeof lunarData?.illumination === 'number'
      ? Math.round(lunarData.illumination)
      : typeof lunarData?.illumination_percent === 'number'
        ? Math.round(lunarData.illumination_percent)
        : 100;
  const energyLevel =
    lunarIllumination >= 82
      ? 'Высокая'
      : lunarIllumination >= 52
        ? 'Собранная'
        : lunarIllumination >= 24
          ? 'Мягкая'
          : 'Тихая';
  const energyHint =
    lunarIllumination >= 82
      ? 'День подходит для завершения, проявления и ясных решений.'
      : lunarIllumination >= 52
        ? 'Лучше двигаться спокойно: выбирать главное и не распыляться.'
        : lunarIllumination >= 24
          ? 'Хорошее время для настройки, восстановления и внутренних ответов.'
          : 'Подходит для паузы, наблюдения и бережного планирования.';
  const upcomingEvent =
    lunarData?.next_full_moon
      ? `Полнолуние: ${new Date(lunarData.next_full_moon).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })}`
      : lunarData?.next_new_moon
        ? `Новолуние: ${new Date(lunarData.next_new_moon).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
        })}`
        : 'Следите за ближайшим лунным переходом';
  const dailyRecommendation =
    energyLevel === 'Высокая'
      ? 'Начните с гороскопа дня и выберите одно действие, которое давно откладывали.'
      : energyLevel === 'Собранная'
        ? 'Сфокусируйтесь на одном намерении и проверьте его через дневной прогноз.'
        : energyLevel === 'Мягкая'
          ? 'Не форсируйте события: сегодня важнее услышать тонкий внутренний сигнал.'
          : 'Сделайте день тише: меньше внешнего шума, больше наблюдения за знаками.';

  return (
    <section
      className="personal-hero-root dashboard-cockpit-root relative w-full h-auto min-h-full max-w-full overflow-x-hidden"
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
        {Array.from({ length: 42 }).map((_, i) => {
          const size = (i % 3) + 1;
          const x = (i * 37) % 100;
          const y = (i * 53) % 100;
          const delay = (i % 9) * 0.28;
          const duration = 3 + (i % 5) * 0.36;

          return (
            <div
              key={i}
              className="absolute rounded-full bg-white star-twinkle"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.35 + (i % 5) * 0.11,
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
      <div className="dashboard-oracle">
        <header className="dashboard-oracle-top personal-hero-block">
          <div className="oracle-brandline">
            <span>Mirastros daily</span>
            <strong>{displayName}</strong>
          </div>
          <div className="dashboard-oracle-meta">
            <span>{todayLabel}</span>
            <span>{zodiacInfo?.name || user.zodiacSign || 'Знак не указан'}</span>
            <span>{isPremium ? 'Premium' : 'Free'}</span>
          </div>
        </header>

        <section className="dashboard-oracle-main" aria-label="Daily Oracle">
          <article className="oracle-side-card oracle-side-card--moon personal-hero-block">
            <div className="oracle-card-head">
              <div className="oracle-moon-visual" aria-hidden="true">
                <span />
              </div>
              <div>
                <p className="dashboard-kicker">Луна сейчас</p>
                <h2>{lunarTitle}</h2>
              </div>
            </div>
            <div className="oracle-meter">
              <span style={{ width: `${Math.max(0, Math.min(100, lunarIllumination))}%` }} />
            </div>
            <div className="oracle-stats">
              <span>Освещенность <strong>{lunarIllumination}%</strong></span>
              <span>Знак Луны <strong>{lunarSign}</strong></span>
            </div>
          </article>

          <article className="oracle-focus-card personal-hero-block">
            <div className="oracle-focus-bg" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="oracle-focus-orb" aria-hidden="true">
              <span>{zodiacInfo?.emoji || '✦'}</span>
            </div>
            <div className="oracle-focus-copy">
              <p className="dashboard-kicker">Фокус дня</p>
              <h2>
                <span>Личный ритм</span>
                <span>уже открыт</span>
              </h2>
              <p>{dailyText}</p>
              <button
                type="button"
                onClick={() =>
                  router.push(`/services/horoscope${zodiacSign ? `?sign=${zodiacSign}&period=daily` : ''}`)
                }
                className="dashboard-primary-action"
              >
                Читать прогноз
              </button>
            </div>
          </article>

          <article className="oracle-side-card oracle-side-card--horoscope personal-hero-block">
            <div className="oracle-card-head">
              <span className="oracle-card-icon">☉</span>
              <div>
                <p className="dashboard-kicker">Гороскоп сегодня</p>
                <h2>Сегодня</h2>
              </div>
            </div>
            <p>{dailyText}</p>
            <div className="dashboard-chip-row">
              <span>ежедневно</span>
              {zodiacSign && <span>{zodiacSign}</span>}
            </div>
          </article>
        </section>

        <section className="dashboard-oracle-bottom" aria-label="Итог дня">
          <article className="oracle-bottom-card oracle-bottom-card--energy personal-hero-block">
            <div>
              <p className="dashboard-kicker">Энергия дня</p>
              <h3>{energyLevel}</h3>
            </div>
            <p>{energyHint}</p>
          </article>

          <article className="oracle-bottom-card oracle-bottom-card--event personal-hero-block">
            <div>
              <p className="dashboard-kicker">Ближайшее событие</p>
              <h3>{upcomingEvent}</h3>
            </div>
          </article>

          <article className="oracle-bottom-card oracle-bottom-card--recommendation personal-hero-block">
            <div>
              <p className="dashboard-kicker">Рекомендация дня</p>
              <h3>{dailyRecommendation}</h3>
            </div>
          </article>
        </section>
      </div>
    </section>
  );
};

// Helper function to get element from sign
const getElementFromSign = (sign: string): string => {
  const idx = signToNum(sign);
  if ([0, 4, 8].includes(idx)) return 'fire';
  if ([1, 5, 9].includes(idx)) return 'earth';
  if ([2, 6, 10].includes(idx)) return 'air';
  if ([3, 7, 11].includes(idx)) return 'water';
  return 'unknown';
};

// Helper function to calculate element distribution
const calculateElements = (planets: NatalChart['planets']) => {
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  Object.values(planets).forEach((planet) => {
    const element = getElementFromSign(planet.sign);
    if (element !== 'unknown') {
      elements[element as keyof typeof elements]++;
    }
  });
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  return {
    fire: total > 0 ? Math.round((elements.fire / total) * 100) : 0,
    earth: total > 0 ? Math.round((elements.earth / total) * 100) : 0,
    air: total > 0 ? Math.round((elements.air / total) * 100) : 0,
    water: total > 0 ? Math.round((elements.water / total) * 100) : 0,
  };
};

// Helper function to calculate modality distribution (Cardinal, Fixed, Mutable)
const calculateModalities = (planets: NatalChart['planets']) => {
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 };
  Object.values(planets).forEach((planet) => {
    const idx = signToNum(planet.sign);
    // Cardinal: Aries (0), Cancer (3), Libra (6), Capricorn (9)
    if ([0, 3, 6, 9].includes(idx)) modalities.cardinal++;
    // Fixed: Taurus (1), Leo (4), Scorpio (7), Aquarius (10)
    else if ([1, 4, 7, 10].includes(idx)) modalities.fixed++;
    // Mutable: Gemini (2), Virgo (5), Sagittarius (8), Pisces (11)
    else if ([2, 5, 8, 11].includes(idx)) modalities.mutable++;
  });
  const total = Object.values(modalities).reduce((a, b) => a + b, 0);
  return {
    cardinal: total > 0 ? Math.round((modalities.cardinal / total) * 100) : 0,
    fixed: total > 0 ? Math.round((modalities.fixed / total) * 100) : 0,
    mutable: total > 0 ? Math.round((modalities.mutable / total) * 100) : 0,
  };
};

// Helper function to get ascendant ruler
const getAscendantRuler = (
  ascendantSign: string,
  planets: NatalChart['planets']
): { planet: string; label: string } | null => {
  const signIdx = signToNum(ascendantSign);
  // Rulership: Aries→Mars, Taurus→Venus, Gemini→Mercury, Cancer→Moon, Leo→Sun, Virgo→Mercury
  // Libra→Venus, Scorpio→Mars/Pluto, Sagittarius→Jupiter, Capricorn→Saturn, Aquarius→Uranus/Saturn, Pisces→Neptune/Jupiter
  const rulers: Record<number, string[]> = {
    0: ['mars'], // Aries
    1: ['venus'], // Taurus
    2: ['mercury'], // Gemini
    3: ['moon'], // Cancer
    4: ['sun'], // Leo
    5: ['mercury'], // Virgo
    6: ['venus'], // Libra
    7: ['mars', 'pluto'], // Scorpio
    8: ['jupiter'], // Sagittarius
    9: ['saturn'], // Capricorn
    10: ['uranus', 'saturn'], // Aquarius
    11: ['neptune', 'jupiter'], // Pisces
  };
  const planetNames = rulers[signIdx] || [];
  const ruNames: Record<string, string> = {
    sun: 'Солнце',
    moon: 'Луна',
    mercury: 'Меркурий',
    venus: 'Венера',
    mars: 'Марс',
    jupiter: 'Юпитер',
    saturn: 'Сатурн',
    uranus: 'Уран',
    neptune: 'Нептун',
    pluto: 'Плутон',
  };
  for (const p of planetNames) {
    if (planets[p]) {
      return { planet: p, label: ruNames[p] || p };
    }
  }
  return null;
};

// Helper function to get retrograde planets
const getRetrogradePlanets = (planets: NatalChart['planets']): string[] => {
  const retrograde: string[] = [];
  Object.entries(planets).forEach(([name, planet]) => {
    if (planet.retrograde) {
      retrograde.push(name);
    }
  });
  return retrograde;
};

// Helper function to get dominant planet (most planets in same sign)
const getDominantPlanet = (
  planets: NatalChart['planets']
): { planet: string; signIndex: number } | null => {
  const signCounts: Record<number, { count: number; planets: string[] }> = {};
  Object.entries(planets).forEach(([name, planet]) => {
    const idx = signToNum(planet.sign);
    if (!signCounts[idx]) {
      signCounts[idx] = { count: 0, planets: [] };
    }
    signCounts[idx].count++;
    signCounts[idx].planets.push(name);
  });

  let maxCount = 0;
  let dominant: { planet: string; signIndex: number } | null = null;
  Object.entries(signCounts).forEach(([idxStr, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      dominant = {
        planet: data.planets[0],
        signIndex: Number(idxStr),
      };
    }
  });

  return dominant;
};

// Zodiac sign to index (0–11) for wheel position
const signToNum = (sign: string): number => {
  const raw = (sign || '').trim().toLowerCase();
  if (!raw) return 0;

  const full = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  const idxFull = full.indexOf(raw);
  if (idxFull >= 0) return idxFull;

  const three = raw.slice(0, 3);
  const abbr: Record<string, number> = {
    ari: 0,
    tau: 1,
    gem: 2,
    can: 3,
    leo: 4,
    vir: 5,
    lib: 6,
    sco: 7,
    sag: 8,
    cap: 9,
    aqu: 10,
    pis: 11,
  };
  return abbr[three] ?? 0;
};

// Convert sign + degree to absolute degree (0–360), then to SVG x,y (0° Aries = 9 o'clock)
const degreeInSignToXY = (
  sign: string,
  degree: number,
  cx: number,
  cy: number,
  r: number
): { x: number; y: number } => {
  const absoluteDegree = signToNum(sign) * 30 + (degree ?? 0);
  const angleRad = ((180 - absoluteDegree) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
};

// Planet emoji map
const PLANET_EMOJI: Record<string, string> = {
  sun: '☀️',
  moon: '🌙',
  mercury: '☿️',
  venus: '♀️',
  mars: '♂️',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

// Natal Chart Block Component
const NatalChartBlock: React.FC<{
  natalChart: NatalChart | null;
  user: User;
  loading: boolean;
  density: HeroDensity;
  onViewFull: () => void;
}> = ({ natalChart, user, loading, density, onViewFull }) => {
  if (loading) {
    return (
      <div className="hero-card mira-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-32 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (!natalChart) {
    const missingBirthData = !user.birthTime || !user.birthLocation;
    return (
      <div className="hero-card mira-card mira-card-hover p-5 h-full flex flex-col items-center justify-center text-center">
        <div className="text-4xl mb-3 opacity-50">⭐</div>
        <h3 className="hero-title-main mira-card-title mb-2">
          Натальная карта
        </h3>
        <p className="hero-body text-silver/70 text-sm mb-3 tracking-wide">
          {missingBirthData
            ? 'Заполните время и место рождения, чтобы построить круг.'
            : 'Карта ещё не рассчитана'}
        </p>
        <button
          onClick={onViewFull}
          className="mira-button max-w-[260px] text-sm"
        >
          {missingBirthData
            ? 'Заполнить данные →'
            : 'Рассчитать натальную карту →'}
        </button>
      </div>
    );
  }

  const elements = calculateElements(natalChart.planets);
  const modalities = calculateModalities(natalChart.planets);
  const retrogradePlanets = getRetrogradePlanets(natalChart.planets);
  const dominant = getDominantPlanet(natalChart.planets);
  const PLANET_NAMES_RU: Record<string, string> = {
    sun: 'Солнце',
    moon: 'Луна',
    mercury: 'Меркурий',
    venus: 'Венера',
    mars: 'Марс',
    jupiter: 'Юпитер',
    saturn: 'Сатурн',
    uranus: 'Уран',
    neptune: 'Нептун',
    pluto: 'Плутон',
  };

  return (
    <div
      data-density={density}
      className="hero-card hero-panel-card hero-natal-card hero-natal-layout bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10 backdrop-blur-sm h-full flex flex-col"
    >
      <h3 className="hero-panel-heading">
        <span className="hero-panel-heading-icon">⭐</span>
        <span className="hero-panel-heading-text">Натальная карта</span>
      </h3>

      <div className="hero-panel-body hero-natal-body flex-1 flex flex-col">
        {/* Круг натальной карты */}
        <div className="hero-wheel hero-natal-wheel hero-natal-wheel-frame hero-visual-frame mb-3 mira-subcard flex items-center justify-center relative overflow-hidden max-w-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg border border-white/5">
          <div className="hero-visual-stage hero-visual-center hero-natal-visual-stage hero-natal-wheel-canvas">
            <NatalChartWheel
              chart={natalChart as any}
              variant="mini"
              className="hero-natal-wheel-svg w-full h-full max-w-full max-h-full opacity-95"
            />
          </div>

          {/* Элементы - компактно в углах */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 backdrop-blur-md bg-black/60 rounded-lg p-1.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-red-400">🔥</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${elements.fire}%` }}
                />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">
                {elements.fire}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-yellow-500">🌍</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${elements.earth}%` }}
                />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">
                {elements.earth}%
              </span>
            </div>
          </div>
          <div className="absolute bottom-2 right-2 flex flex-col gap-1 backdrop-blur-md bg-black/60 rounded-lg p-1.5 border border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-blue-400">💨</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${elements.air}%` }}
                />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">
                {elements.air}%
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-cyan-400">💧</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden w-10 sm:w-12">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${elements.water}%` }}
                />
              </div>
              <span className="text-white/90 font-medium text-[9px] sm:text-[10px] min-w-[28px]">
                {elements.water}%
              </span>
            </div>
          </div>
        </div>

        {/* Новые блоки: модальности / доминанта / ретроградные */}
        <div className="hero-insights-row hero-natal-insights mb-2">
          <div className="hero-insight-card hero-natal-insight hero-natal-retro bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] text-white mb-2 uppercase tracking-wider font-bold">
              Ретроградные
            </div>
            <div className="hero-natal-retro-text text-xs text-white flex-1 flex items-center">
              {retrogradePlanets.length > 0
                ? retrogradePlanets
                  .map((p) => PLANET_NAMES_RU[p] || p)
                  .join(', ')
                : 'Нет ретроградных планет'}
            </div>
          </div>

          <div className="hero-insight-card hero-natal-insight hero-natal-dominant bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] text-white mb-2 uppercase tracking-wider font-bold">
              Доминанта
            </div>
            <div className="text-xs text-white font-medium flex-1 flex items-center leading-tight">
              {dominant
                ? (() => {
                  const planetName =
                    PLANET_NAMES_RU[dominant.planet.toLowerCase()] ||
                    dominant.planet;
                  const signName =
                    ZODIAC_SIGNS[ZODIAC_KEYS[dominant.signIndex] || 'aries']
                      ?.name || '—';
                  return `${planetName} в ${signName}`;
                })()
                : '—'}
            </div>
          </div>

          <div className="hero-insight-card hero-natal-insight bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] text-white mb-2 uppercase tracking-wider font-bold">
              Модальности
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1 items-center">
              <div className="text-center">
                <div className="text-[9px] text-white mb-0.5">Кард.</div>
                <div className="text-xs font-semibold text-white">
                  {modalities.cardinal}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-white mb-0.5">Фикс.</div>
                <div className="text-xs font-semibold text-white">
                  {modalities.fixed}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[9px] text-white mb-0.5">Мутаб.</div>
                <div className="text-xs font-semibold text-white">
                  {modalities.mutable}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onViewFull}
        className="hero-panel-footer mira-button text-xs sm:text-sm mt-auto"
      >
        Полный анализ →
      </button>
    </div>
  );
};

// Locked Natal Chart Block
const LockedNatalChartBlock: React.FC<{
  hasData: boolean;
  tier: string;
  onFillData: () => void;
  onUpgrade: () => void;
}> = ({ hasData, tier, onFillData, onUpgrade }) => {
  if (!hasData) {
    return (
      <div className="mira-card mira-card-hover p-6 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
        <div className="relative z-10 flex flex-col">
          <h3 className="mira-card-title mb-4 opacity-80">
            🔒 Натальная карта
          </h3>
          <div className="mb-4 h-36 mira-subcard flex items-center justify-center blur-sm">
            <div className="text-6xl opacity-50">⭐</div>
          </div>
          <p className="text-silver/70 text-base mb-4 tracking-wide">
            Узнайте свою натальную карту
          </p>
          <ul className="text-silver/50 text-base space-y-2 mb-5 tracking-wide">
            <li>• Солнце, Луна, Асцендент</li>
            <li>• 12 домов и планеты</li>
            <li>• Аспекты и влияния</li>
            <li>• AI анализ личности</li>
          </ul>
          <button
            onClick={onFillData}
            className="mira-button text-base mt-auto"
          >
            Заполнить данные 🎯
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mira-card mira-card-hover p-6 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      <div className="relative z-10 flex flex-col">
        <h3 className="mira-card-title mb-4 opacity-80">🔒 Натальная карта</h3>
        <div className="mb-4 h-36 mira-subcard flex items-center justify-center blur-sm">
          <div className="text-6xl opacity-50">⭐</div>
        </div>
        <p className="text-silver/70 text-base mb-4 tracking-wide">
          Доступно в Premium/Platinum
        </p>
        <button onClick={onUpgrade} className="mira-button text-base mt-auto">
          Обновить до Premium 💎
        </button>
      </div>
    </div>
  );
};

// Zodiac Sign Block
const ZodiacSignBlock: React.FC<{
  zodiacInfo: (typeof ZODIAC_SIGNS)[string] | null;
  userName: string;
  birthDate?: string;
  onFillData: () => void;
}> = ({ zodiacInfo, userName, birthDate, onFillData }) => {
  if (!zodiacInfo) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
        <div className="mb-4">
          <img
            src="/oven.png"
            alt="Zodiac Sign"
            className="w-48 h-48 mx-auto opacity-50"
          />
        </div>
        <h3 className="text-2xl font-cinzel font-bold text-white mb-2">
          {userName}
        </h3>
        <p className="text-silver/70 text-sm mb-4">
          Заполните данные для отображения знака
        </p>
        <button
          onClick={onFillData}
          className="px-6 py-2 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black rounded-lg transition text-sm font-semibold"
        >
          Добавить данные
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
      <div className="mb-4">
        <img
          src={zodiacInfo.image}
          alt={zodiacInfo.name}
          className="w-48 h-48 mx-auto"
          onError={(e) => {
            // Fallback to oven.png if zodiac image not found
            (e.target as HTMLImageElement).src = '/oven.png';
          }}
        />
      </div>
      <h3 className="text-3xl font-cinzel font-bold text-white mb-2">
        {zodiacInfo.emoji} {zodiacInfo.name}
      </h3>
      <p className="text-silver/70 text-sm mb-2">{zodiacInfo.dates}</p>
      <div className="space-y-1 text-sm">
        <p className="text-silver/80">
          <span className="text-mirastros-gold">Элемент:</span>{' '}
          {zodiacInfo.element}
        </p>
        <p className="text-silver/80">
          <span className="text-mirastros-gold">Планета:</span>{' '}
          {zodiacInfo.planet}
        </p>
      </div>
      {birthDate && <p className="text-silver/50 text-xs mt-4">{birthDate}</p>}
    </div>
  );
};

// Helper function to generate life area ratings (for Premium/Platinum)
const generateLifeAreaRatings = async (
  horoscopeText: string,
  zodiacSign: string,
  tier: string
): Promise<{
  finance: number;
  love: number;
  career: number;
  health: number;
} | null> => {
  if (tier === 'freemium') return null;

  try {
    // For Premium/Platinum, use backend API to get enhanced horoscope data
    // Backend already includes ratings in horoscope response for premium users
    // This is a more intelligent approach - extract from existing horoscope data
    // rather than making additional AI calls

    // Smart fallback based on horoscope content analysis
    const text = horoscopeText.toLowerCase();

    // Enhanced keyword analysis with scoring
    const financeKeywords = [
      'деньги',
      'финанс',
      'доход',
      'прибыль',
      'богатство',
      'капитал',
    ];
    const loveKeywords = [
      'любов',
      'отношен',
      'партнер',
      'романтик',
      'сердце',
      'чувств',
    ];
    const careerKeywords = [
      'работ',
      'карьер',
      'успех',
      'достижен',
      'проект',
      'цел',
    ];
    const healthKeywords = [
      'здоров',
      'энерг',
      'сил',
      'витальност',
      'самочувств',
    ];

    const calculateRating = (keywords: string[]): number => {
      let count = 0;
      keywords.forEach((keyword) => {
        if (text.includes(keyword)) count++;
      });
      // Base rating 3, increase by matches (max 5)
      return Math.min(5, 3 + Math.floor(count / 2));
    };

    return {
      finance: calculateRating(financeKeywords),
      love: calculateRating(loveKeywords),
      career: calculateRating(careerKeywords),
      health: calculateRating(healthKeywords),
    };
  } catch (error) {
    console.error('Failed to generate ratings:', error);
  }

  // Final fallback: default ratings
  return {
    finance: 3,
    love: 3,
    career: 3,
    health: 3,
  };
};

// Helper function to render stars
const renderStars = (rating: number) => {
  return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
};

// Horoscope Block
const HoroscopeBlock: React.FC<{
  horoscope: Horoscope | null;
  tier: string;
  loading: boolean;
  onViewFull: () => void;
  onUpgrade: () => void;
}> = ({ horoscope, tier, loading, onViewFull, onUpgrade }) => {
  const [ratings, setRatings] = React.useState<{
    finance: number;
    love: number;
    career: number;
    health: number;
  } | null>(null);
  const [ratingsLoading, setRatingsLoading] = React.useState(false);

  React.useEffect(() => {
    if (horoscope && tier !== 'freemium' && !ratings) {
      setRatingsLoading(true);
      generateLifeAreaRatings(horoscope.prediction, horoscope.sign, tier)
        .then((r) => {
          setRatings(r);
          setRatingsLoading(false);
        })
        .catch(() => setRatingsLoading(false));
    }
  }, [horoscope, tier, ratings]);

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-24 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (tier === 'freemium') {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-cinzel font-bold text-white mb-4">
          🌟 Гороскоп на сегодня
        </h3>
        {horoscope ? (
          <>
            <p className="text-silver/70 text-sm mb-4 line-clamp-3">
              {horoscope.prediction}
            </p>
            <div className="bg-black/30 rounded-lg p-4 mb-4 blur-sm relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-silver/50 text-xs">🔒 PREMIUM контент</p>
              </div>
              <p className="text-transparent text-xs">💰 Финансы: ⭐⭐⭐⭐</p>
              <p className="text-transparent text-xs">❤️ Любовь: ⭐⭐⭐⭐⭐</p>
              <p className="text-transparent text-xs">💼 Карьера: ⭐⭐⭐</p>
            </div>
            <button
              onClick={onUpgrade}
              className="w-full py-2 px-4 bg-mirastros-gold hover:bg-mirastros-gold/90 text-black rounded-lg transition text-sm font-semibold"
            >
              Обновить Premium 💎
            </button>
          </>
        ) : (
          <p className="text-silver/70 text-sm">Загрузка гороскопа...</p>
        )}
      </div>
    );
  }

  if (!horoscope) {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h3 className="text-xl font-cinzel font-bold text-white mb-4">
          🌟 Гороскоп на сегодня
        </h3>
        <p className="text-silver/70 text-sm">Загрузка гороскопа...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition">
      <h3 className="text-xl font-cinzel font-bold text-white mb-4">
        {tier === 'platinum'
          ? '🌟 Персональный гороскоп'
          : '🌟 Гороскоп на сегодня'}
      </h3>
      <p className="text-silver/80 text-sm mb-4 line-clamp-4">
        {horoscope.prediction}
      </p>

      {/* Ratings/lucky data intentionally removed here to avoid duplication with top ratings block */}

      <button
        onClick={onViewFull}
        className="w-full py-2 px-4 bg-mirastros-gold/20 hover:bg-mirastros-gold/30 border border-mirastros-gold/50 text-mirastros-gold rounded-lg transition text-sm font-semibold"
      >
        Читать детально →
      </button>
    </div>
  );
};

// Locked Horoscope Block
const LockedHoroscopeBlock: React.FC<{
  onFillData: () => void;
}> = ({ onFillData }) => {
  return (
    <div className="mira-card mira-card-hover p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40" />
      <div className="relative z-10 flex flex-col h-full justify-center">
        <h3 className="mira-card-title mb-4 opacity-80">🔒 Гороскоп</h3>
        <p className="text-silver/70 text-base mb-4 tracking-wide">
          Выберите знак зодиака для гороскопа
        </p>
        <button onClick={onFillData} className="mira-button text-base">
          Заполнить данные для расчета
        </button>
      </div>
    </div>
  );
};
