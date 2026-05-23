'use client';

import { useEffect, useState } from 'react';

// Упрощенная версия для отладки - БЕЗ GSAP
export default function BackgroundTestSimple() {
    const [currentBg, setCurrentBg] = useState(0);

    const backgrounds = [
        'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
        'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=1920&q=80',
        'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=80',
        'https://images.unsplash.com/photo-1444080748397-f442aa95c3e5?w=1920&q=80',
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
            const bgIndex = Math.floor(scrollPercent * backgrounds.length);
            setCurrentBg(Math.min(bgIndex, backgrounds.length - 1));

            // Обновляем индикатор
            const indicator = document.getElementById('scrollPercent');
            if (indicator) {
                indicator.textContent = `${Math.round(scrollPercent * 100)}%`;
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [backgrounds.length]);

    return (
        <div style={{ backgroundColor: '#000', minHeight: '500vh' }}>
            {/* ФИКСИРОВАННЫЙ ФОН */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    zIndex: -5,
                    filter: 'blur(106px)',
                    overflow: 'hidden',
                }}
            >
                {backgrounds.map((bg, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url(${bg})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            transform: 'scale(1.2)',
                            opacity: currentBg === index ? 1 : 0,
                            transition: 'opacity 0.5s ease',
                        }}
                    />
                ))}
            </div>

            {/* КОНТЕНТ */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <section
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                        padding: '2rem',
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: '4rem',
                                fontWeight: 'bold',
                                textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                            }}
                        >
                            Тест фона (упрощенный)
                        </h1>
                        <p
                            style={{
                                fontSize: '1.5rem',
                                marginTop: '1rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                            }}
                        >
                            Текущий фон: {currentBg + 1} из {backgrounds.length}
                        </p>
                        <p
                            style={{
                                fontSize: '1.2rem',
                                marginTop: '1rem',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                color: '#FFD700',
                            }}
                        >
                            Прокрутите вниз ↓
                        </p>
                    </div>
                </section>

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
                            padding: '2rem',
                        }}
                    >
                        <div>
                            <h2
                                style={{
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                                }}
                            >
                                Секция {num}
                            </h2>
                            <p
                                style={{
                                    fontSize: '1.2rem',
                                    marginTop: '1rem',
                                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                }}
                            >
                                Фон меняется при скролле
                            </p>
                        </div>
                    </section>
                ))}
            </div>

            {/* Индикатор */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 1000,
                    fontSize: '1.5rem',
                    color: 'white',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                }}
            >
                <div>SCROLL: <span id="scrollPercent">0%</span></div>
                <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>
                    Фон: {currentBg + 1}/{backgrounds.length}
                </div>
            </div>
        </div>
    );
}
