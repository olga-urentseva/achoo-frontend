import { get } from "../lib/http";
import type { RegionStatus } from "../types";

/**
 * The major cities (region anchors) within `radiusKm` of a coordinate, each
 * with its status — including ones with no reports (reportCount 0, color null),
 * so the map can show them in grey. Interactive (re-run when the picked place
 * changes), so it's a plain request, not a memoized `use` resource.
 */
export default async function getNearbyRegions(
  lat: number,
  lng: number,
  radiusKm = 200,
  limit = 8,
): Promise<RegionStatus[]> {
  return get<RegionStatus[]>(
    `/regions/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
      lng,
    )}&radiusKm=${radiusKm}&limit=${limit}`,
  );
}
