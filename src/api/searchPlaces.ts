import { get } from "../lib/http";
import type { Place } from "../types";

/**
 * Interactive, per-keystroke query — called imperatively from local state, not
 * through `use`, so it must not be cached as a suspending resource.
 */
export default async function searchPlaces(q: string, limit = 8): Promise<Place[]> {
  return get<Place[]>(`/places/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}
