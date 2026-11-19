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
  it('does not claim success when the saved data do not match the attempted time', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({ ok: true, json: async () => saved }));
    await expect(api.saveWelcomeStep({ step: 'sky', birth_time: '17:00', birth_location: location })).rejects.toThrow();
  });
});
