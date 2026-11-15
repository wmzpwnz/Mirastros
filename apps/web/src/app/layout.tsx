'use client';

import './global.css';
import './gold-theme.css';
import './section-layouts.css';
import { Preloader } from '../components/Preloader';
import { LenisProvider } from '../components/LenisProvider';
import { ToastProvider } from '../contexts/ToastContext';
import { Cinzel, Inter, Manrope } from 'next/font/google';
import localFont from 'next/font/local';
import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';

const display = localFont({ src: '../fonts/CormorantGaramond-variable.woff2', weight: '400 600', variable: '--font-display', display: 'swap' });

// Configure fonts
const cinzel = Cinzel({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-cinzel',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPreloader, setShowPreloader] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    let hasVisited = false;
    try { hasVisited = Boolean(sessionStorage.getItem('mirastros_visited')); } catch { /* Storage restrictions must not block entry. */ }

    if (hasVisited) {
      document.body.classList.remove('preloader-active');
      setShowPreloader(false);
      setIsFirstLoad(false);
    } else {
      try { sessionStorage.setItem('mirastros_visited', 'true'); } catch { /* Continue without visit persistence. */ }
      document.body.classList.add('preloader-active');
    }
    return () => document.body.classList.remove('preloader-active');
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    document.body.classList.remove('preloader-active');
    setShowPreloader(false);
  }, []);

  return (
    <html lang="ru" className={`${cinzel.variable} ${inter.variable} ${manrope.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        {/* Splitting.js CSS */}
        <link
          rel="stylesheet"
          href="/vendor/splitting/splitting.css"
        />
      </head>
      <body className={`font-sans antialiased ${cinzel.variable} ${inter.variable} ${manrope.variable} ${display.variable}`} suppressHydrationWarning>
        {/* Preloader - показывается только при первом визите */}
        {isFirstLoad && showPreloader && (
          <Preloader onComplete={handlePreloaderComplete} />
        )}

        {/* Toast Provider for error/success notifications */}
        <ToastProvider>
          {/* Lenis Smooth Scroll Provider */}
          <LenisProvider>
            {children}
          </LenisProvider>
        </ToastProvider>

        {/* Splitting.js Script */}
        <Script
          src="/vendor/splitting/splitting.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
