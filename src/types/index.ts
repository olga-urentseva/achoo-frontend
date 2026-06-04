export interface Meta {
  allergens: string[];
  severity: { min: number; max: number };
  colors: string[];
}

export interface PlaceRegion {
  id: number;
  name: string;
  admin1: string;
  country: string;
}

export interface Place {
  placeId: number;
  name: string;
  admin1: string;
  country: string;
  population: number;
  region: PlaceRegion;
}

export interface Report {
  id: number;
  regionId: number;
  allergen: string;
  severity: number;
  reportedOn: string;
  createdAt: string;
}

export interface CreateReportInput {
  placeId: number;
  allergen: string;
  severity: number;
}

/** Status color buckets returned by the API (green < yellow < red < purple). */
export type SeverityColor = "green" | "yellow" | "red" | "purple";

/** One region with reports today, from `GET /regions/status` — a map dot. */
export interface RegionStatus {
  regionId: number;
  name: string;
  admin1: string;
  country: string;
  lat: number;
  lng: number;
  date: string;
  reportCount: number;
  avgSeverity: number;
  color: SeverityColor | null;
}

/** The place nearest to some coordinates, from `GET /places/nearest`. */
export interface NearestPlace extends Place {
  /** Great-circle distance from the queried point to the place, km. */
  distanceKm: number;
}
