'use client';

import './global.css';
import './section-layouts.css';
import { Preloader } from '../components/Preloader';
import { LenisProvider } from '../components/LenisProvider';
import { ToastProvider } from '../contexts/ToastContext';
import { Cinzel, Inter, Manrope, Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState, useCallback } from 'react';
import Script from 'next/script';

const display = Cormorant_Garamond({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600'], variable: '--font-display', display: 'swap' });

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
    const hasVisited = sessionStorage.getItem('mirastros_visited');

    if (hasVisited) {
      document.body.classList.remove('preloader-active');
      setShowPreloader(false);
      setIsFirstLoad(false);
    } else {
      sessionStorage.setItem('mirastros_visited', 'true');
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
          href="https://cdn.jsdelivr.net/npm/splitting@1.0.6/dist/splitting.min.css"
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
          src="https://cdn.jsdelivr.net/npm/splitting@1.0.6/dist/splitting.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
