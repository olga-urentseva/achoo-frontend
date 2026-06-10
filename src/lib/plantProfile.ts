/**
 * The user's plant profile — the plant ids they say they react to. Per the
 * privacy design this lives ONLY in the browser: the server never stores a
 * per-person plant list, just anonymous per-day reports. Persisting it here
 * means tomorrow's visit reopens with their plants already selected.
 */
const KEY = "achoo:plants";

export function loadPlants(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((p): p is string => typeof p === "string")
      : [];
  } catch {
    return [];
  }
}

export function savePlants(plants: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(plants));
}
