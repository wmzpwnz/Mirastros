import { afterEach, expect, it, vi } from 'vitest';
import { api } from './api';

afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });
it('updates other modules account cache and removes an explicitly unknown birth time', async () => {
  localStorage.setItem('user', JSON.stringify({ id: 'account', fullName: 'Анна', birthTime: '12:00', birth_time: '12:00', subscriptionTier: 'premium' }));
  const state = { profile: { full_name: 'Александра', birth_date: '1990-01-01', birth_time: null, birth_location: null, zodiac_sign: 'capricorn' } };
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => state }));
  await api.saveWelcomeStep({ step: 'sky', birth_time: null, birth_location: null });
  const cached = JSON.parse(localStorage.getItem('user')!);
  expect(cached.fullName).toBe('Александра');
  expect(cached.birthDate).toBe('1990-01-01');
  expect(cached.birthTime).toBeUndefined();
  expect(cached.birth_time).toBeUndefined();
  expect(cached.subscriptionTier).toBe('premium');
});
