'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader = ({ onComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [loadingStage, setLoadingStage] = useState<'resources' | 'complete'>('resources');

  useEffect(() => {
    let mounted = true;
    const resourcesLoaded = new Set<string>();
    let totalResources = 0;
    let loadedResources = 0;

    // Track resource loading via Performance API
    const trackResources = () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      totalResources = Math.max(totalResources, resources.length);

      resources.forEach((resource) => {
        if (!resourcesLoaded.has(resource.name)) {
          resourcesLoaded.add(resource.name);
          loadedResources++;

          if (mounted) {
            const newProgress = Math.min((loadedResources / totalResources) * 100, 95);
            setProgress(newProgress);
          }
        }
      });
    };

    // Initial check
    trackResources();

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource' && !resourcesLoaded.has(entry.name)) {
          resourcesLoaded.add(entry.name);
          loadedResources++;
          totalResources++;

          if (mounted) {
            const newProgress = Math.min((loadedResources / totalResources) * 100, 95);
            setProgress(newProgress);
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    // Fallback: Simulate progress to avoid 0% hang
    const fallbackTimer = setInterval(() => {
      if (mounted) {
        setProgress((prev) => {
          if (prev < 15) return prev + 1; // Always move to 15% quickly
          if (totalResources === 0) return Math.min(prev + 2, 90); // If no resources, continue steady
          return prev; // Otherwise let Performance API handle it
        });
      }
    }, 150);

    // Check if page is fully loaded
    const checkComplete = () => {
      if (document.readyState === 'complete') {
        if (mounted) {
          setLoadingStage('complete');
          setProgress(100);
          
          setTimeout(() => {
            if (mounted) {
              setIsVisible(false);
              onComplete?.();
            }
          }, 500);
        }
      }
    };

    // Listen for load event
    if (document.readyState === 'complete') {
      checkComplete();
    } else {
      window.addEventListener('load', checkComplete);
    }

    // Timeout: Force completion after 15 seconds
    const timeoutId = setTimeout(() => {
      if (mounted && loadingStage !== 'complete') {
        console.warn('Preloader timeout: Forcing completion');
        setLoadingStage('complete');
        setProgress(100);
        
        setTimeout(() => {
          if (mounted) {
            setIsVisible(false);
            onComplete?.();
          }
        }, 500);
      }
    }, 15000);

    return () => {
      mounted = false;
      observer.disconnect();
      clearInterval(fallbackTimer);
      clearTimeout(timeoutId);
      window.removeEventListener('load', checkComplete);
    };
  }, [onComplete, loadingStage]);

  // Allow user to skip preloader
  const handleSkip = () => {
    setProgress(100);
    setLoadingStage('complete');
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="preloader-content" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            position: 'relative',
            zIndex: 100
          }}>
            <div className="preloader-circle-wrapper">
              {/* Rotating rings */}
              <div className="preloader-ring preloader-ring-1"></div>
              <div className="preloader-ring preloader-ring-2"></div>
              <div className="preloader-ring preloader-ring-3"></div>

              <motion.video
                className="preloader-logo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata" // Changed from 'auto' to avoid saturating bandwidth
              >
                <source src="/circle.webm" type="video/webm" />
                <source src="/circle.mp4" type="video/mp4" />
              </motion.video>
            </div>

            {/* Текст и кнопка ПОСЛЕ гифки */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              zIndex: 200,
              position: 'relative'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#FFD700',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
                  fontFamily: 'var(--font-cinzel)',
                  letterSpacing: '0.2em'
                }}
              >
                {loadingStage === 'resources' && (
                  <div>
                    <div>ЗАГРУЗКА</div>
                    <div style={{ fontSize: '3rem', marginTop: '0.5rem', fontWeight: '900' }}>
                      {Math.round(progress)}%
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Skip button */}
              {(progress < 90 && progress > 20) && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={handleSkip}
                  style={{ 
                    padding: '1rem 2rem',
                    background: 'rgba(190, 143, 68, 0.3)',
                    border: '2px solid rgba(255, 215, 0, 0.8)',
                    borderRadius: '0.5rem',
                    color: '#FFD700',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    transition: 'all 0.3s ease',
                    fontFamily: 'var(--font-cinzel)',
                    boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3)'
                  }}
                >
                  ПРОПУСТИТЬ →
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
