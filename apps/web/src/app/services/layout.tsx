'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { journeyModules } from '../../components/journey/catalog';
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { User } from '../../types';

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const accent = journeyModules.find((item) => item.href === pathname)?.accent;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const userData = await api.getCurrentUser();
        if (isMounted) {
          setUser(userData);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('Failed to load user:', error);
        if (isMounted) {
          setLoading(false);
          router.push('/auth/login');
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mirastros-gold mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className={`mira-module-page min-h-screen ${
        pathname === '/services/tarot' ? '' : 'py-12 px-4'
      }`}
      style={
        {
          '--mira-module-accent': accent || '#9d78d4',
          padding: pathname === '/services/tarot' ? 0 : undefined,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
