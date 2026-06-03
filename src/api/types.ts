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
