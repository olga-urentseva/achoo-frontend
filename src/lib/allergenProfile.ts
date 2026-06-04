/**
 * The user's allergen profile — the allergens they say they have. Per the
 * privacy design this lives ONLY in the browser: the server never stores a
 * per-person allergen list, just anonymous per-day reports. Persisting it here
 * means tomorrow's visit reopens with their allergens already selected.
 */
const KEY = "achoo:allergens";

export function loadAllergens(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((a): a is string => typeof a === "string")
      : [];
  } catch {
    return [];
  }
}

export function saveAllergens(allergens: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(allergens));
}
