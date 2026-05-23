'use client';

import React, { useMemo } from 'react';
import type { NatalChart } from '../../types';

type WheelVariant = 'mini' | 'full';

const SIGN_GLYPHS = [
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
] as const;

const PLANET_GLYPHS: Record<string, string> = {
  sun: '☉',
  moon: '☾',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  north_node: '☊',
  south_node: '☋',
} as const;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const normalizeSignIndex = (sign: unknown, signNum: unknown): number => {
  if (
    typeof signNum === 'number' &&
    Number.isFinite(signNum) &&
    signNum >= 0 &&
    signNum <= 11
  )
    return signNum;

  const raw = (typeof sign === 'string' ? sign : '').trim();
  if (!raw) return 0;

  const s = raw.toLowerCase();

  const byAbbrev: Record<string, number> = {
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

  const byFull: Record<string, number> = {
    aries: 0,
    taurus: 1,
    gemini: 2,
    cancer: 3,
    leo: 4,
    virgo: 5,
    libra: 6,
    scorpio: 7,
    sagittarius: 8,
    capricorn: 9,
    aquarius: 10,
    pisces: 11,
  };

  const three = s.slice(0, 3);
  if (three in byAbbrev) return byAbbrev[three]!;
  if (s in byFull) return byFull[s]!;
  return 0;
};

const toAbsoluteLongitude = (pos: {
  sign?: unknown;
  degree?: unknown;
  sign_num?: unknown;
}): number => {
  const degree =
    typeof pos.degree === 'number' && Number.isFinite(pos.degree)
      ? pos.degree
      : 0;
  const signIndex = normalizeSignIndex(pos.sign, pos.sign_num);
  const withinSign = ((degree % 30) + 30) % 30;
  return signIndex * 30 + withinSign;
};

const angularDistance = (a: number, b: number) => {
  const d = Math.abs((((a - b) % 360) + 360) % 360);
  return d > 180 ? 360 - d : d;
};

type DerivedAspect = {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
};

const deriveAspectsIfMissing = (
  planets: Record<string, any>,
  existing: any[] | undefined
): DerivedAspect[] => {
  const normalizedExisting =
    Array.isArray(existing) && existing.length
      ? (existing
          .map((a) => {
            const type = String(a?.type || '').toLowerCase();
            const p1 = String(a?.planet1 || '').toLowerCase();
            const p2 = String(a?.planet2 || '').toLowerCase();
            if (!p1 || !p2) return null;
            if (
              ![
                'conjunction',
                'opposition',
                'trine',
                'square',
                'sextile',
              ].includes(type)
            )
              return null;
            return {
              planet1: p1,
              planet2: p2,
              type: type as any,
              orb: Number(a?.orb ?? 0) || 0,
            };
          })
          .filter(Boolean) as DerivedAspect[])
      : [];

  if (normalizedExisting.length) return normalizedExisting;

  const planetKeys = Object.keys(planets).filter(
    (k) => planets[k]?.sign != null
  );
  const longs: Record<string, number> = {};
  for (const key of planetKeys) longs[key] = toAbsoluteLongitude(planets[key]);

  const defs: Array<{
    type: DerivedAspect['type'];
    angle: number;
    orb: number;
  }> = [
    { type: 'conjunction', angle: 0, orb: 8 },
    { type: 'sextile', angle: 60, orb: 4 },
    { type: 'square', angle: 90, orb: 6 },
    { type: 'trine', angle: 120, orb: 6 },
    { type: 'opposition', angle: 180, orb: 8 },
  ];

  const results: DerivedAspect[] = [];
  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const p1 = planetKeys[i]!;
      const p2 = planetKeys[j]!;
      const d = angularDistance(longs[p1]!, longs[p2]!);
      for (const def of defs) {
        const orb = Math.abs(d - def.angle);
        if (orb <= def.orb) {
          results.push({
            planet1: p1,
            planet2: p2,
            type: def.type,
            orb: Number(orb.toFixed(1)),
          });
          break;
        }
      }
    }
  }

  // Keep the strongest (lowest orb) aspects first to avoid visual clutter.
  results.sort((a, b) => a.orb - b.orb);
  return results.slice(0, 24);
};

const aspectStroke = (type: DerivedAspect['type']) => {
  switch (type) {
    case 'trine':
      return 'rgba(34,197,94,0.55)';
    case 'sextile':
      return 'rgba(96,165,250,0.55)';
    case 'square':
      return 'rgba(239,68,68,0.55)';
    case 'opposition':
      return 'rgba(239,68,68,0.55)';
    case 'conjunction':
    default:
      return 'rgba(234,179,8,0.55)';
  }
};

