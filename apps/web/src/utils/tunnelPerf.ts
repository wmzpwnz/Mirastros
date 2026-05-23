interface LiteModeContext {
  width?: number;
  reducedMotion?: boolean;
  saveData?: boolean;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

export const isTunnelLiteMode = (ctx: LiteModeContext = {}): boolean => {
  if (typeof window === 'undefined') return false;

  const browserNavigator = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  const reducedMotion =
    ctx.reducedMotion ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData =
    ctx.saveData ?? (browserNavigator.connection?.saveData === true);
  const deviceMemory = ctx.deviceMemory ?? (browserNavigator.deviceMemory ?? 8);
  const hardwareConcurrency =
    ctx.hardwareConcurrency ?? (browserNavigator.hardwareConcurrency ?? 8);
  const width = ctx.width ?? window.innerWidth;

  return (
    reducedMotion ||
    saveData ||
    deviceMemory <= 2 ||
    hardwareConcurrency <= 2 ||
    width < 768
  );
};

export const getFlyingVideoBudget = (
  width: number,
  liteMode: boolean
): number => {
  if (width < 768) return 4;
  if (width < 1024) return 6;
  if (liteMode) return 8;

  return 19;
};
