import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import { LenisProvider } from './LenisProvider';
const m = vi.hoisted(() => ({ create: vi.fn(), destroy: vi.fn(), add: vi.fn(), remove: vi.fn() }));
vi.mock('@studio-freight/lenis', () => ({ default: vi.fn(function () { m.create(); return { destroy: m.destroy, on: vi.fn(), raf: vi.fn(), resize: vi.fn() }; }) }));
vi.mock('gsap', () => ({ gsap: { ticker: { add: m.add, remove: m.remove, lagSmoothing: vi.fn() } } }));
vi.mock('gsap/ScrollTrigger', () => ({ ScrollTrigger: { update: vi.fn() } }));
let touch: boolean, reduce: boolean;
let listeners: Map<string, Set<() => void>>;
beforeEach(() => {
  vi.clearAllMocks(); touch = false; reduce = false; listeners = new Map();
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    get matches() { return query.includes('coarse') ? touch : reduce; },
    addEventListener: (_: string, fn: () => void) => { if (!listeners.has(query)) listeners.set(query, new Set()); listeners.get(query)!.add(fn); },
    removeEventListener: (_: string, fn: () => void) => listeners.get(query)?.delete(fn),
  })));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it('does not attach desktop smoothing on top of mobile touch input', () => {
  touch = true; render(<LenisProvider>Content</LenisProvider>); expect(m.create).not.toHaveBeenCalled();
});
it('does not smooth scroll for reduced motion', () => {
  reduce = true; render(<LenisProvider>Content</LenisProvider>); expect(m.create).not.toHaveBeenCalled();
});
it('keeps desktop smoothing and cleans up when the input changes to touch', () => {
  const { unmount } = render(<LenisProvider>Content</LenisProvider>); expect(m.create).toHaveBeenCalledTimes(1);
  act(() => { touch = true; listeners.get('(pointer: coarse)')!.forEach(fn => fn()); });
  expect(m.destroy).toHaveBeenCalledTimes(1); expect(m.remove).toHaveBeenCalledTimes(1);
  expect(document.documentElement.classList.contains('lenis')).toBe(false);
  act(() => { touch = false; listeners.get('(pointer: coarse)')!.forEach(fn => fn()); });
  expect(m.create).toHaveBeenCalledTimes(2); unmount(); expect(m.destroy).toHaveBeenCalledTimes(2);
  expect([...listeners.values()].every(set => !set.size)).toBe(true);
});
