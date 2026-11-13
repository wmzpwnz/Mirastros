import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { PortalArtwork } from './PortalArtwork';

let play: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new DOMException('Gesture required', 'NotAllowedError'));
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('retries a blocked autoplay on a user gesture and removes retry listeners after success', async () => {
  const { container } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(container.querySelector('video')?.dataset.playback).toBe('blocked'));
  play.mockResolvedValue(undefined);
  fireEvent.pointerDown(window);
  await waitFor(() => expect(container.querySelector('video')?.dataset.playback).toBe('loading'));
  expect(play).toHaveBeenCalledTimes(2);
  fireEvent.pointerDown(window);
  fireEvent.touchEnd(window);
  expect(play).toHaveBeenCalledTimes(2);
});

it('removes blocked retry listeners when a card leaves the active range', async () => {
  const { container, rerender } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(container.querySelector('video')?.dataset.playback).toBe('blocked'));
  rerender(<PortalArtwork id="tarot" media="taro" eager active={false} />);
  fireEvent.pointerDown(window);
  fireEvent.touchEnd(window);
  fireEvent.keyDown(window, { key: 'ArrowDown' });
  expect(play).toHaveBeenCalledTimes(1);
  expect(container.querySelector('video')).toBeNull();
  expect(container.querySelector('img')).not.toBeNull();
});


it('offers explicit playback with reduced motion without starting automatically', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  play.mockResolvedValue(undefined);
  const { container, getByRole } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  expect(play).not.toHaveBeenCalled();
  expect(container.querySelector('video')?.autoplay).toBe(false);
  fireEvent.click(getByRole('button', { name: 'Воспроизвести анимацию' }));
  await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
});

it('keeps a direct video link and lets the user retry a terminal loading error', async () => {
  const load = vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  const { container, getByRole } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(container.querySelector('video')?.dataset.playback).toBe('blocked'));
  const video = container.querySelector('video')!;
  Object.defineProperty(video, 'error', { configurable: true, value: { code: 2, message: 'Fixture network failure' } });
  fireEvent.error(video);
  expect(getByRole('link', { name: /Открыть видео отдельно/ }).getAttribute('href')).toBe('/taro.mp4');
  play.mockResolvedValue(undefined);
  fireEvent.click(getByRole('button', { name: 'Повторить загрузку анимации' }));
  expect(load).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(play).toHaveBeenCalledTimes(2));
});
