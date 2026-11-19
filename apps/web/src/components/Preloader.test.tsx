import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { Preloader } from './Preloader';
let settleImages: boolean;
beforeEach(() => {
  vi.useFakeTimers(); settleImages = true;
  vi.stubGlobal('Image', class {
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;
    set src(_: string) { if (settleImages) Promise.resolve().then(() => this.onload?.()); }
  });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('waits for the short entrance and completes exactly once without fake percentages', async () => {
  const done = vi.fn(); const { container } = render(<Preloader onComplete={done} />);
  expect(container.querySelector('[data-preloader-wheel]')).toHaveAttribute('src', '/images/preloader-zodiac-gold.webp');
  expect(container.querySelector('video')).toBeNull();
  expect(container.textContent).not.toMatch(/\d+%/);
  await act(async () => { await vi.advanceTimersByTimeAsync(1599); });
  expect(done).not.toHaveBeenCalled();
  await act(async () => { await vi.advanceTimersByTimeAsync(401); });
  expect(done).toHaveBeenCalledTimes(1);
  await act(async () => { await vi.advanceTimersByTimeAsync(7000); });
  expect(done).toHaveBeenCalledTimes(1);
});
it('releases the entrance even if an essential image never loads', async () => {
  settleImages = false; const done = vi.fn(); render(<Preloader onComplete={done} />);
  await act(async () => { await vi.advanceTimersByTimeAsync(6900); });
  expect(done).toHaveBeenCalledTimes(1);
});
it('does not complete a disposed entrance', async () => {
  const done = vi.fn(); const { unmount } = render(<Preloader onComplete={done} />); unmount();
  await act(async () => { await vi.advanceTimersByTimeAsync(8000); });
  expect(done).not.toHaveBeenCalled();
});
