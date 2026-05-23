'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar as DesignSystemNavbar, Button } from '@mirastros-universal/design-system';
import { api } from '../services/api';
import type { User } from '../types';
import type { NavbarMenuItem } from '@mirastros-universal/design-system';

export const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [showLogo, setShowLogo] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check authentication
        const checkAuth = async () => {
            try {
                const userData = await api.getCurrentUser();
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [pathname]);

    useEffect(() => {
        // Register ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        // Синхронизация с анимацией hero из page.tsx
        // Hero анимация: от 0 до 1.3 * scrollPerSlide
        // scrollPerSlide = vh * 2
        const vh = window.innerHeight;
        const scrollPerSlide = vh * 2;
        const heroStart = 0; // Hero анимация начинается с 0
        const heroEnd = 1.3 * scrollPerSlide; // Hero анимация заканчивается на 1.3 * scrollPerSlide
        
        // Находим все секции для определения Shop секции
        const slides = gsap.utils.toArray('.mira-section');
        const totalSlides = slides.length;
        const shopSlideIndex = totalSlides - 1; // Shop - последняя секция
        
        // Shop анимация начинается на позиции shopSlideIndex * scrollPerSlide
        const shopStart = shopSlideIndex * scrollPerSlide;
        const shopEnd = (shopSlideIndex + 1.3) * scrollPerSlide;

        // Hero контент начинает исчезать на 0.5 timeline (50% прогресса Hero анимации)
        // Это соответствует: 0.5 * 1.3 * scrollPerSlide = 0.65 * scrollPerSlide
        const heroContentFadeStart = 0.5 * heroEnd;

        // Shop контент начинает появляться на 0% прогресса Shop анимации
        // Скрываем маленький логотип, когда Shop контент начинает появляться (на 15% прогресса Shop)
        const shopContentFadeStart = shopStart + 0.15 * (shopEnd - shopStart);

        // Создаем ScrollTrigger для Hero - показываем логотип, когда Hero контент исчезает
        const heroScrollTrigger = ScrollTrigger.create({
            trigger: document.body,
            start: `${heroContentFadeStart}px top`,
            end: `${heroEnd}px top`,
            onEnter: () => setShowLogo(true),
            onLeave: () => {}, // Не меняем состояние при выходе
            onEnterBack: () => setShowLogo(true),
            onLeaveBack: () => setShowLogo(false),
        });

        // Создаем ScrollTrigger для промежуточных секций - логотип должен быть виден
        const middleScrollTrigger = ScrollTrigger.create({
            trigger: document.body,
            start: `${heroEnd}px top`,
            end: `${shopContentFadeStart}px top`,
            onEnter: () => setShowLogo(true),
            onLeave: () => setShowLogo(false),
            onEnterBack: () => setShowLogo(true),
            onLeaveBack: () => setShowLogo(true),
        });

        // Создаем ScrollTrigger для Shop - скрываем логотип, когда Shop контент появляется
        const shopScrollTrigger = ScrollTrigger.create({
            trigger: document.body,
            start: `${shopStart}px top`,
            end: `${shopContentFadeStart}px top`,
            onEnter: () => setShowLogo(false),
            onLeave: () => setShowLogo(false),
            onEnterBack: () => setShowLogo(true),
            onLeaveBack: () => setShowLogo(true),
        });

        return () => {
            heroScrollTrigger.kill();
            middleScrollTrigger.kill();
            shopScrollTrigger.kill();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await api.logout();
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isAuthenticated = !!user;
    const isDashboardPage = pathname?.startsWith('/dashboard') ||
                           pathname?.startsWith('/profile') ||
                           pathname?.startsWith('/subscription') ||
                           pathname?.startsWith('/natal-chart') ||
                           pathname?.startsWith('/history');

    // Build menu items for authenticated dashboard users
    const dashboardMenuItems: NavbarMenuItem[] = isDashboardPage && isAuthenticated ? [
        {
            id: 'dashboard',
            label: 'Панель',
            href: '/dashboard',
            active: pathname === '/dashboard',
            onClick: () => router.push('/dashboard'),
        },
        {
            id: 'history',
            label: 'История',
            href: '/history',
            active: pathname?.startsWith('/history'),
            onClick: () => router.push('/history'),
        },
        {
            id: 'profile',
            label: 'Профиль',
            href: '/profile',
            active: pathname === '/profile',
            onClick: () => router.push('/profile'),
        },
        {
            id: 'subscription',
            label: 'Подписка',
            href: '/subscription',
            active: pathname === '/subscription',
            onClick: () => router.push('/subscription'),
        },
    ] : [];

    // Logo element
    const logoElement = (
        <Link href="/" className="flex items-center">
            <img 
                src="/logo.png" 
                alt="Mirastros" 
                className="h-10 w-auto"
            />
        </Link>
    );

    // User profile configuration
    const userProfile = isAuthenticated && user ? {
        name: user.fullName || user.email || 'User',
        initials: (user.fullName || user.email || 'U').charAt(0).toUpperCase(),
        email: user.email,
        menuItems: [
            {
                label: '📊 Панель',
                onClick: () => router.push('/dashboard'),
            },
            {
                label: '📜 История',
                onClick: () => router.push('/history'),
            },
            {
                label: '👤 Профиль',
                onClick: () => router.push('/profile'),
            },
            {
                label: '💎 Подписка',
                onClick: () => router.push('/subscription'),
            },
            {
                label: '⭐ Натальная карта',
                onClick: () => router.push('/natal-chart'),
            },
        ],
        onLogout: handleLogout,
    } : undefined;

    return (
        <DesignSystemNavbar
            logo={logoElement}
            onLogoClick={() => router.push('/')}
            menuItems={dashboardMenuItems}
            userProfile={userProfile}
            variant="dark"
            sticky={true}
            className="bg-black/80 backdrop-blur-md"
        >
            {/* Unauthenticated user actions */}
            {!isAuthenticated && (
                <div className="flex items-center gap-4 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2">
                    <Link
                        href="/auth/login"
                        className="text-sm font-semibold text-gray-300 hover:text-white transition"
                    >
                        Войти
                    </Link>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push('/auth/register')}
                    >
                        Регистрация
                    </Button>
                </div>
            )}
        </DesignSystemNavbar>
    );
};
