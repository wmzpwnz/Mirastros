'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Section, Container, Stack, Button, Spinner } from '@mirastros-universal/design-system';
import { api } from '../../../../services/api';
import type { ConsultationDetailResponse } from '../../../../types';

const SERVICE_LABELS: Record<string, string> = {
  tarot: 'Таро',
  numerology: 'Нумерология',
  iching: 'И-Цзин',
  dreams: 'Сны',
  lenormand: 'Ленорман',
  synastry: 'Синастрия',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const type = params.type as string;
  const id = params.id as string;
  const [detail, setDetail] = useState<ConsultationDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' && (localStorage.getItem('accessToken') || localStorage.getItem('token'));
    if (!token) {
      router.replace('/auth/login?redirect=/history');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!type || !id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await api.getConsultationDetail(type, id);
        if (!cancelled) setDetail(d);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Не удалось загрузить';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [type, id]);

  const handleDelete = async () => {
    if (!confirm('Удалить эту консультацию?')) return;
    setDeleting(true);
    try {
      await api.deleteConsultation(type, id);
      router.push('/history');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось удалить';
      setError(msg);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen py-12 px-4">
        <Container size="md">
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-red-200 text-center">
            <p>{error || 'Консультация не найдена'}</p>
            <Link href="/history" className="inline-block mt-4 text-mirastros-gold hover:underline">
              Вернуться к истории
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const label = SERVICE_LABELS[detail.type] || detail.type;

  return (
    <div className="min-h-screen py-12 px-4">
      <Container size="md">
        <Stack direction="column" gap="lg">
          <Link href="/history" className="text-mirastros-gold hover:text-mirastros-gold/80 transition text-sm">
            ← Назад к истории
          </Link>
          <Section backgroundColor="transparent" padding="md">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="text-sm text-gray-400">{label}</span>
                <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-white mt-1">
                  {detail.title}
                </h1>
                <p className="text-gray-400 text-sm mt-2">{formatDate(detail.created_at)}</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                disabled={deleting}
                onClick={handleDelete}
                aria-label="Удалить консультацию"
              >
                {deleting ? 'Удаление…' : 'Удалить'}
              </Button>
            </div>
            {detail.question && (
              <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm text-gray-400 mb-1">Вопрос</p>
                <p className="text-white">{detail.question}</p>
              </div>
            )}
            <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-2">Результат</p>
              <div className="text-white whitespace-pre-wrap leading-relaxed">
                {detail.result}
              </div>
            </div>
          </Section>
        </Stack>
      </Container>
    </div>
  );
}
