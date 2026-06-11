/**
 * Delete everything achoo keeps on this device — the plants you react to, your
 * reports, and your saved locations. They live only in the browser's local
 * storage and never reach a server, so removing these keys is the complete
 * "delete my data". Keyed by the shared `achoo:` prefix so any future store is
 * covered automatically.
 */
const PREFIX = "achoo:";

export function clearStoredData(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
  for (const key of keys) localStorage.removeItem(key);
}
