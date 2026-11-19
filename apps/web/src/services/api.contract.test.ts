import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';

describe('backend chat and social auth contracts', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ id: 'conversation', content: 'answer' }),
    }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it('creates a conversation and posts messages to its backend route', async () => {
    await api.startConversation('tarot', { cards: ['sun'] });
    await api.requestChatCompletion('Explain', { conversationId: 'conversation' });
    const calls = vi.mocked(fetch).mock.calls;
    expect(String(calls[0][0])).toMatch(/\/chat\/conversations$/);
    expect(JSON.parse(calls[0][1]?.body as string)).toEqual({
      service_type: 'tarot', context_data: { cards: ['sun'] },
    });
    expect(String(calls[1][0])).toMatch(/\/chat\/conversations\/conversation\/messages$/);
    expect(JSON.parse(calls[1][1]?.body as string)).toEqual({ message: 'Explain' });
  });

  it('sends the signed Telegram Mini App data to the verifier', async () => {
    await api.loginWithTelegram('signed-init-data');
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(options?.body as string)).toEqual({ init_data: 'signed-init-data' });
  });
});


describe('welcome response-loss recovery', () => {
  afterEach(() => vi.unstubAllGlobals());
  const location = { city: 'Дашогуз', country: 'Туркмения', latitude: 41.8363, longitude: 59.9666 };
  const saved = { next_step: 4, profile: { birth_time: '05:00:00', birth_location: { longitude: 59.9666, latitude: 41.8363, country: 'Туркмения', city: 'Дашогуз' } } };
  it('recovers a committed sky step through one GET without repeating POST', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, json: async () => saved }));
    expect(await api.saveWelcomeStep({ step: 'sky', birth_time: '05:00', birth_location: location })).toEqual(saved);
    expect(vi.mocked(fetch).mock.calls).toHaveLength(2);
    expect(vi.mocked(fetch).mock.calls[1][1]?.method).toBeUndefined();
  });
  it.each([true, false])('checks whether a lost completion was committed (%s)', async completed => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ completed }) });
    vi.stubGlobal('fetch', fetchMock);
    if (completed) await expect(api.completeWelcome()).resolves.toEqual({ completed });
    else await expect(api.completeWelcome()).rejects.toThrow();
    expect(fetchMock.mock.calls.map(([url]) => url.split('/').pop())).toEqual(['complete', 'state']);
  });
  it('does not claim success when the saved data do not match the attempted time', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, json: async () => saved }));
    await expect(api.saveWelcomeStep({ step: 'sky', birth_time: '17:00', birth_location: location })).rejects.toThrow();
  });
});

describe('API deadlines include response bodies', () => {
  beforeEach(() => { vi.useFakeTimers(); localStorage.clear(); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it.each([200, 503])('releases a pending JSON body after headers with HTTP %s', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: status === 200, status, statusText: 'Service unavailable', json: () => new Promise(() => {}) }));
    let settled = false;
    const result = api.request('/auth/onboarding/state', {}, false, 50).then(() => 'unexpected success', error => { settled = true; return error.message; });
    await vi.advanceTimersByTimeAsync(49);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(2);
    expect(await result).toMatch(/Таймаут/);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('preserves the session when a refresh cannot reach the server', async () => {
    localStorage.setItem('refreshToken', 'valid-test-refresh');
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'Expired token' }) })
      .mockResolvedValueOnce({ ok: false, status: 503 }));
    await expect(api.getCurrentUser()).rejects.toThrow(/временно недоступен/);
    expect(localStorage.getItem('refreshToken')).toBe('valid-test-refresh');
  });
  it('also bounds a refresh response with a body that never ends', async () => {
    localStorage.setItem('refreshToken', 'fixture-old-refresh');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'Invalid token' }) })
      .mockResolvedValueOnce({ ok: true, json: () => new Promise(() => {}) }));
    const result = api.request('/auth/onboarding/state', {}, true, 50).then(() => '', error => error.message);
    await vi.advanceTimersByTimeAsync(51);
    expect(await result).toMatch(/Таймаут/);
    await vi.advanceTimersByTimeAsync(15000);
    expect(vi.getTimerCount()).toBe(0);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });
});

describe('registration response recovery', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());
  const form = { email: 'fixture@example.com', password: 'Fixture8300!', full_name: 'Анна', preferredLanguage: 'ru', timezone: 'UTC' };
  it('authenticates once after a lost registration response, without another signup POST', async () => {
    localStorage.setItem('accessToken', 'deleted-account-token');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce({ ok: true, json: async () => ({ access_token: 'fixture-access', refresh_token: 'fixture-refresh', user: { id: 'fixture', full_name: 'Анна', email: form.email } }) }));
    const response = await api.register(form);
    expect(response.accessToken).toBe('fixture-access');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    const calls = vi.mocked(fetch).mock.calls;
    expect(String(calls[0][0])).toMatch(/\/auth\/register$/);
    expect(String(calls[1][0])).toMatch(/\/auth\/login$/);
    expect(JSON.parse(calls[1][1]?.body as string)).toEqual({ email: form.email, password: form.password });
    for (const call of calls) expect(call[1]?.headers).not.toHaveProperty('Authorization');
  });
  it('keeps the connection error when there was no committed account to recover', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({ detail: 'Incorrect email or password' }) }));
    await expect(api.register(form)).rejects.toThrow(/Сервер API недоступен/);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });
  it('does not turn an explicit duplicate-email error into a login attempt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ detail: 'Email already registered' }) }));
    await expect(api.register(form)).rejects.toThrow('Email already registered');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});
