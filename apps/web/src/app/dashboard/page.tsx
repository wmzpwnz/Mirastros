'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../services/api';
import type { User } from '../../types';
import { DailyOverview } from '../../components/dashboard/DailyOverview';
import { DepthJourney } from '../../components/journey/DepthJourney';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    let mounted = true;
    const timeout = window.setTimeout(() => { if (mounted) router.replace('/auth/login'); }, 10000);
    api.getCurrentUser().then(data => { if (mounted) { setUser(data); window.clearTimeout(timeout); } }).catch(() => { if (mounted) router.replace('/auth/login'); });
    return () => { mounted = false; window.clearTimeout(timeout); };
  }, [router]);
  if (!user) return <div className="min-h-screen flex items-center justify-center text-purple-200" role="status">Открываем ваш мир Mirastros…</div>;
  return <DepthJourney authenticated intro={<DailyOverview key={user.id} user={user} />} />;
}
