'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { api } from '../services/api';
import { LifeAreaRatings } from './LifeAreaRatings';
import type { User, Horoscope } from '../types';
import { ZODIAC_EMOJIS } from '../constants/zodiac';
import { MOON_PHASES, MOON_PHASE_NAMES_EXTENDED } from '../constants/moon';

interface UserInfoBlockProps {
  user: User;
  horoscope: Horoscope | null;
  destinyMatrix?: any;
  ratingsLoading?: boolean;
  matrixLoading?: boolean;
  onFillData?: () => void;
  onViewMatrixDetails?: () => void;
  hideMatrix?: boolean;
}

export const UserInfoBlock: React.FC<UserInfoBlockProps> = ({
  user,
  horoscope,
  ratingsLoading = false,
  onFillData,
}) => {
  const isPremium = user.subscriptionTier === 'premium' || user.subscriptionTier === 'platinum';
  const zodiacEmojiRef = useRef<HTMLDivElement>(null);
  const [lunarData, setLunarData] = useState<any>(null);
  const [numerologyData, setNumerologyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load lunar and numerology data
  useEffect(() => {
    const loadEsotericData = async () => {
      setLoading(true);
      try {
        // Load lunar phase
        const lunar = await api.getLunarPhase();
        setLunarData(lunar);

        // Load numerology if user has birth date
        if (user.birthDate && user.fullName) {
          try {
            let numerology = await api.getMyNumerology();
            if (!numerology && isPremium) {
              numerology = await api.calculateNumerology({
                fullName: user.fullName,
                birthDate: user.birthDate,
              });
            }
            setNumerologyData(numerology);
          } catch (err) {
            console.error('Failed to load numerology:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load esoteric data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEsotericData();
  }, [user, isPremium]);

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
        zodiacEmojiRef.current?.removeEventListener('mousemove', handleMouseMove);
        zodiacEmojiRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [user.zodiacSign]);

  const zodiacEmoji = user.zodiacSign
    ? ZODIAC_EMOJIS[user.zodiacSign] || '⭐'
    : '⭐';

  const moonEmoji = lunarData?.phase ? MOON_PHASES[lunarData.phase] || '🌙' : '🌙';
  const moonPhaseName = lunarData?.phase_name || (lunarData?.phase ? MOON_PHASE_NAMES_EXTENDED[lunarData.phase] : null);

  // Loading skeleton
  if (loading) {
    return (
      <div className="mira-card p-4 sm:p-5 h-full animate-pulse">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
          </div>
          <div className="h-20 bg-white/10 rounded" />
          <div className="h-16 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="mira-card mira-card-hover p-4 sm:p-5 h-full flex flex-col gap-4 min-w-0 overflow-hidden">
      {/* User Info Section */}
      <div className="flex items-start gap-3 min-w-0">
        <div
          ref={zodiacEmojiRef}
          className="text-4xl sm:text-5xl cursor-pointer flex-shrink-0 select-none"
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
          title={user.zodiacSign || 'Знак зодиака'}
        >
          {zodiacEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-cinzel font-bold text-white leading-tight mb-1 truncate">
            {user.fullName || 'Пользователь'}
          </h2>
          {user.zodiacSign && (
            <p className="text-mirastros-gold text-sm font-semibold tracking-wide">
              {user.zodiacSign}
            </p>
          )}
          {user.birthDate && (
            <p className="text-silver/60 text-xs tracking-wide mt-0.5">
              {user.birthDate}
            </p>
          )}
        </div>
      </div>

      {/* Lunar Phase Section */}
      {lunarData && (
        <div className="mira-subcard p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{moonEmoji}</span>
            <div className="min-w-0 flex-1">
              <p className="mira-card-kicker text-xs">Лунная фаза</p>
              <p className="text-white font-semibold text-sm tracking-wide">
                {moonPhaseName || 'Загрузка...'}
              </p>
            </div>
          </div>

          {/* Illumination */}
          {lunarData.illumination !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${lunarData.illumination}%` }}
                />
              </div>
              <span className="text-silver/80 text-xs font-medium flex-shrink-0">
                {Math.round(lunarData.illumination)}%
              </span>
            </div>
          )}

          {/* Moon sign */}
          {lunarData.zodiac_sign && (
            <p className="text-silver/70 text-xs tracking-wide">
              Луна в {lunarData.zodiac_sign}
              {lunarData.moon_degree !== undefined && ` (${lunarData.moon_degree.toFixed(1)}°)`}
            </p>
          )}

          {/* Description */}
          {lunarData.description && (
            <p className="text-silver/60 text-xs leading-relaxed line-clamp-2">
              {lunarData.description}
            </p>
          )}
        </div>
      )}

      {/* Life Area Ratings (Premium) */}
      {isPremium && horoscope?.ratings && (
        <div className="mira-subcard p-3">
          <p className="mira-card-kicker text-xs mb-2">📊 Сферы жизни</p>
          <LifeAreaRatings ratings={horoscope.ratings} loading={ratingsLoading} />
        </div>
      )}

      {/* Numerology Section */}
      {numerologyData && (
        <div className="mira-subcard p-3">
          <p className="mira-card-kicker text-xs mb-2">🔢 Нумерология</p>
          <div className="grid grid-cols-2 gap-2">
            {numerologyData.life_path && (
              <div className="text-center bg-black/20 rounded-lg p-2">
                <p className="text-silver/60 text-xs">Путь</p>
                <p className="text-mirastros-gold text-xl font-bold">{numerologyData.life_path}</p>
              </div>
            )}
            {numerologyData.destiny && (
              <div className="text-center bg-black/20 rounded-lg p-2">
                <p className="text-silver/60 text-xs">Судьба</p>
                <p className="text-mirastros-gold text-xl font-bold">{numerologyData.destiny}</p>
              </div>
            )}
            {numerologyData.soul_urge && (
              <div className="text-center bg-black/20 rounded-lg p-2">
                <p className="text-silver/60 text-xs">Душа</p>
                <p className="text-mirastros-gold text-xl font-bold">{numerologyData.soul_urge}</p>
              </div>
            )}
            {numerologyData.personality && (
              <div className="text-center bg-black/20 rounded-lg p-2">
                <p className="text-silver/60 text-xs">Личность</p>
                <p className="text-mirastros-gold text-xl font-bold">{numerologyData.personality}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA if no data */}
      {!user.birthDate && onFillData && (
        <button
          onClick={onFillData}
          className="mira-button text-sm mt-auto"
        >
          Заполнить данные 🎯
        </button>
      )}
    </div>
  );
};
