'use client';

import React, { useState, useEffect } from 'react';
import { Section, Container, Grid, Badge, Stack } from '@mirastros-universal/design-system';

interface ShopSectionProps {
  id?: string;
}

export function ShopSection({ id }: ShopSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) * 0.8;
      const y = (e.clientY - window.innerHeight / 2) * 0.8;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = [
    { icon: '💎', title: 'Кристаллы', subtitle: 'Энергия камней' },
    { icon: '🃏', title: 'Таро', subtitle: 'Колоды карт' },
    { icon: '📚', title: 'Книги', subtitle: 'Знания веков' },
    { icon: '🌿', title: 'Благовония', subtitle: 'Ароматы силы' },
    { icon: '🕯️', title: 'Свечи', subtitle: 'Ритуальные' },
    { icon: '💍', title: 'Украшения', subtitle: 'Амулеты' },
  ];

  return (
    <Section
      id={id}
      className="mira-section mira-shop relative overflow-hidden"
      backgroundColor="#000"
      padding="lg"
    >
      {/* Background Image with Parallax — shop-bg-wrapper для tunnel effect */}
      <div
        className="shop-bg-wrapper absolute inset-0 z-0 overflow-hidden"
        style={{
          backgroundImage: 'url(/shop.PNG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transition: 'transform 0.01s ease-out',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.35)`,
          }}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-cosmic/40 z-5" />
      <div className="shop-tunnel-wipe absolute inset-0 z-5 pointer-events-none" />

      {/* Content — shop-welcome-content для tunnel effect */}
      <div className="shop-welcome-content absolute inset-0 z-10 flex items-center justify-center">
      <Container size="full" padded={false} className="relative">
        <Stack direction="column" align="center" justify="center" gap="lg">
          {/* Logo */}
          <div className="flex justify-center w-full">
            <img
              src="/logo.png"
              alt="Mirastros"
              className="max-w-xs md:max-w-md h-auto"
            />
          </div>

          {/* Subtitle */}
          <p className="text-center text-gray-300 text-lg max-w-2xl">
            Эзотерический магазин мистических артефактов и инструментов для духовной практики
          </p>

          {/* Categories Grid */}
          <Grid
            columns={3}
            gap="sm"
            className="w-full max-w-2xl"
            responsiveColumns={{
              mobile: 1,
              tablet: 2,
              desktop: 3,
            }}
          >
            {categories.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 text-center transition-all hover:border-gold-500/50 hover:bg-white/10 cursor-pointer"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </Grid>

          {/* Coming Soon Badge */}
          <Badge
            variant="default"
            size="md"
            className="bg-gradient-to-r from-gold-500/20 to-purple-500/20 border border-gold-500/50 mt-4"
          >
            ✨ Скоро открытие ✨
          </Badge>
        </Stack>
      </Container>
      </div>
    </Section>
  );
}
