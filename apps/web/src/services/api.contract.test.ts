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
