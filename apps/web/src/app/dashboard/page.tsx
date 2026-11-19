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
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let mounted = true;
    setFailed(false);
    api.getCurrentUser().then(data => {
      if (mounted) setUser(data);
    }).catch(error => {
      if (!mounted) return;
      if (/401|not authenticated|требуется авторизация/i.test(error.message)) router.replace('/auth/login');
      else setFailed(true);
    });
    return () => { mounted = false; };
  }, [router, attempt]);
  if (!user) return <main className="min-h-screen grid place-content-center gap-4 text-center text-purple-100" role="status">
    <p>{failed ? 'Не удалось загрузить ваш профиль.' : 'Открываем ваш день…'}</p>
    {failed && <button className="mira-action mira-action-primary" onClick={() => setAttempt(value => value + 1)}>Попробовать снова</button>}
  </main>;
  return <DepthJourney authenticated intro={openDirections => <DailyOverview key={user.id} user={user} openDirections={openDirections} />} />;
}