const toXY = (
  cx: number,
  cy: number,
  r: number,
  absLongitude: number,
  ascLongitude: number
) => {
  const rotated = (((absLongitude - ascLongitude) % 360) + 360) % 360;
  const angleRad = ((180 - rotated) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
};

export const NatalChartWheel: React.FC<{
  chart: NatalChart;
  variant?: WheelVariant;
  className?: string;
}> = ({ chart, variant = 'mini', className }) => {
  const cfg = useMemo(() => {
    if (variant === 'full') {
      return {
        size: 560,
        cx: 280,
        cy: 280,
        rOuter: 245,
        rZodiac: 215,
        rHousesOuter: 195,
        rHousesInner: 165,
        rPlanets: 155,
        rAspects: 145,
        rCore: 60,
        fontSign: 20,
        fontPlanet: 18,
        tickEveryDeg: 5,
        tickLenMajor: 8,
        tickLenMinor: 4,
      } as const;
    }
    return {
      size: 180,
      cx: 90,
      cy: 90,
      rOuter: 78,
      rZodiac: 68,
      rHousesOuter: 60,
      rHousesInner: 48,
      rPlanets: 44,
      rAspects: 40,
      rCore: 16,
      fontSign: 10,
      fontPlanet: 10,
      tickEveryDeg: 10,
      tickLenMajor: 4,
      tickLenMinor: 2,
    } as const;
  }, [variant]);

  const derived = useMemo(() => {
    const houses = Array.isArray(chart.houses) ? chart.houses : [];
    const housesByNumber = [...houses].sort(
      (a, b) => (a.number ?? 0) - (b.number ?? 0)
    );
    const cusp1 =
      housesByNumber.find((h) => (h.number ?? 0) === 1) || housesByNumber[0];
    const ascLongitude = cusp1 ? toAbsoluteLongitude(cusp1 as any) : 0;

    const planetEntries = Object.entries(chart.planets || {})
      .filter(([, p]) => p && (p as any).sign != null)
      .map(([key, p]) => ({ key: key.toLowerCase(), p: p as any }));

    const planetLongs = new Map<string, number>();
    for (const { key, p } of planetEntries)
      planetLongs.set(key, toAbsoluteLongitude(p));

    const aspects = deriveAspectsIfMissing(
      chart.planets as any,
      chart.aspects as any
    );

    const houseCusps = housesByNumber
      .filter((h) => (h.number ?? 0) >= 1 && (h.number ?? 0) <= 12)
      .map((h) => ({ number: h.number, abs: toAbsoluteLongitude(h as any) }));

    return { ascLongitude, planetEntries, planetLongs, aspects, houseCusps };
  }, [chart.aspects, chart.houses, chart.planets]);

  const tickCount = Math.floor(360 / cfg.tickEveryDeg);

  const placedPlanets = useMemo(() => {
    const list = derived.planetEntries
      .map(({ key, p }) => ({
        key,
        p,
        abs: derived.planetLongs.get(key) ?? 0,
        rotated:
          ((((derived.planetLongs.get(key) ?? 0) - derived.ascLongitude) %
            360) +
            360) %
          360,
      }))
      .sort((a, b) => a.rotated - b.rotated);

    const minSep = variant === 'full' ? 4 : 6;
    const out: Array<{ key: string; p: any; abs: number; radius: number }> = [];

    let group: typeof list = [];
    const flush = () => {
      if (!group.length) return;
      const base = cfg.rPlanets;
      for (let i = 0; i < group.length; i++) {
        const radius = base - i * (variant === 'full' ? 10 : 8);
        out.push({
          key: group[i]!.key,
          p: group[i]!.p,
          abs: group[i]!.abs,
          radius,
        });
      }
      group = [];
    };

    for (const item of list) {
      if (!group.length) {
        group.push(item);
        continue;
      }
      const prev = group[group.length - 1]!;
      const dist = Math.abs(item.rotated - prev.rotated);
      if (dist <= minSep) {
        group.push(item);
      } else {
        flush();
        group.push(item);
      }
    }
    flush();

    return out;
  }, [
    cfg.rPlanets,
    derived.ascLongitude,
    derived.planetEntries,
    derived.planetLongs,
    variant,
  ]);

  return (
    <svg
      width={cfg.size}
      height={cfg.size}
      viewBox={`0 0 ${cfg.size} ${cfg.size}`}
      className={className}
      role="img"
      aria-label="Natal chart wheel"
    >
      {/* Outer rings */}
      <circle
        cx={cfg.cx}
        cy={cfg.cy}
        r={cfg.rOuter}
        fill="none"
        stroke="rgba(190,143,68,0.30)"
        strokeWidth={variant === 'full' ? 2 : 1}
      />
      <circle
        cx={cfg.cx}
        cy={cfg.cy}
        r={cfg.rZodiac}
        fill="none"
        stroke="rgba(190,143,68,0.22)"
        strokeWidth={variant === 'full' ? 1.5 : 1}
      />
      <circle
        cx={cfg.cx}
        cy={cfg.cy}
        r={cfg.rHousesOuter}
        fill="none"
        stroke="rgba(190,143,68,0.20)"
        strokeWidth={1}
      />
      <circle
        cx={cfg.cx}
        cy={cfg.cy}
        r={cfg.rHousesInner}
        fill="none"
        stroke="rgba(190,143,68,0.14)"
        strokeWidth={1}
      />

      {/* Degree ticks */}
      {Array.from({ length: tickCount }).map((_, i) => {
        const deg = i * cfg.tickEveryDeg;
        const isMajor = deg % 30 === 0;
        const len = isMajor ? cfg.tickLenMajor : cfg.tickLenMinor;
        const p1 = toXY(
          cfg.cx,
          cfg.cy,
          cfg.rZodiac - len,
          deg,
          derived.ascLongitude
        );
        const p2 = toXY(cfg.cx, cfg.cy, cfg.rZodiac, deg, derived.ascLongitude);
        return (
          <line
            key={`tick-${deg}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="rgba(190,143,68,0.28)"
            strokeWidth={isMajor ? 1.2 : 0.8}
          />
        );
      })}

      {/* Zodiac sign glyphs */}
      {Array.from({ length: 12 }).map((_, i) => {
        const signStartAbs = i * 30 + 15;
        const { x, y } = toXY(
          cfg.cx,
          cfg.cy,
          cfg.rOuter - (variant === 'full' ? 18 : 10),
          signStartAbs,
          derived.ascLongitude
        );
        return (
          <text
            key={`sign-${i}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(190,143,68,0.90)"
            fontSize={cfg.fontSign}
            fontWeight={700}
          >
            {SIGN_GLYPHS[i]}
          </text>
        );
      })}

      {/* House cusps */}
      {derived.houseCusps.map((h) => {
        const p1 = toXY(
          cfg.cx,
          cfg.cy,
          cfg.rHousesInner,
          h.abs,
          derived.ascLongitude
        );
        const p2 = toXY(
          cfg.cx,
          cfg.cy,
          cfg.rHousesOuter,
          h.abs,
          derived.ascLongitude
        );
        const label = toXY(
          cfg.cx,
          cfg.cy,
          cfg.rHousesOuter + (variant === 'full' ? 12 : 10),
          h.abs,
          derived.ascLongitude
        );
        return (
          <g key={`house-${h.number}`}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(190,143,68,0.35)"
              strokeWidth={variant === 'full' ? 1.4 : 1}
            />
            {variant === 'full' ? (
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(190,143,68,0.75)"
                fontSize={12}
                fontWeight={600}
              >
                {h.number}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Aspect lines */}
      {derived.aspects.slice(0, variant === 'full' ? 28 : 10).map((a, idx) => {
        const p1 = derived.planetLongs.get(a.planet1);
        const p2 = derived.planetLongs.get(a.planet2);
        if (p1 == null || p2 == null) return null;
        const A = toXY(cfg.cx, cfg.cy, cfg.rAspects, p1, derived.ascLongitude);
        const B = toXY(cfg.cx, cfg.cy, cfg.rAspects, p2, derived.ascLongitude);
        return (
          <line
            key={`asp-${idx}-${a.planet1}-${a.planet2}`}
            x1={A.x}
            y1={A.y}
            x2={B.x}
            y2={B.y}
            stroke={aspectStroke(a.type)}
            strokeWidth={variant === 'full' ? 1.6 : 1}
          />
        );
      })}

      {/* Planets */}
      {placedPlanets.map(({ key, p, abs, radius }) => {
        const { x, y } = toXY(
          cfg.cx,
          cfg.cy,
          radius,
          abs,
          derived.ascLongitude
        );
        const glyph =
          PLANET_GLYPHS[key] || PLANET_GLYPHS[key.toLowerCase()] || '●';
        const retro = !!p?.retrograde;
        return (
          <g key={`pl-${key}`}>
            <circle
              cx={x}
              cy={y}
              r={variant === 'full' ? 10 : 7}
              fill={retro ? 'rgba(255,120,0,0.85)' : 'rgba(190,143,68,0.78)'}
              stroke="rgba(0,0,0,0.35)"
              strokeWidth={1}
              opacity={0.98}
            />
            <text
              x={x}
              y={y + (variant === 'full' ? 1 : 0.5)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.95)"
              fontSize={cfg.fontPlanet}
              fontWeight={800}
            >
              {glyph}
            </text>
            {retro ? (
              <text
                x={x + (variant === 'full' ? 12 : 9)}
                y={y - (variant === 'full' ? 10 : 8)}
                textAnchor="start"
                dominantBaseline="middle"
                fill="rgba(255,120,0,0.95)"
                fontSize={variant === 'full' ? 12 : 10}
                fontWeight={800}
              >
                R
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Core */}
      <circle
        cx={cfg.cx}
        cy={cfg.cy}
        r={cfg.rCore}
        fill={`rgba(190,143,68,${clamp01(variant === 'full' ? 0.14 : 0.18)})`}
        stroke="rgba(190,143,68,0.45)"
        strokeWidth={variant === 'full' ? 2 : 1}
      />
      <text
        x={cfg.cx}
        y={cfg.cy + (variant === 'full' ? 2 : 1)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(190,143,68,0.92)"
        fontSize={variant === 'full' ? 34 : 16}
        fontWeight={900}
      >
        ☉
      </text>
    </svg>
  );
};
