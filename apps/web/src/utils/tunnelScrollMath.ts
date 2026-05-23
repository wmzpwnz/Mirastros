export const SCROLL_PER_SLIDE_MULTIPLIER = 2;
export const TUNNEL_OVERLAP = 1.3;

export const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export const getScrollPerSlide = (viewportHeight: number) =>
  viewportHeight * SCROLL_PER_SLIDE_MULTIPLIER;

export const getTotalHeight = (
  slideCount: number,
  viewportHeight: number,
  overlap = TUNNEL_OVERLAP
) => {
  if (slideCount <= 0) return viewportHeight;

  const scrollPerSlide = getScrollPerSlide(viewportHeight);
  const lastSlideEnd = (slideCount - 1 + overlap) * scrollPerSlide;

  return lastSlideEnd + viewportHeight;
};

export const getSectionRange = (
  index: number,
  scrollPerSlide: number,
  overlap = TUNNEL_OVERLAP
) => {
  const start = index * scrollPerSlide;
  const end = (index + overlap) * scrollPerSlide;

  return { start, end };
};

export const getSectionProgress = (
  scrollY: number,
  index: number,
  scrollPerSlide: number,
  overlap = TUNNEL_OVERLAP
) => {
  const { start, end } = getSectionRange(index, scrollPerSlide, overlap);
  const range = end - start;

  if (range <= 0) return 0;

  return clamp((scrollY - start) / range) * 100;
};
