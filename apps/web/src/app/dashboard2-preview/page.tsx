'use client';

import Link from 'next/link';

export default function Dashboard2PreviewPage() {
  return (
    <main className="bg-black text-white">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(22,86,129,0.6),rgba(3,5,10,0.95)_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),transparent_35%,rgba(17,42,70,0.45)_72%)]" />

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-mirastros-gold/80">Dashboard2 Temporary Preview</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">HeroPanel (упрощенно) → Infinite Menu</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/80 md:text-lg">
            Эта страница нужна только для визуального просмотра связки: после прокрутки hero-секции начинается
            infinite menu с вашими пунктами из tunnel-эффекта.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#infinite-preview"
              className="rounded-full border border-mirastros-gold/55 bg-mirastros-gold/20 px-5 py-2.5 text-sm font-medium text-mirastros-gold transition hover:bg-mirastros-gold/30"
            >
              Перейти к Infinite Menu
            </a>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-white transition hover:bg-white/10"
            >
              Назад в Dashboard
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.25em] text-white/55">
          Scroll Down
        </div>
      </section>

      <section id="infinite-preview" className="relative min-h-screen">
        <div className="flex min-h-screen items-center justify-center px-6 text-center">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-mirastros-gold/80">Preview disabled</p>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl">Экспериментальное меню временно исключено из production build</h2>
            <p className="mt-5 text-white/70">
              Страница оставлена как техническая точка входа, но canvas-preview будет возвращен после стабилизации
              зависимостей и production-сборок.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
