import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DailyOverview } from './DailyOverview';
import { api } from '../../services/api';
import { dayInZone } from './dailyOverviewModel';
import type { User } from '../../types';

vi.mock('../../services/api', () => ({ api: { request: vi.fn() } }));
const user = { id: 'overview-test', fullName: 'Анна Иванова', timezone: 'Europe/Moscow', zodiacSign: 'aries', subscriptionTier: 'freemium' } as User;
const date = () => dayInZone(new Date(), user.timezone);
const lunar = () => ({ date: date(), phase: 'new_moon', phase_name: 'Новолуние', illumination: 0, zodiac_sign: 'aries' });
const forecast = () => ({ date: date(), prediction: 'Начните с главного. Не спешите с решениями.', advice: 'Выделите время на прогулку.' });

beforeEach(() => {
  vi.mocked(api.request).mockImplementation(async path => (path.startsWith('/lunar') ? lunar() : forecast()) as any);
});
afterEach(() => vi.clearAllMocks());

describe('DailyOverview', () => {
  it('renders both resources with distinct focus/forecast and real zero illumination', async () => {
    render(<DailyOverview user={user} />);
    await screen.findByText('Начните с главного.');
    expect(screen.getByText('Не спешите с решениями.')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Один шаг для себя')).toBeInTheDocument();
    expect(vi.mocked(api.request).mock.calls.every(([path]) => path.includes(`target_date=${date()}`))).toBe(true);
  });
  it('keeps lunar information available when the horoscope request fails', async () => {
    vi.mocked(api.request).mockImplementation(async path => {
      if (!path.startsWith('/lunar')) throw new Error('offline');
      return lunar() as any;
    });
    render(<DailyOverview user={user} />);
    await screen.findByText('Часть данных недоступна');
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Луна сейчас')).toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument();
    expect(screen.queryByText('Скорпион')).not.toBeInTheDocument();
  });
  it('does not fetch an invented zodiac sign when the profile is incomplete', async () => {
    render(<DailyOverview user={{ ...user, zodiacSign: undefined }} />);
    await screen.findByText('0%');
    expect(screen.getByRole('link', { name: /Заполнить профиль/ })).toHaveAttribute('href', '/profile');
    expect(vi.mocked(api.request).mock.calls.some(([path]) => path.startsWith('/horoscope'))).toBe(false);
  });
  it('rejects another day and lets the user retry without fake defaults', async () => {
    vi.mocked(api.request).mockImplementation(async path => (path.startsWith('/lunar') ? { ...lunar(), date: '2001-01-01' } : forecast()) as any);
    render(<DailyOverview user={user} />);
    await screen.findByText('Лунные данные недоступны');
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    vi.mocked(api.request).mockImplementation(async path => (path.startsWith('/lunar') ? lunar() : forecast()) as any);
    fireEvent.click(screen.getByRole('button', { name: 'Обновить сводку' }));
    await screen.findByText('0%');
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
});
