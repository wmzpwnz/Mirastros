'use client';

import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { ConsultationHistoryItem } from '../../types';
import type { DailyForecast, DailyMoon } from './dailyOverviewModel';

export type ResourceState = 'loading' | 'ready' | 'error' | 'missing';

export function useDailyOverview(userId: string, sign: string | undefined, date: string, timeZone: string) {
  const resourceKey = `${userId}:${sign || ''}:${date}:${timeZone}`;
  const [snapshotKey, setSnapshotKey] = useState(resourceKey);
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [moon, setMoon] = useState<DailyMoon | null>(null);
  const [forecastState, setForecastState] = useState<ResourceState>('loading');
  const [moonState, setMoonState] = useState<ResourceState>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [recentItems, setRecentItems] = useState<ConsultationHistoryItem[]>([]);
  const [historyState, setHistoryState] = useState<ResourceState>('loading');

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    let lastAttempt = 0;
    setSnapshotKey(resourceKey);
    setForecast(null);
    setMoon(null);
    setUpdatedAt(null);
    const load = async (force = false) => {
      if (inFlight || (!force && Date.now() - lastAttempt < 60_000)) return;
      inFlight = true;
      lastAttempt = Date.now();
      setForecastState(sign ? 'loading' : 'missing');
      setMoonState('loading');
      const query = `?target_date=${encodeURIComponent(date)}`;
      const tasks: Promise<void>[] = [];
      if (sign) tasks.push(
        api.request<DailyForecast>(`/horoscope/daily/${encodeURIComponent(sign)}${query}`)
          .then(data => {
            if (data.date?.slice(0, 10) !== date || !(data.plain_text || data.prediction)?.trim()) {
              throw new Error('Daily forecast is missing or belongs to another date');
            }
            if (!cancelled) { setForecast(data); setForecastState('ready'); }
          })
          .catch(() => {
            if (!cancelled) { setForecast(null); setForecastState('error'); }
          })
      );
      tasks.push(
        api.request<DailyMoon>(`/lunar/current${query}`)
          .then(data => {
            if (data.date?.slice(0, 10) !== date || !data.phase || !data.phase_name) {
              throw new Error('Lunar data is missing or belongs to another date');
            }
            if (!cancelled) { setMoon(data); setMoonState('ready'); }
          })
          .catch(() => {
            if (!cancelled) { setMoon(null); setMoonState('error'); }
          })
      );
      await Promise.all(tasks);
      if (!cancelled) setUpdatedAt(new Date());
      inFlight = false;
    };
    void load(true);
    const onVisible = () => { if (document.visibilityState === 'visible') void load(); };
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(onVisible, 15 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [userId, sign, date, timeZone, resourceKey, attempt]);

  useEffect(() => {
    let cancelled = false;
    setHistoryState('loading');
    api.getUnifiedHistory({ page: 1, pageSize: 4 })
      .then(result => {
        if (cancelled) return;
        setRecentItems(result.items || []);
        setHistoryState('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setRecentItems([]);
          setHistoryState('error');
        }
      });
    return () => { cancelled = true; };
  }, [userId, date, attempt]);

  const current = snapshotKey === resourceKey;
  return {
    forecast: current ? forecast : null,
    moon: current ? moon : null,
    forecastState: current ? forecastState : sign ? 'loading' as const : 'missing' as const,
    moonState: current ? moonState : 'loading' as const,
    updatedAt: current ? updatedAt : null,
    recentItems,
    historyState,
    refresh: () => setAttempt(n => n + 1),
  };
}
