'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../auth.css';
import { Button as DSButton } from '@mirastros-universal/design-system';
import { Background3D } from '../../../components/Background3D';
import { api, type OnboardingInsight, type OnboardingInsightRequest } from '../../../services/api';

const Button = DSButton as any;

const STORAGE_KEY = 'mirastros:onboarding:payload';

function RevealText({ text, active }: { text: string; active: boolean }) {
  const [visibleText, setVisibleText] = useState(active ? '' : text);

  useEffect(() => {
    if (!active) {
      setVisibleText(text);
      return;
    }

    setVisibleText('');
    let frame = 0;
    const total = Math.max(28, Math.min(90, text.length));
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(1, frame / total);
      const count = Math.ceil(text.length * progress);
      setVisibleText(text.slice(0, count));
      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [active, text]);

  return <>{visibleText}</>;
}

function getStoredPayload(): OnboardingInsightRequest | null {
  if (typeof window === 'undefined') return null;

  const rawPayload = sessionStorage.getItem(STORAGE_KEY);
  if (rawPayload) {
    try {
      return JSON.parse(rawPayload) as OnboardingInsightRequest;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }

  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    const user = JSON.parse(rawUser);
    return {
      fullName: user.fullName || user.full_name || 'Искатель',
      birthDate: user.birthDate || user.birth_date,
      birthTime: user.birthTime || user.birth_time,
      birthLocation: user.birthLocation || user.birth_location,
      preferredLanguage: user.preferredLanguage || user.preferred_language || 'ru',
      timezone: user.timezone || 'UTC',
    };
  } catch {
    return null;
  }
}

function localFallback(payload: OnboardingInsightRequest): OnboardingInsight {
  const firstName = (payload.fullName || 'Искатель').trim().split(/\s+/)[0];
  const place = payload.birthLocation?.city || 'первая точка твоего неба';

  return {
    title: `${firstName}, Mirastros приветствует тебя`,
    subtitle: 'Первая карта пути открыта',
    message: `Mirastros видит, что ${firstName} вошел не случайно. В этом входе есть тихий знак начала: момент, когда личная история впервые касается большой карты.`,
    nameInsight: `Имя ${firstName} звучит как личная печать. В нем есть собственный ритм, через который человек выбирает, чему верить и куда идти.`,
    cosmicSignature: payload.birthDate
      ? `Дата рождения ${payload.birthDate} становится солнечной координатой пути. Время ${payload.birthTime || 'пока скрыто'} добавляет к этой карте свой оттенок.`
      : 'Дата рождения пока не раскрыта полностью, но Mirastros уже удерживает первый контур пути.',
    generationInsight: 'Твой поколенческий код связан с переходом между привычным и новым способом видеть мир.',
    birthPlaceInsight: `${place} стало местом первого вдоха и первой земной опорой. Оттуда началась линия, которую Mirastros будет раскрывать постепенно.`,
    archetype: 'Искатель',
    element: 'Огонь — импульс первого шага и способность входить в новое без долгих объяснений',
    personalThreshold: 'Сейчас важный порог — перестать ждать идеального знака и разрешить себе выбрать направление по внутреннему отклику.',
    hiddenStrength: 'Скрытая сила — внимательность к повторяющимся деталям. Ты видишь связи раньше, чем можешь объяснить их словами.',
    gentleShadow: 'Мягкая тень — иногда слишком долго проверять очевидное, чтобы не ошибиться в выборе.',
    pathSummary: `Mirastros соединяет имя ${firstName}, место ${place} и дату рождения в первую карту знакомства. Это не окончательный приговор, а тонкая настройка: где у тебя больше огня, где нужна опора и какой знак стоит заметить первым.`,
    details: [
      `Имя ${firstName} несет образ человека, который ищет собственный язык пути.`,
      'Дата рождения задает солнечный контур характера и способ начинать новые циклы.',
      `${place} хранит первую земную координату твоей карты.`,
      'Поколенческий фон говорит о способности жить между старым порядком и новым смыслом.',
      'Первый знак обычно приходит не громко, а через повторение одной и той же темы.',
    ],
    firstKey: 'Первый ключ: смотри на повторяющиеся знаки. Они часто приходят раньше ответа.',
    source: 'fallback',
  };
}

export default function OnboardingPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<OnboardingInsightRequest | null>(null);
  const [insight, setInsight] = useState<OnboardingInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const nextPayload = getStoredPayload();
    if (!nextPayload) {
      router.replace('/dashboard');
      return;
    }
    setPayload(nextPayload);
  }, [router]);

  useEffect(() => {
    if (!payload) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const result = await api.generateOnboardingInsight(payload);
        if (!cancelled) {
          setInsight(result);
        }
      } catch {
        if (!cancelled) {
          setInsight(localFallback(payload));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const blocks = useMemo(() => {
    if (!insight) return [];
    return [
      { label: 'Архетип', text: insight.archetype },
      { label: 'Стихия', text: insight.element },
      { label: 'Имя', text: insight.nameInsight },
      { label: 'Небо', text: insight.cosmicSignature },
      { label: 'Эпоха', text: insight.generationInsight },
      { label: 'Место', text: insight.birthPlaceInsight },
      { label: 'Порог', text: insight.personalThreshold },
      { label: 'Скрытая сила', text: insight.hiddenStrength },
      { label: 'Тень', text: insight.gentleShadow },
    ].filter((item) => item.text);
  }, [insight]);

  const enterDashboard = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    router.push('/dashboard');
  };

  return (
    <div className="auth-shell onboarding-shell">
      <Background3D />
      <div className="auth-bg-wrapper" aria-hidden="true">
        <img src="/backweb.png" alt="" className="auth-bg-img desktop-only" />
        <img src="/backmobile.png" alt="" className="auth-bg-img mobile-only" />
        <div className="auth-bg-overlay" />
        <div className="auth-bg-vignette" />
      </div>

      <main className="onboarding-stage" aria-busy={loading}>
        <div className="onboarding-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <section className="onboarding-panel">
          {loading && (
            <div className="onboarding-loading">
              <div className="onboarding-sigil" aria-hidden="true" />
              <p>Mirastros читает первую карту...</p>
            </div>
          )}

          {!loading && insight && (
            <>
              <div className="onboarding-kicker">Первое послание</div>
              <h1>
                <RevealText text={insight.title} active />
              </h1>
              <p className="onboarding-subtitle">{insight.subtitle}</p>
              <p className="onboarding-message">{insight.message}</p>

              {insight.pathSummary && (
                <div className="onboarding-summary">
                  <span>Личная настройка</span>
                  <p>{insight.pathSummary}</p>
                </div>
              )}

              <div className="onboarding-grid">
                {blocks.map((block, index) => (
                  <article key={block.label} className="onboarding-card" style={{ ['--delay' as any]: `${index * 90}ms` }}>
                    <span>{block.label}</span>
                    <p>{block.text}</p>
                  </article>
                ))}
              </div>

              {insight.details.length > 0 && (
                <div className="onboarding-details">
                  <span>Что Mirastros уже видит</span>
                  <ul>
                    {insight.details.map((detail, index) => (
                      <li key={`${index}-${detail}`}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="onboarding-key">
                <span>Ключ</span>
                <p>{insight.firstKey}</p>
              </div>

              <Button
                type="button"
                onClick={enterDashboard}
                className="onboarding-enter-btn"
              >
                Открыть мой путь
              </Button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
