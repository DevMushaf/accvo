/** Minimum time the Accvo splash overlay stays visible. */
export const SPLASH_MIN_DURATION_MS = 2500;

/** Resolves after the minimum splash duration once the Accvo overlay is on screen. */
export function waitMinSplashDuration(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, SPLASH_MIN_DURATION_MS));
}
