// Pixel box + geographic bounds of world-omg.svg, read from its header:
//   width/height="1009.673"/"665.963"
//   mapsvg:geoViewBox="-169.110266 83.600842 190.486279 -58.508473"
// These let project.ts map lat/lng onto the same coordinate space the SVG uses.
export const MAP_WIDTH = 1009.673;
export const MAP_HEIGHT = 665.963;

export const GEO = {
  lngLeft: -169.110266,
  lngRight: 190.486279,
  latTop: 83.600842,
  latBottom: -58.508473,
} as const;
