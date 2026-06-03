import { get } from "../lib/http";
import type { RegionStatus } from "../types";

let promise: Promise<RegionStatus[]> | undefined;

/**
 * Today's per-region status — one entry per region with reports today, with
 * coordinates for plotting on the map. Fetched once and memoized so the promise
 * is stable for the `use` hook; cleared on failure so a retry re-fetches.
 */
export default function getRegionStatus(): Promise<RegionStatus[]> {
  promise ??= get<RegionStatus[]>("/regions/status").catch((err) => {
    promise = undefined;
    throw err;
  });
  return promise;
}
