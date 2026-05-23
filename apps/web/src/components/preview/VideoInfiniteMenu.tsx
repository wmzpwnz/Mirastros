'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { TunnelInfiniteMenuItem } from '../../constants/tunnelInfiniteMenuItems';

interface VideoInfiniteMenuProps {
  items: TunnelInfiniteMenuItem[];
}

const TWO_PI = Math.PI * 2;
const BASE_ROTATION_SPEED = 0.0016;
const WHEEL_SENSITIVITY = 0.00035;
const DRAG_SENSITIVITY = 0.008;

function getFrontItemIndex(rotation: number, itemCount: number): number {
  if (itemCount <= 0) return -1;

  const angleStep = TWO_PI / itemCount;
  let bestIndex = 0;
  let bestDepth = -Infinity;

  for (let index = 0; index < itemCount; index += 1) {
    const depth = Math.cos(index * angleStep + rotation);
    if (depth > bestDepth) {
      bestDepth = depth;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export default function VideoInfiniteMenu({ items }: VideoInfiniteMenuProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const dragStateRef = useRef({
    active: false,
    lastX: 0,
  });

  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(320);
  const [selectedItem, setSelectedItem] = useState<TunnelInfiniteMenuItem | null>(null);

  useEffect(() => {
    const updateRadius = () => {
      const el = containerRef.current;
      if (!el) return;
      const base = Math.min(el.clientWidth, el.clientHeight);
      const nextRadius = Math.max(170, Math.min(390, base * 0.36));
      setRadius(nextRadius);
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => {
      window.removeEventListener('resize', updateRadius);
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    let rafId = 0;
    const animate = () => {
      rotationRef.current += BASE_ROTATION_SPEED + velocityRef.current;
      velocityRef.current *= 0.92;

      if (Math.abs(velocityRef.current) < 0.00001) {
        velocityRef.current = 0;
      }

      setRotation(rotationRef.current);
      rafId = window.requestAnimationFrame(animate);
    };

    rafId = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [items.length]);

  useEffect(() => {
    if (!selectedItem) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedItem(null);
      }
    };

    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('keydown', onEsc);
    };
  }, [selectedItem]);

  const activeIndex = useMemo(() => getFrontItemIndex(rotation, items.length), [rotation, items.length]);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const angleStep = items.length ? TWO_PI / items.length : 0;

  const handleWheel: React.WheelEventHandler<HTMLDivElement> = event => {
    event.preventDefault();
    velocityRef.current += event.deltaY * WHEEL_SENSITIVITY;
  };

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = event => {
    dragStateRef.current.active = true;
    dragStateRef.current.lastX = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = event => {
    if (!dragStateRef.current.active) return;

    const deltaX = event.clientX - dragStateRef.current.lastX;
    dragStateRef.current.lastX = event.clientX;

    rotationRef.current += deltaX * DRAG_SENSITIVITY * 0.01;
    velocityRef.current = deltaX * DRAG_SENSITIVITY * 0.0014;
    setRotation(rotationRef.current);
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = event => {
    dragStateRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden bg-[#02040a]"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(212,175,55,0.22),rgba(2,4,10,0.9)_50%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42vh] w-[42vh] -translate-x-1/2 -translate-y-1/2 rounded-full border border-mirastros-gold/30" />

        {items.map((item, index) => {
          const angle = index * angleStep + rotation;
          const depthNorm = (Math.cos(angle) + 1) / 2;
          const x = Math.sin(angle) * radius;
          const y = Math.sin(angle * 1.4) * 18;
          const scale = 0.64 + depthNorm * 0.45;
          const opacity = 0.24 + depthNorm * 0.76;
          const blur = (1 - depthNorm) * 2;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedItem(item)}
              className="absolute left-1/2 top-1/2 h-[clamp(220px,44vh,320px)] w-[clamp(150px,22vw,220px)] overflow-hidden rounded-2xl border border-white/15 bg-black/35 shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
              style={{
                transform: `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`,
                opacity,
                filter: `blur(${blur}px)`,
                zIndex: Math.round(depthNorm * 1000),
              }}
            >
              {depthNorm > 0.3 && (
                <video
                  src={item.video}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                  onPointerOver={e => e.currentTarget.play()}
                  onPointerOut={e => e.currentTarget.pause()}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 pb-3 pt-10 text-left">
                <p className="text-sm font-semibold text-white">{item.title}</p>
              </div>
            </button>
          );
        })}

        {activeItem && (
          <div className="absolute bottom-5 left-1/2 w-[min(680px,92vw)] -translate-x-1/2 rounded-2xl border border-white/15 bg-black/70 p-4 backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.2em] text-mirastros-gold/80">Infinite Menu Preview</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{activeItem.title}</h2>
            <p className="mt-1 text-sm text-white/80">{activeItem.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedItem(activeItem)}
                className="rounded-full border border-mirastros-gold/50 bg-mirastros-gold/20 px-4 py-2 text-sm font-medium text-mirastros-gold transition hover:bg-mirastros-gold/30"
              >
                Смотреть видео и описание
              </button>
              <Link
                href={activeItem.href}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Открыть сервис
              </Link>
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-[min(920px,96vw)] overflow-hidden rounded-2xl border border-white/20 bg-[#060a14]"
            onClick={event => event.stopPropagation()}
          >
            <div className="grid gap-0 md:grid-cols-[1.2fr,1fr]">
              <video
                src={selectedItem.video}
                className="h-full min-h-[280px] w-full object-cover"
                controls
                muted
                autoPlay
                loop
                playsInline
              />
              <div className="flex flex-col p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-mirastros-gold/80">Preview Card</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{selectedItem.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{selectedItem.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={selectedItem.href}
                    className="rounded-full border border-mirastros-gold/50 bg-mirastros-gold/20 px-4 py-2 text-sm font-medium text-mirastros-gold transition hover:bg-mirastros-gold/30"
                  >
                    Перейти в сервис
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
