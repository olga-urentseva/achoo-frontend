import { get } from "../lib/http";
import type { RegionFamily } from "../types";

/**
 * Per-family signal for one region today. Unlike `/meta` this is keyed by
 * region, so we cache one promise per region id (rather than a single module
 * promise) — still stable across renders for the `use` hook. Cleared on
 * failure so an ErrorBoundary retry re-fetches.
 */
const cache = new Map<number, Promise<RegionFamily[]>>();

export default function getRegionFamilies(
  regionId: number,
): Promise<RegionFamily[]> {
  let promise = cache.get(regionId);
  if (!promise) {
    promise = get<RegionFamily[]>(`/regions/${regionId}/families`).catch(
      (err) => {
        cache.delete(regionId);
        throw err;
      },
    );
    cache.set(regionId, promise);
  }
  return promise;
}

/**
 * Drop a region's cached signal so the next read re-fetches. Called after the
 * user submits a report, so the panel reflects their own fresh contribution
 * instead of the data it loaded before they reported.
 */
export function clearRegionFamilies(regionId: number): void {
  cache.delete(regionId);
}
