'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { DestinyMatrix } from '../../types';
import type { HeroDensity } from '../hero/heroDensity';

export type DestinyMatrixMode = 'hero' | 'full';

interface DestinyMatrixViewProps {
  matrix: DestinyMatrix;
  density?: HeroDensity;
  mode?: DestinyMatrixMode;
  fullWidth?: boolean;
  onViewDetails?: () => void;
}

const ARCANUM_NAMES: Record<number, string> = {
  1: 'Маг',
  2: 'Жрица',
  3: 'Императрица',
  4: 'Император',
  5: 'Жрец',
  6: 'Влюбленные',
  7: 'Колесница',
  8: 'Сила',
  9: 'Отшельник',
  10: 'Колесо Фортуны',
  11: 'Справедливость',
  12: 'Повешенный',
  13: 'Смерть',
  14: 'Умеренность',
  15: 'Дьявол',
  16: 'Башня',
  17: 'Звезда',
  18: 'Луна',
  19: 'Солнце',
  20: 'Суд',
  21: 'Мир',
  22: 'Шут',
};

const ARCANUM_DESCRIPTIONS: Record<number, string> = {
  1: 'Воля, действие, инициатива',
  2: 'Интуиция, тайна, внутренняя мудрость',
  3: 'Изобилие, творчество, природа',
  4: 'Структура, порядок, авторитет',
  5: 'Традиция, духовность, поиск истины',
  6: 'Выбор, гармония, отношения',
  7: 'Контроль, победа, движение',
  8: 'Сила воли, терпение, внутренняя сила',
  9: 'Размышление, поиск, уединение',
  10: 'Судьба, циклы, перемены',
  11: 'Баланс, справедливость, карма',
  12: 'Жертва, новый взгляд, переоценка',
  13: 'Трансформация, окончание, новое начало',
  14: 'Гармония, баланс, умеренность',
  15: 'Искушение, зависимость, материальность',
  16: 'Разрушение, освобождение, прорыв',
  17: 'Надежда, вдохновение, духовность',
  18: 'Иллюзии, страхи, подсознание',
  19: 'Радость, успех, просветление',
  20: 'Возрождение, прощение, новый шанс',
  21: 'Завершение, достижение, целостность',
  22: 'Начало, невинность, потенциал',
};

const BASIC_LINE_LABELS: Record<string, string> = {
  destiny: 'Судьба',
  character: 'Характер',
  purpose: 'Предназначение',
  health: 'Здоровье',
};

const EXTENDED_LINE_LABELS: Record<string, string> = {
  line_of_heaven: 'Линия Неба',
  line_of_earth: 'Линия Земли',
  line_of_man: 'Линия Мужчины',
  line_of_woman: 'Линия Женщины',
};

const POSITION_LABELS: Record<string, string> = {
  core: 'Ядро',
  soul: 'Душа',
  realization: 'Реализация',
  talent: 'Талант',
  karmic: 'Карма',
  shadow: 'Тень',
};

