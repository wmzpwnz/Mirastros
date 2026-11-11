const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const INTRO_SCREENS = 1.5;
export function sceneMetrics(width: number) {
  const mobile = width < 700;
  const perspective = mobile ? 900 : 1200;
  return { perspective, spacing: perspective * 1.6, offset: width * (mobile ? .19 : .245), farClip: perspective * 7, nearClip: perspective * .88 };
}
/** Distinct planes advance together through a perspective frustum. No 2D scale tween. */
export function portalFrame(index: number, screens: number, width: number) {
  const metrics = sceneMetrics(width);
  const z = (screens - index - INTRO_SCREENS) * metrics.spacing;
  const distanceFade = clamp((z + metrics.farClip) / (metrics.perspective * 4));
  const nearFade = clamp((metrics.nearClip - z) / (metrics.perspective * .18));
  const introFade = clamp(screens / .65);
  const opacity = distanceFade * nearFade * introFade;
  return { z, x: (index % 2 === 0 ? -1 : 1) * metrics.offset, opacity, visible: opacity > .01 && z < metrics.nearClip && z > -metrics.farClip };
}
export const activePortal = (screens: number, count: number) => Math.max(0, Math.min(count - 1, Math.round(screens - INTRO_SCREENS)));
export const heroOpacity = (screens: number) => clamp(1 - screens / .8);
export const endingOpacity = (screens: number, count: number) => clamp((screens - count - .95) / .5);
export const projectedScale = (z: number, perspective: number) => perspective / (perspective - z);
