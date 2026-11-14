import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { PortalArtwork } from './PortalArtwork';

let play: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it('automatically switches blocked autoplay to an animated image without a play button', async () => {
  play.mockRejectedValue(new DOMException('Gesture required', 'NotAllowedError'));
  const { container } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(container.querySelector('[data-animation=image]')?.getAttribute('src')).toBe('/animations/taro.webp'));
  expect(container.querySelector('video')).toBeNull();
  expect(container.querySelector('button')).toBeNull();
  expect(container.querySelector('[data-animation=poster]')?.getAttribute('src')).toBe('/images/portals/tarot.webp');
});

it('retains the browser source fallback until both formats fail', async () => {
  const { container } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(play).toHaveBeenCalled());
  const sources = container.querySelectorAll('source');
  fireEvent.error(sources[0]);
  expect(container.querySelector('video')).not.toBeNull();
  fireEvent.error(sources[1]);
  await waitFor(() => expect(container.querySelector('[data-animation=image]')).not.toBeNull());
});

it('starts the requested artwork automatically even when reduced camera motion is preferred', async () => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  const { container } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(play).toHaveBeenCalled());
  expect(container.querySelector('video')?.autoplay).toBe(true);
  expect(container.querySelector('video')?.controls).toBe(false);
});

it('only loads a focused image fallback and returns to the poster outside the active range', async () => {
  play.mockRejectedValue(new DOMException('Gesture required', 'NotAllowedError'));
  const { container, rerender } = render(<PortalArtwork id="tarot" media="taro" eager active focused={false} />);
  await waitFor(() => expect(container.querySelector('video')).toBeNull());
  expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/portals/tarot.webp');
  rerender(<PortalArtwork id="tarot" media="taro" eager active focused />);
  expect(container.querySelector('[data-animation=image]')).not.toBeNull();
  rerender(<PortalArtwork id="tarot" media="taro" eager active={false} />);
  expect(container.querySelector('[data-animation=image]')).toBeNull();
});


it('uses an automatic image loop on iPhone without requesting video playback', async () => {
  vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15');
  const { container } = render(<PortalArtwork id="tarot" media="taro" eager active />);
  await waitFor(() => expect(container.querySelector('[data-animation=image]')).not.toBeNull());
  expect(play).not.toHaveBeenCalled();
  expect(container.querySelector('video')).toBeNull();
  expect(container.querySelector('button')).toBeNull();
});
