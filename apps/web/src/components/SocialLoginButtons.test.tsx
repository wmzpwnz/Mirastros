import React from 'react';
import { cleanup, render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SocialLoginButtons } from './SocialLoginButtons';
const mocks = vi.hoisted(() => ({ telegram: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('../services/api', () => ({ api: { loginWithTelegram: mocks.telegram } }));
beforeEach(() => { vi.stubEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID', ''); delete (window as any).Telegram; window.history.replaceState(null, '', '/'); mocks.telegram.mockReset(); });
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); vi.unstubAllEnvs(); delete (window as any).Telegram; });
it('shows no decorative providers or divider on a browser with no configured login provider', () => {
  const { container } = render(<SocialLoginButtons />);
  expect(container).toBeEmptyDOMElement(); expect(document.querySelector('script[src*=telegram]')).toBeNull();
});
it('passes signed host data to the verifier and continues only after successful Telegram auth', async () => {
  (window as any).Telegram = { WebApp: { initData: 'signed-fixture' } };
  mocks.telegram.mockResolvedValue({ user: { id: 'fixture-user' } }); const success = vi.fn();
  render(<SocialLoginButtons onSuccess={success} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Войти через Telegram' }));
  await waitFor(() => expect(success).toHaveBeenCalledWith({ id: 'fixture-user' }));
  expect(mocks.telegram).toHaveBeenCalledWith('signed-fixture');
});

it('verifies the Telegram launch payload even when the host SDK is not loaded', async () => {
  window.history.replaceState(null, '', '/#tgWebAppData=' + encodeURIComponent('query_id=fixture&hash=signed-fixture'));
  mocks.telegram.mockResolvedValue({ user: { id: 'fixture-user' } });
  render(<SocialLoginButtons onSuccess={vi.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Войти через Telegram' }));
  await waitFor(() => expect(mocks.telegram).toHaveBeenCalledWith('query_id=fixture&hash=signed-fixture'));
});
