import { get } from "../lib/http";
import type { NearestPlace } from "../types";

/**
 * Nearest place to a coordinate (with the region it reports under). Called on
 * demand after a geolocation lookup, so it's a plain request — not a `use`
 * resource. The geolocation counterpart of searching for a city.
 */
export default async function getNearestPlace(
  lat: number,
  lng: number,
): Promise<NearestPlace> {
  return get<NearestPlace>(
    `/places/nearest?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`,
  );
}
