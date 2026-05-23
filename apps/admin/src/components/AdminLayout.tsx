'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar, Container, Button } from '@mirastros-universal/design-system';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout, loading } = useAuth();

    const navigation = [
        { name: 'Главная', href: '/', icon: '📊' },
        { name: 'Пользователи', href: '/users', icon: '👥' },
        { name: 'Документы', href: '/documents', icon: '📚' },
        { name: 'Аналитика', href: '/analytics', icon: '📈' },
        { name: 'Магазин', href: '/shop', icon: '🛍️' },
        { name: 'Модерация', href: '/moderation', icon: '🛡️' },
        { name: 'Настройки', href: '/settings', icon: '⚙️' },
    ];

    const menuItems = navigation.map((item) => ({
        id: item.href || item.name,
        label: item.name,
        href: item.href,
        icon: item.icon,
        active: pathname === item.href,
    }));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                        <p className="text-silver/60">Загрузка...</p>
                    </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <Sidebar
                menuItems={menuItems}
                open={true}
                collapsed={!sidebarOpen}
                onCollapsedChange={(collapsed) => setSidebarOpen(!collapsed)}
                header={
                    <div className="flex flex-col gap-1">
                        <span className="text-xl font-cinzel text-gold font-semibold">Mirastros</span>
                        <span className="text-xs text-silver/60">Панель администратора</span>
                    </div>
                }
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Header with user info and logout */}
                <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="text-sm">
                                <p className="text-silver/60">Вход выполнен:</p>
                                <p className="text-gold font-medium">{user.email}</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="secondary"
                        onClick={logout}
                        size="sm"
                    >
                        Выйти
                    </Button>
                </div>

                <Container size="lg" className="py-8">
                    {children}
                </Container>
            </main>
        </div>
    );
}
