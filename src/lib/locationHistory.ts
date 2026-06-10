import type { Place } from "../types";

/**
 * The locations a person has chosen — kept ONLY in the browser, like their
 * plant profile. One person may report from several places (home, work,
 * travel), so we keep them all, deduped by placeId with the most recent last.
 * The UI restores just the latest so a returning visitor opens pre-filled.
 */
const KEY = "achoo:locations";

export function loadLocations(): Place[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (p): p is Place =>
        !!p &&
        typeof p === "object" &&
        typeof (p as Place).placeId === "number" &&
        !!(p as Place).region,
    );
  } catch {
    return [];
  }
}

/** The most recently chosen location, or null — what the page opens with. */
export function latestLocation(): Place | null {
  const all = loadLocations();
  return all.length ? all[all.length - 1]! : null;
}

/** Record a chosen location as the newest (moving an existing one to the end). */
export function saveLocation(place: Place): void {
  const all = loadLocations().filter((p) => p.placeId !== place.placeId);
  all.push(place);
  localStorage.setItem(KEY, JSON.stringify(all));
}