export const DestinyMatrixView: React.FC<DestinyMatrixViewProps> = ({
  matrix,
  density = 'comfort',
  mode = 'hero',
  fullWidth = false,
  onViewDetails,
}) => {
  const isUltra = density === 'ultra';
  const isFull = mode === 'full';
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const blockRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!matrix.active_arcana || !blockRef.current) return;

    if (animationRef.current) {
      animationRef.current.kill();
    }

    const tl = gsap.timeline();
    const cells = blockRef.current.querySelectorAll('[data-arcanum]');

    tl.fromTo(
      cells,
      {
        scale: 0,
        opacity: 0,
        rotation: -180,
        transformOrigin: 'center center',
      },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
        stagger: {
          amount: 0.6,
          from: 'random',
        },
      }
    );

    matrix.active_arcana.forEach((arcanum, index) => {
      const target = blockRef.current?.querySelector(
        `[data-arcanum="${arcanum}"]`
      );
      if (!target) return;
      tl.to(
        target,
        {
          scale: 1.08,
          duration: 0.24,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        },
        `+=${index * 0.1}`
      );
    });

    animationRef.current = tl;

    return () => {
      animationRef.current?.kill();
      animationRef.current = null;
    };
  }, [matrix]);

  const isActive = (number: number) => matrix.active_arcana.includes(number);
  const basicLines = matrix.lines_basic || matrix.lines;
  const extendedLines = matrix.lines_extended;
  const positions: Record<string, number> = matrix.positions || {};
  const formatPosition = (value?: number) =>
    value ? `${value} - ${ARCANUM_NAMES[value] || value}` : '—';

  return (
    <div
      ref={blockRef}
      className={`${
        isFull
          ? 'mira-card mira-card-hover p-6'
          : 'hero-card hero-panel-card hero-matrix-card mira-card mira-card-hover p-5 h-full flex flex-col'
      } ${fullWidth ? 'w-full' : ''}`}
    >
      <h3 className="hero-panel-heading">
        <span className="hero-panel-heading-icon">🌀</span>
        <span className="hero-panel-heading-text">Матрица судьбы</span>
        <span className="hero-panel-heading-badge">
          {matrix.calculation_version || 'v1'}
        </span>
      </h3>

      <div
        className={`hero-panel-body flex flex-col ${
          isFull ? 'gap-4' : 'flex-1'
        }`}
      >
        <div
          className={`hero-matrix-wheel mb-3 mira-subcard bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10 border border-white/5 rounded-lg ${
            isFull ? 'p-3' : 'hero-visual-frame'
          }`}
        >
          <div
            className={
              isFull
                ? 'flex justify-center w-full overflow-x-auto'
                : 'w-full h-full'
            }
          >
            <div
              className={`grid grid-cols-4 gap-2 sm:gap-2.5 ${
                isFull ? 'flex-shrink-0' : 'hero-visual-stage hero-matrix-grid'
              }`}
            >
              {matrix.matrix_data.map((row, rowIndex) =>
                row.map((number, colIndex) => {
                  const active = isActive(number);
                  const sizeClass = isFull
                    ? 'min-w-[58px] min-h-[58px] md:min-w-[70px] md:min-h-[70px]'
                    : 'hero-matrix-cell-fluid';

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      data-arcanum={number}
                      className={`
                        hero-matrix-cell ${sizeClass}
                        relative aspect-square rounded-lg border transition-all duration-200 ease-out
                        flex items-center justify-center cursor-pointer group
                        ${
                          active
                            ? 'bg-gradient-to-br from-mirastros-gold/30 via-mirastros-gold/20 to-mirastros-gold/25 border-mirastros-gold/50 shadow-md shadow-mirastros-gold/20 hover:from-mirastros-gold/40 hover:via-mirastros-gold/30 hover:to-mirastros-gold/35 hover:border-mirastros-gold/70'
                            : 'bg-white/3 border-white/10 hover:bg-white/8 hover:border-white/20'
                        }
                      `}
                      onClick={() => {
                        if (onViewDetails && active) onViewDetails();
                      }}
                      onMouseEnter={() =>
                        setHoveredCell(`${rowIndex}-${colIndex}`)
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <span
                        className={`font-semibold leading-none tracking-wide ${
                          isFull
                            ? 'text-base md:text-lg'
                            : 'text-sm lg:text-base'
                        } ${active ? 'text-mirastros-gold' : 'text-silver/70'}`}
                      >
                        {number}
                      </span>

                      {!isUltra &&
                        hoveredCell === `${rowIndex}-${colIndex}` &&
                        ARCANUM_DESCRIPTIONS[number] && (
                          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 border border-mirastros-gold/30 rounded-lg shadow-xl pointer-events-none min-w-[180px] max-w-[220px]">
                            <p className="text-mirastros-gold text-xs font-semibold mb-1">
                              {number}. {ARCANUM_NAMES[number]}
                            </p>
                            <p className="text-silver/80 text-xs leading-relaxed">
                              {ARCANUM_DESCRIPTIONS[number]}
                            </p>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {!isFull && (
          <div className="hero-insights-row hero-matrix-insights mb-2">
            <div className="hero-insight-card hero-matrix-insight bg-mirastros-gold/10 p-3 rounded border border-mirastros-gold/20">
              <div className="text-[10px] text-mirastros-gold/80 mb-1 uppercase tracking-wider">
                Ядро
              </div>
              <div className="text-xs text-white font-medium leading-tight">
                {formatPosition(positions.core)}
              </div>
            </div>

            <div className="hero-insight-card hero-matrix-insight bg-purple-900/20 p-3 rounded border border-purple-500/20">
              <div className="text-[10px] text-purple-300/80 mb-1 uppercase tracking-wider">
                Душа
              </div>
              <div className="text-xs text-white/90 leading-tight">
                {formatPosition(positions.soul)}
              </div>
            </div>

            <div className="hero-insight-card hero-matrix-insight bg-white/3 p-3 rounded border border-white/5">
              <div className="text-[10px] text-silver/60 mb-1 uppercase tracking-wider">
                Талант
              </div>
              <div className="text-xs text-white font-medium leading-tight">
                {formatPosition(positions.talent)}
              </div>
            </div>
          </div>
        )}

        {isFull && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                <h4 className="text-sm font-semibold text-mirastros-gold mb-2">
                  Базовые линии
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(basicLines).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-silver/70">
                        {BASIC_LINE_LABELS[key] || key}
                      </span>
                      <span className="text-white font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                <h4 className="text-sm font-semibold text-mirastros-gold mb-2">
                  Расширенные оси
                </h4>
                <div className="space-y-1.5">
                  {Object.entries(extendedLines || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between gap-2 text-sm"
                    >
                      <span className="text-silver/70">
                        {EXTENDED_LINE_LABELS[key] || key}
                      </span>
                      <span className="text-white font-semibold">
                        {Array.isArray(value) ? value.join(' - ') : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {Object.keys(positions).length > 0 && (
              <div className="bg-black/20 border border-white/10 rounded-xl p-3">
                <h4 className="text-sm font-semibold text-mirastros-gold mb-2">
                  Ключевые позиции
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(positions).map(([key, value]) => (
                    <span
                      key={key}
                      className="mira-chip-gold text-xs sm:text-sm px-2.5 py-1"
                    >
                      {(POSITION_LABELS[key] || key) + ': ' + value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-black/20 border border-white/10 rounded-xl p-3">
              <h4 className="text-sm font-semibold text-mirastros-gold mb-2">
                Интерпретация
              </h4>
              <p className="text-silver/80 text-sm whitespace-pre-line leading-relaxed">
                {matrix.interpretation}
              </p>
            </div>
          </>
        )}
      </div>

      {matrix.active_arcana.length > 0 && onViewDetails && (
        <button
          onClick={onViewDetails}
          className={`${
            isFull
              ? 'mira-button mt-4 w-full md:w-auto md:min-w-[260px] self-start'
              : 'hero-panel-footer mira-button text-xs sm:text-sm mt-auto w-full'
          }`}
        >
          Подробнее →
        </button>
      )}
    </div>
  );
};
