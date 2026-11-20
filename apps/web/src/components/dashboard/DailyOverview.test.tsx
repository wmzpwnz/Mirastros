import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DailyOverview } from './DailyOverview';
import { api } from '../../services/api';
import { dayInZone, daysUntilDate, personalDay } from './dailyOverviewModel';
import type { User } from '../../types';

vi.mock('../../services/api', () => ({ api: { request: vi.fn(), getUnifiedHistory: vi.fn() } }));
const user = { id: 'overview-test', fullName: 'Анна Иванова', timezone: 'Europe/Moscow', zodiacSign: 'aries', subscriptionTier: 'freemium' } as User;
const date = () => dayInZone(new Date(), user.timezone);
const lunar = () => ({ date: date(), phase: 'new_moon', phase_name: 'Новолуние', illumination: 0, zodiac_sign: 'aries' });
const forecast = () => ({ date: date(), prediction: 'Начните с главного. Не спешите с решениями.', advice: 'Выделите время на прогулку.' });

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  vi.mocked(api.request).mockImplementation(async path => (path.startsWith('/lunar') ? lunar() : forecast()) as any);
  vi.mocked(api.getUnifiedHistory).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 4, total_pages: 0 });
});
afterEach(() => vi.clearAllMocks());

describe('DailyOverview', () => {
  it('renders both resources with distinct focus/forecast and real zero illumination', async () => {
    render(<DailyOverview user={user} />);
    await screen.findByText('Начните с главного.');
    expect(screen.getByText('Не спешите с решениями.')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(2);
    expect(screen.getByText('Один шаг для себя')).toBeInTheDocument();
    expect(screen.getByText('Личная библиотека')).toBeInTheDocument();
    expect(screen.getByText('Недавние открытия')).toBeInTheDocument();
    expect(vi.mocked(api.request).mock.calls.every(([path]) => path.includes(`target_date=${date()}`))).toBe(true);
  });
  it('keeps lunar information available when the horoscope request fails', async () => {
    vi.mocked(api.request).mockImplementation(async path => {
      if (!path.startsWith('/lunar')) throw new Error('offline');
      return lunar() as any;
    });
    render(<DailyOverview user={user} />);
    await screen.findByText('Часть данных недоступна');
    expect(screen.getAllByText('0%')).toHaveLength(2);
    expect(screen.getByText('Луна сейчас')).toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
    expect(screen.queryByText('Скорпион')).not.toBeInTheDocument();
  });
  it('does not fetch an invented zodiac sign when the profile is incomplete', async () => {
    render(<DailyOverview user={{ ...user, zodiacSign: undefined }} />);
    expect(await screen.findAllByText('0%')).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /Заполнить профиль/ })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /Заполнить профиль/ })[0]).toHaveAttribute('href', '/profile');
    expect(vi.mocked(api.request).mock.calls.some(([path]) => path.startsWith('/horoscope'))).toBe(false);
  });
  it('rejects another day and lets the user retry without fake defaults', async () => {
    vi.mocked(api.request).mockImplementation(async path => (path.startsWith('/lunar') ? { ...lunar(), date: '2001-01-01' } : forecast()) as any);
    render(<DailyOverview user={user} />);
    await screen.findByText('Лунные данные недоступны');
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    vi.mocked(api.request).mockImplementation(async path => (path.startsWith('/lunar') ? lunar() : forecast()) as any);
    fireEvent.click(screen.getByRole('button', { name: 'Обновить сводку' }));
    expect(await screen.findAllByText('0%')).toHaveLength(2);
    expect(screen.queryByText('Лунные данные недоступны')).not.toBeInTheDocument();
  });
  it('ignores a late response from the previous account', async () => {
    let resolveOld!: (value: unknown) => void;
    let first = true;
    vi.mocked(api.request).mockImplementation(async path => {
      if (path.startsWith('/lunar')) return lunar() as any;
      if (first) { first = false; return new Promise(resolve => { resolveOld = resolve; }) as any; }
      return { ...forecast(), prediction: 'Новый прогноз. Только для текущего пользователя.' } as any;
    });
    const { rerender } = render(<DailyOverview user={user} />);
    await waitFor(() => expect(resolveOld).toBeDefined());
    rerender(<DailyOverview user={{ ...user, id: 'second-account', fullName: 'Мария' }} />);
    await screen.findByText('Новый прогноз.');
    await act(async () => resolveOld(forecast()));
    expect(screen.queryByText('Начните с главного.')).not.toBeInTheDocument();
  });
  it('renders personal daily numerology with an explainable formula and saves practice completion per day', async () => {
    const dayUser = { ...user, birthDate: '1990-04-13' } as User;
    const { unmount } = render(<DailyOverview user={dayUser} />);
    await screen.findByText('Начните с главного.');
    expect(screen.getByText('Личный день')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Как рассчитано?' }));
    expect(screen.getByText(/1 \+ 9 \+ 9 \+ 0 \+ 0 \+ 4 \+ 1 \+ 3/)).toBeInTheDocument();
    const practiceButton = screen.getByRole('button', { name: 'Отметить выполнение' });
    fireEvent.click(practiceButton);
    expect(screen.getByRole('button', { name: 'Отмечено на сегодня' })).toHaveAttribute('aria-pressed', 'true');
    unmount();
    render(<DailyOverview user={dayUser} />);
    expect(await screen.findByRole('button', { name: 'Отмечено на сегодня' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('shows recent saved readings returned by the unified history service', async () => {
    vi.mocked(api.getUnifiedHistory).mockResolvedValue({
      items: [{ id: 'read-1', type: 'tarot', title: 'Три карты на сегодня', question: null, preview: 'Символический расклад', created_at: new Date().toISOString(), is_favorite: false }],
      total: 1, page: 1, page_size: 4, total_pages: 1,
    });
    render(<DailyOverview user={user} />);
    expect(await screen.findByText('Три карты на сегодня')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Подробнее о дне/ }));
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('link', { name: /Три карты на сегодня/ })).toHaveAttribute('href', '/history/tarot/read-1');
  });
});

describe('personalDay', () => {
  it('combines birth path and the current date while preserving master numbers', () => {
    expect(personalDay('1990-04-13', '2026-11-19')).toMatchObject({ value: expect.any(Number), meaning: expect.any(String) });
    expect(personalDay('31.12.2000', '2026-11-19')).not.toBeNull();
    expect(personalDay('2001-02-29', '2026-11-19')).toBeNull();
  });
  it('calculates a calendar-day countdown without local-time shifts', () => {
    expect(daysUntilDate('2026-11-19', '2026-11-19')).toBe(0);
    expect(daysUntilDate('2026-11-24', '2026-11-19')).toBe(5);
    expect(daysUntilDate('2026-11-18', '2026-11-19')).toBeNull();
    expect(daysUntilDate('invalid', '2026-11-19')).toBeNull();
  });
});
