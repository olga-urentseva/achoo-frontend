/**
 * Client-side once-per-day throttle. Per the privacy design, the server stores
 * nothing identifying — so "one report per day per region" is enforced here,
 * keyed by region in localStorage. Cleared data just lets someone report again;
 * that's a data-quality nuisance, not a correctness or legal problem.
 */
const KEY = "achoo:reports";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, string>;
  } catch {
    return {};
  }
}

export function hasReportedToday(regionId: number): boolean {
  return load()[String(regionId)] === today();
}

/** Reported in *any* region today — earns the global view (other cities, their
 *  general numbers), even in regions the user hasn't personally reported in. */
export function hasReportedAnythingToday(): boolean {
  const t = today();
  return Object.values(load()).some((d) => d === t);
}

export function markReported(regionId: number): void {
  const data = load();
  data[String(regionId)] = today();
  localStorage.setItem(KEY, JSON.stringify(data));
}
