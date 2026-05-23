'use client';

import { useEffect } from 'react';
import { DynamicBackground } from '../../components/DynamicBackground';

// Пример для тестирования эффекта
// ВАЖНО: Фон будет размыт (blur: 106px) и увеличен (scale: 1.2)
// Это создает эффект глубины, как на sageeast.com

const testBackgrounds = [
    {
        src: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
        alt: 'Stars 1'
    },
    {
        src: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
        alt: 'Stars 2'
    },
    {
        src: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&q=80',
        alt: 'Galaxy'
    },
    {
        src: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=80',
        alt: 'Nebula'
    },
    {
        src: 'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1920&q=80',
        alt: 'Milky Way'
    },
];

export default function BackgroundTest() {
    useEffect(() => {
        // Загрузка GSAP
        const loadScripts = async () => {
            const gsapScript = document.createElement('script');
            gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
            document.body.appendChild(gsapScript);

            await new Promise(resolve => gsapScript.onload = resolve);

            const stScript = document.createElement('script');
            stScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
            document.body.appendChild(stScript);

            await new Promise(resolve => stScript.onload = resolve);

            if (window.gsap && window.ScrollTrigger) {
                window.gsap.registerPlugin(window.ScrollTrigger);
                console.log('✅ GSAP и ScrollTrigger загружены');
            }
        };

        loadScripts();
    }, []);

    return (
        <div style={{ backgroundColor: '#000' }}>
            {/* Динамический фон - размытый и увеличенный */}
            <DynamicBackground
                images={testBackgrounds}
                blurAmount={106}  // Как на sageeast.com
                scale={1.2}       // Увеличение на 20%
            />

            {/* Контент для скролла */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Секция 1 */}
                <section style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '4rem',
                            fontWeight: 'bold',
                            textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                        }}>
                            Динамический фон
                        </h1>
                        <p style={{
                            fontSize: '1.5rem',
                            marginTop: '1rem',
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                        }}>
                            Прокрутите вниз, чтобы увидеть эффект
                        </p>
                        <div style={{
                            marginTop: '2rem',
                            fontSize: '3rem',
                            animation: 'bounce 2s infinite'
                        }}>
                            ↓
                        </div>
                    </div>
                </section>

                {/* Секции 2-5 */}
                {[2, 3, 4, 5].map((num) => (
                    <section
                        key={num}
                        style={{
                            minHeight: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            textAlign: 'center',
                            padding: '2rem'
                        }}
                    >
                        <div>
                            <h2 style={{
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                            }}>
                                Секция {num}
                            </h2>
                            <p style={{
                                fontSize: '1.2rem',
                                marginTop: '1rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                maxWidth: '600px',
                                margin: '1rem auto'
                            }}>
                                Фон плавно меняется при скролле с эффектом размытия
                            </p>
                        </div>
                    </section>
                ))}

                {/* Последняя секция */}
                <section style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '3rem',
                            fontWeight: 'bold',
                            textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                        }}>
                            Конец демо
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            marginTop: '1rem',
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                        }}>
                            Прокрутите вверх, чтобы увидеть эффект в обратном направлении
                        </p>
                        <div style={{
                            marginTop: '2rem',
                            fontSize: '3rem',
                            animation: 'bounce 2s infinite',
                            transform: 'rotate(180deg)'
                        }}>
                            ↓
                        </div>
                    </div>
                </section>
            </div>

            {/* Индикатор прогресса */}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 1000,
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.7)',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                display: 'flex',
                gap: '1rem'
            }}>
                <span>SCROLL</span>
                <span id="scrollPercent">0%</span>
            </div>

            <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
        </div>
    );
}

// Declare global types
declare global {
    interface Window {
        gsap: any;
        ScrollTrigger: any;
    }
}
