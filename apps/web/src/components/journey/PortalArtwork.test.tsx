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
