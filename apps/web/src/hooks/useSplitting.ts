'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Splitting?: any;
  }
}

export const useSplitting = (type: 'chars' | 'words' = 'words') => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const initSplitting = () => {
      if (window.Splitting && ref.current) {
        window.Splitting({
          target: ref.current,
          by: type
        });
      }
    };

    // Если Splitting уже загружен
    if (window.Splitting) {
      initSplitting();
    } else {
      // Ждем загрузки
      const checkSplitting = setInterval(() => {
        if (window.Splitting) {
          initSplitting();
          clearInterval(checkSplitting);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkSplitting);
      }, 5000); // Timeout через 5 секунд

      return () => clearInterval(checkSplitting);
    }
  }, [type]);

  return ref;
};
