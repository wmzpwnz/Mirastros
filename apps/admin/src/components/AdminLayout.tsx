'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: '📊' },
        { name: 'Users', href: '/users', icon: '👥' },
        { name: 'Documents', href: '/documents', icon: '📚' },
        { name: 'Analytics', href: '/analytics', icon: '📈' },
        { name: 'Shop', href: '/shop', icon: '🛍️' },
        { name: 'Moderation', href: '/moderation', icon: '🛡️' },
        { name: 'Settings', href: '/settings', icon: '⚙️' },
    ];

    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside
                className={`${sidebarOpen ? 'w-64' : 'w-20'
                    } glass border-r border-white/10 transition-all duration-300 flex flex-col`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-white/10">
                    <h1 className="text-2xl font-cinzel text-gold">
                        {sidebarOpen ? 'Mirastros' : 'M'}
                    </h1>
                    <p className="text-xs text-silver/60 mt-1">
                        {sidebarOpen && 'Admin Panel'}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-gold/20 text-gold border border-gold/30'
                                        : 'text-silver/80 hover:bg-white/5 hover:text-silver'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {sidebarOpen && <span className="font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-4 border-t border-white/10 text-silver/60 hover:text-silver transition-colors"
                >
                    {sidebarOpen ? '◀' : '▶'}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">{children}</div>
            </main>
        </div>
    );
}
