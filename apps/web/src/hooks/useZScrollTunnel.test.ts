import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { useZScrollTunnel } from './useZScrollTunnel';
const m = vi.hoisted(() => ({ refresh: vi.fn(), update: vi.fn(), kill: vi.fn(), normalize: vi.fn(), observer: null as null | { kill: () => void } }));
vi.mock('gsap', () => ({ gsap: { registerPlugin: vi.fn(), killTweensOf: vi.fn(), set: vi.fn(), utils: { toArray: (s: string) => [...document.querySelectorAll(s)] } } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { refresh: m.refresh, update: m.update, normalizeScroll: m.normalize } }));
let reduce: boolean; let listeners: Set<() => void>;
beforeEach(() => {
  vi.useFakeTimers(); vi.clearAllMocks(); m.observer = null; reduce = true; listeners = new Set();
  vi.stubGlobal('innerWidth', 390); vi.stubGlobal('innerHeight', 844); vi.stubGlobal('scrollTo', vi.fn());
  vi.stubGlobal('matchMedia', vi.fn(() => ({ get matches() { return reduce; }, addEventListener: (_: string, f: () => void) => listeners.add(f), removeEventListener: (_: string, f: () => void) => listeners.delete(f) })));
  m.normalize.mockImplementation((value?: unknown) => { if (value === false) { m.observer?.kill(); m.observer = null; } else if (value) m.observer = { kill: m.kill }; return m.observer ?? undefined; });
  document.body.innerHTML = '<section class="mira-section" id="hero"></section><section class="mira-section" id="shop"></section>';
});
afterEach(() => { cleanup(); document.body.innerHTML = ''; document.body.className = ''; vi.unstubAllGlobals(); vi.useRealTimers(); });
it('retains screen navigation instead of a list when reduced motion is requested', () => {
  const onInit = vi.fn(); renderHook(() => useZScrollTunnel({ enabled: true, enableMobile: true, desktopMinWidth: 1024, onInit }));
  expect(document.body.classList.contains('zscroll-enabled')).toBe(true);
  expect(onInit).toHaveBeenCalledWith(expect.objectContaining({ reducedMotion: true, isMobile: true }));
  expect(m.normalize).toHaveBeenCalledWith(expect.objectContaining({ type: 'touch', allowNestedScroll: true }));
});
it('honors explicitly disabled mobile navigation', () => {
  const onInit = vi.fn(); renderHook(() => useZScrollTunnel({ enabled: true, enableMobile: false, desktopMinWidth: 1024, onInit }));
  expect(document.body.classList.contains('zscroll-disabled')).toBe(true); expect(onInit).not.toHaveBeenCalled();
});
it('updates intensity without disabling navigation and releases its touch controller', () => {
  const onInit = vi.fn(); const { unmount } = renderHook(() => useZScrollTunnel({ enabled: true, enableMobile: true, desktopMinWidth: 1024, onInit }));
  act(() => { reduce = false; listeners.forEach(fn => fn()); vi.advanceTimersByTime(200); });
  expect(onInit).toHaveBeenLastCalledWith(expect.objectContaining({ reducedMotion: false }));
  expect(document.body.classList.contains('zscroll-enabled')).toBe(true);
  unmount(); expect(m.kill).toHaveBeenCalledTimes(2); expect(listeners.size).toBe(0);
});
