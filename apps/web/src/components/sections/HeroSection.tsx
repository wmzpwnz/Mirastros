'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mirastros-universal/design-system';
import { useSplitting } from '../../hooks/useSplitting';

interface HeroSectionProps {
    id?: string;
}

export const HeroSection = ({ id }: HeroSectionProps) => {
    const router = useRouter();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const subtitleRef = useSplitting('words');

    // Mouse move parallax effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX - window.innerWidth / 2) * 0.05;
            const y = (e.clientY - window.innerHeight / 2) * 0.05;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

  return (
    <section
        className="mira-section mira-hero active"
        id={id}
        style={{
            background: '#000'
        }}
    >
            {/* Background Images Wrapper */}
            <div
                className="hero-bg-wrapper"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    minWidth: '100%',
                    minHeight: '100%',
                    zIndex: 0,
                    overflow: 'hidden'
                }}
            >
                <img
                    src="/backweb.png"
                    alt="Background"
                    className="hero-bg-img desktop-only"
                    style={{
                        transition: 'transform 0.1s ease-out',
                        width: '100vw',
                        height: '100vh',
                        minWidth: '100%',
                        minHeight: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px)) scale(1.15)`
                    }}
                />
                <img
                    src="/backmobile.png"
                    alt="Background"
                    className="hero-bg-img mobile-only"
                    style={{
                        transition: 'transform 0.1s ease-out',
                        width: '100vw',
                        height: '100vh',
                        minWidth: '100%',
                        minHeight: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(calc(-50% + ${mousePosition.x}px), calc(-50% + ${mousePosition.y}px)) scale(1.15)`
                    }}
                />
            </div>

            {/* Gradient Overlay (Darker for better contrast) */}
            <div
                className="hero-overlay"
                style={{
                    zIndex: 1,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    minWidth: '100%',
                    minHeight: '100%',
                    background: 'radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.95) 100%)',
                    pointerEvents: 'none'
                }}
            ></div>

            {/* Welcome Content */}
            <div
                className="hero-welcome-content"
                style={{
                    position: 'relative',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                    maxWidth: '100vw',
                    textAlign: 'center'
                }}
            >
                {/* Magic Circle Background */}
                <div className="hero-magic-circle"></div>
                <div className="hero-portal-orb" aria-hidden="true">
                    <div className="hero-portal-ring hero-portal-ring-1"></div>
                    <div className="hero-portal-ring hero-portal-ring-2"></div>
                    <div className="hero-portal-ring hero-portal-ring-3"></div>
                    <div className="hero-portal-core"></div>
                </div>

                {/* Light Rays */}
                <div className="hero-light-rays">
                    <div className="ray ray-1"></div>
                    <div className="ray ray-2"></div>
                    <div className="ray ray-3"></div>
                    <div className="ray ray-4"></div>
                </div>

                {/* Logo */}
                <div className="hero-logo-container hero-logo-buttons-group" style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 10 }}>
                    <img
                        src="/logo.png"
                        alt="Mirastros"
                        className="hero-logo-large"
                        style={{ maxWidth: '80vw', height: 'auto' }}
                    />
                </div>

                {/* Subtitle with decorative lines */}
                <p className="hero-subtitle hero-subtitle-text hero-subtitle-enhanced" style={{ position: 'relative', zIndex: 10 }}>
                    <span className="subtitle-line subtitle-line-glow"></span>
                    <span ref={subtitleRef as any} data-splitting className="subtitle-text-glow">
                        ОТКРОЙ КАРТУ СВОЕГО ПУТИ
                    </span>
                    <span className="subtitle-line subtitle-line-glow"></span>
                </p>

                {/* Floating particles */}
                <div className="hero-particles">
                    <div className="particle particle-1"></div>
                    <div className="particle particle-2"></div>
                    <div className="particle particle-3"></div>
                    <div className="particle particle-4"></div>
                    <div className="particle particle-5"></div>
                    <div className="particle particle-6"></div>
                </div>

                {/* Decorative stars */}
                <div className="hero-stars">
                    <div className="star star-1">✦</div>
                    <div className="star star-2">✧</div>
                    <div className="star star-3">✦</div>
                    <div className="star star-4">✧</div>
                </div>

                {/* Flying GIFs Container - для эффекта вылета разделов */}
                <div className="hero-flying-gifs" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    zIndex: 50,
                    pointerEvents: 'none',
                    overflow: 'hidden'
                }}>
                    {/* GIF элементы будут созданы динамически через GSAP */}
                </div>

                {/* Auth Buttons - Using Design System Button Component */}
                <div className="hero-logo-buttons-group hero-buttons-enhanced" style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '3rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    maxWidth: '450px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 100,
                    pointerEvents: 'auto'
                }}>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => router.push('/auth/register')}
                        className="flex-1 min-w-[180px] hero-btn-register"
                        style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.95) 0%, rgba(190, 143, 68, 0.95) 100%)',
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(212, 175, 55, 0.4)',
                            fontSize: '0.95rem',
                            padding: '0.875rem 1.5rem',
                            fontWeight: '600',
                            borderRadius: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <span className="hero-btn-bg" aria-hidden="true"></span>
                        <span className="hero-btn-glow" aria-hidden="true"></span>
                        <span className="hero-btn-label">Начать</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => router.push('/auth/login')}
                        className="flex-1 min-w-[180px] hero-btn-login"
                        style={{
                            background: 'transparent',
                            backdropFilter: 'none',
                            border: '2px solid rgba(212, 175, 55, 0.6)',
                            color: 'rgba(255, 255, 255, 0.95)',
                            fontSize: '0.95rem',
                            padding: '0.875rem 1.5rem',
                            fontWeight: '600',
                            borderRadius: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        <span className="hero-btn-bg" aria-hidden="true"></span>
                        <span className="hero-btn-glow" aria-hidden="true"></span>
                        <span className="hero-btn-label">Войти</span>
                    </Button>
                </div>

            </div>
        </section>
    );
};
