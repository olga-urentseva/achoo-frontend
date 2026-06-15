export type PlantType = "tree" | "grass" | "weed";

/** A pickable plant. Each has exactly one home `family` (the aggregation unit),
 * and may sit behind a friendly `displayGroup` chip (e.g. all grasses). */
export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  type: PlantType;
  family: string;
  /** Headline chip shown up front; the rest live behind an "other" expander. */
  featured: boolean;
  /** If set, the plant hides behind its group's chip instead of its own. */
  displayGroup: string | null;
}

/** A friendly umbrella chip a set of plants hides behind (grasses, cypress). */
export interface DisplayGroup {
  id: string;
  label: string;
}

/** An aggregation family — id → label, for "Results matching the plants you picked in (city) <family>". */
export interface Family {
  id: string;
  label: string;
}

export interface Meta {
  plants: Plant[];
  displayGroups: DisplayGroup[];
  families: Family[];
  severity: { min: number; max: number };
  colors: string[];
}

/** One shared-protein group from `GET /meta/cross-reactivity`. Plants carrying
 * the same protein tend to cross-react; panallergens are broad, usually weak. */
export interface CrossReactivityGroup {
  protein: string;
  name: string;
  kind: "major" | "panallergen";
  strength: "strong" | "moderate" | "weak";
  plants: string[];
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
  /** Place coordinates, so the map can zoom to a pick before any report. */
  lat: number;
  lng: number;
  region: PlaceRegion;
}

/** What `POST /reports` accepts: one severity plus the plants the user reacts
 * to (mapped to families and discarded server-side), or `unknown: true`. */
export interface CreateSubmissionInput {
  placeId: number;
  severity: number;
  plants: string[];
  unknown?: boolean;
}

/** The stored submission `POST /reports` returns — anonymous, no plant fields. */
export interface Submission {
  id: number;
  regionId: number;
  severity: number;
  unknown: boolean;
  reportedOn: string;
  createdAt: string;
}

/** Status color buckets returned by the API (green < yellow < red < purple). */
export type SeverityColor = "green" | "yellow" | "red" | "purple";

/** Per-family signal for one region on a day, from `GET /regions/:id/families`.
 * Families below the suppression floor (3 reports) are omitted by the server. */
export interface RegionFamily {
  family: string;
  label: string;
  avgSeverity: number;
  reportCount: number;
  color: SeverityColor;
}

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
