import { MAP_WIDTH, MAP_HEIGHT, GEO } from "./mapMeta";

// The MapSVG art is a Mercator projection: longitude is linear across the box,
// latitude is linear in the Mercator-transformed value. We precompute the
// transformed top/bottom edges once, then every dot is a couple of arithmetic
// ops — nothing parses the SVG at runtime.
const mercY = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const yTop = mercY(GEO.latTop);
const yBottom = mercY(GEO.latBottom);

/** Project geographic coordinates to SVG x/y in the map's viewBox space. */
export function project(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - GEO.lngLeft) / (GEO.lngRight - GEO.lngLeft)) * MAP_WIDTH,
    y: ((yTop - mercY(lat)) / (yTop - yBottom)) * MAP_HEIGHT,
  };
}
