const REDIRECT_KEY = "community_redirect_url";
const PENDING_KEY = "pwa_pending_community_url";
const PENDING_TS_KEY = "pwa_pending_community_ts";
const PWA_INSTALLED_KEY = "pwa_was_installed";
const PENDING_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function saveRedirectUrl(url: string): void {
  localStorage.setItem(REDIRECT_KEY, url);
}

export function getAndClearRedirectUrl(): string | null {
  const url = localStorage.getItem(REDIRECT_KEY);
  if (url) {
    localStorage.removeItem(REDIRECT_KEY);
  }
  return url;
}

export function hasRedirectUrl(): boolean {
  return localStorage.getItem(REDIRECT_KEY) !== null;
}

export function clearRedirectUrl(): void {
  localStorage.removeItem(REDIRECT_KEY);
}

/** Mark that the PWA has been opened at least once (called from standalone mode) */
export function markPwaInstalled(): void {
  localStorage.setItem(PWA_INSTALLED_KEY, "1");
}

/** Check if the PWA was ever opened in standalone mode */
export function wasPwaInstalled(): boolean {
  return localStorage.getItem(PWA_INSTALLED_KEY) === "1";
}

/** Save a community URL for the PWA to pick up later */
export function savePendingCommunityUrl(url: string): void {
  localStorage.setItem(PENDING_KEY, url);
  localStorage.setItem(PENDING_TS_KEY, String(Date.now()));
}

/** Get and clear the pending community URL (returns null if expired) */
export function getPendingCommunityUrl(): string | null {
  const url = localStorage.getItem(PENDING_KEY);
  const ts = localStorage.getItem(PENDING_TS_KEY);
  if (!url || !ts) return null;

  const age = Date.now() - Number(ts);
  localStorage.removeItem(PENDING_KEY);
  localStorage.removeItem(PENDING_TS_KEY);

  if (age > PENDING_EXPIRY_MS) return null;
  return url;
}