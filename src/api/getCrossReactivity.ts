import { get } from "../lib/http";
import type { AllergenCategory, CrossReactivityGroup } from "../types";

// One stable promise per distinct category set, so `use` never re-suspends and
// each set is fetched at most once. Cleared on failure so a retry re-fetches.
const cache = new Map<string, Promise<CrossReactivityGroup[]>>();

/**
 * Fetches the shared-protein map for the given categories (default: plants
 * only). Returns the same promise for the same category set, so it's stable
 * across renders and safe to read with the `use` hook. No personal data — it's
 * paired with the user's local picks on-device.
 */
export default function getCrossReactivity(
  categories: AllergenCategory[] = ["plant"],
): Promise<CrossReactivityGroup[]> {
  // Sorted so ["plant","food"] and ["food","plant"] share one cache entry.
  const key = [...categories].sort().join(",");
  let promise = cache.get(key);
  if (!promise) {
    promise = get<CrossReactivityGroup[]>(
      `/meta/cross-reactivity?categories=${encodeURIComponent(key)}`,
    ).catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, promise);
  }
  return promise;
}
