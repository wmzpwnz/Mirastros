'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Section, Container, Stack, Button } from '@mirastros-universal/design-system';
import { api } from '../../services/api';
import { HistoryStats } from '../../components/history/HistoryStats';
import { HistoryFilters } from '../../components/history/HistoryFilters';
import { HistoryList } from '../../components/history/HistoryList';
import type { ConsultationHistoryItem, HistoryStatsResponse } from '../../types';

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<ConsultationHistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [serviceType, setServiceType] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUnifiedHistory({
        page,
        pageSize: 20,
        serviceType: serviceType || undefined,
      });
      setItems(res.items);
      setTotalPages(res.total_pages);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить историю';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, serviceType]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        const s = await api.getHistoryStats();
        if (!cancelled) setStats(s);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (type: string, id: string) => {
    const key = `${type}:${id}`;
    setDeletingId(key);
    try {
      await api.deleteConsultation(type, id);
      await loadHistory();
      if (stats) {
        const s = await api.getHistoryStats();
        setStats(s);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось удалить';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  // Redirect if not authenticated (client-side check)
  useEffect(() => {
    const token = typeof window !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'));
    if (!token) {
      router.replace('/auth/login?redirect=/history');
    }
  }, [router]);

  return (
    <div className="min-h-screen py-12 px-4">
      <Container size="lg">
        <Stack direction="column" gap="xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link href="/dashboard" className="text-mirastros-gold hover:text-mirastros-gold/80 transition text-sm">
              ← Назад к панели
            </Link>
          </div>
          <Section backgroundColor="transparent" padding="md">
            <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-white mb-2">
              История консультаций
            </h1>
            <p className="text-gray-400 mb-6">
              Все ваши сеансы в одном месте
            </p>
            <HistoryStats stats={stats} loading={statsLoading} />
          </Section>
          <Section backgroundColor="transparent" padding="md">
            <HistoryFilters
              serviceType={serviceType}
              onServiceTypeChange={(v) => {
                setServiceType(v);
                setPage(1);
              }}
            />
          </Section>
          <Section backgroundColor="transparent" padding="md">
            <HistoryList
              items={items}
              loading={loading}
              error={error}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          </Section>
        </Stack>
      </Container>
    </div>
  );
}
