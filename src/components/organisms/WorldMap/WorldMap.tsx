import { useCallback, useEffect, useRef, useState } from "react";
import { project } from "./project";
import { MAP_WIDTH, MAP_HEIGHT } from "./mapMeta";
import type { RegionStatus } from "../../../types";
import styles from "./WorldMap.module.css";

/** The picked place to centre and pin on the map. */
export type MapFocus = {
  lat: number;
  lng: number;
  /** City name, shown beside the pin. */
  name: string;
  /** Region the place reports under — used to colour the pin by that region's
   *  severity and to drop the duplicate region dot underneath it. */
  regionId: number;
};

type Props = {
  regions: RegionStatus[];
  /** The picked place to zoom in on, or null for world view. */
  focus?: MapFocus | null;
  /** Major cities (region anchors) near the focus — reported AND unreported.
   *  These replace the global dots once a place is picked. */
  nearby?: RegionStatus[];
  /** Other cities are earned: their dots only show once the user has reported
   *  today. Until then the map shows just the user's own pin. */
  showRegions?: boolean;
  /** Give-to-get gate: a muted pin plus the report prompt, until the user has
   *  reported anything today (or peeks). */
  gated?: boolean;
};

/** Zoom factor when a place is picked. The world spans ~360° across the map, so
 *  ZOOM=40 shows ~9° of longitude — comfortably a ~200 km radius around the
 *  major city at mid-latitudes. The base art is vector, so it stays crisp. */
const ZOOM = 40;

export function WorldMap({
  regions,
  focus,
  nearby,
  showRegions = true,
  gated = false,
}: Props) {
  const totalReports = regions.reduce((sum, r) => sum + r.reportCount, 0);

  const zoomed = Boolean(focus);

  // The focus's own region — gives the pin its severity colour and the major
  // city's coordinates to centre on. Prefer the nearby payload (always includes
  // it); fall back to the global list while nearby is still loading.
  const focusRegion = focus
    ? (nearby?.find((r) => r.regionId === focus.regionId) ??
      regions.find((r) => r.regionId === focus.regionId))
    : undefined;

  // Centre on the major city (the region anchor) when we have it; otherwise fall
  // back to the picked place's own coordinates (close by — same agglomeration).
  const centerLat = focusRegion ? focusRegion.lat : focus?.lat;
  const centerLng = focusRegion ? focusRegion.lng : focus?.lng;
  const focusPoint =
    centerLat != null && centerLng != null
      ? project(centerLat, centerLng)
      : null;

  // Markers live inside the zooming frame, so without this they'd balloon ZOOM×.
  // Counter-scaling by ~2/ZOOM keeps them a constant (slightly emphasised when
  // zoomed) on-screen size at any zoom.
  const markerScale = zoomed ? 2 / ZOOM : 1;

  // Which region dots to draw: the nearby major cities when zoomed in (minus the
  // focused region — its own pin stands in for it); the global reports otherwise.
  const plotted = focus
    ? (nearby ?? []).filter((r) => r.regionId !== focus.regionId)
    : regions;

  // Centre the major city in the frame: translate it to the middle, then scale.
  // (transform-origin scaling alone keeps the point at its world-map position,
  //  which pushes an off-centre city like Vancouver into a corner.)
  let frameTransform: string | undefined;
  if (focusPoint) {
    const fx = focusPoint.x / MAP_WIDTH;
    const fy = focusPoint.y / MAP_HEIGHT;
    const tx = (0.5 - fx * ZOOM) * 100;
    const ty = (0.5 - fy * ZOOM) * 100;
    frameTransform = `translate(${tx}%, ${ty}%) scale(${ZOOM})`;
  }

  // Manual zoom isn't built yet. Catch the gestures people reach for — pinch /
  // ctrl+scroll, two-finger touch, double-click — and flash a friendly note
  // instead of letting the browser zoom the page.
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoomHint, setZoomHint] = useState(false);
  const hideTimer = useRef<number>(undefined);
  const flashZoomHint = useCallback(() => {
    setZoomHint(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setZoomHint(false), 2500);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault(); // would otherwise zoom the whole page
        flashZoomHint();
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        flashZoomHint();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [flashZoomHint]);

  return (
    <div className={styles.worldmap}>
      <div
        className={styles.stage}
        ref={stageRef}
        onDoubleClick={flashZoomHint}
      >
        <div
          className={styles.frame}
          style={{
            aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
            transformOrigin: "0 0",
            transform: frameTransform,
          }}
        >
          {/* The land masses — the world SVG used as a mask so --land colours
              it (an <img> couldn't be recoloured). Box matches the viewBox. */}
          <div className={styles.base} />

          {/* Dot overlay sharing the SVG's coordinate space, so dots line up. */}
          <svg
            className={styles.overlay}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="World map of allergy reports, last 3 days"
          >
            {showRegions &&
              plotted.map((r) => {
                const { x, y } = project(r.lat, r.lng);
                const reported = r.reportCount > 0;
                const label = reported
                  ? `${r.name}, ${r.country} — ${r.reportCount} report${
                      r.reportCount === 1 ? "" : "s"
                    }`
                  : `${r.name}, ${r.country} — no reports yet`;
                return (
                  <g
                    key={r.regionId}
                    className={styles.pin}
                    // Reported → severity colour (--sev); unreported → grey (the
                    // --sev fallback in CSS), and no pulse.
                    data-sev={reported ? Math.round(r.avgSeverity) : undefined}
                    transform={`translate(${x} ${y}) scale(${markerScale})`}
                  >
                    <title>{label}</title>
                    {reported && <circle className={styles.pulse} r={5} />}
                    <circle className={styles.dot} r={4} />
                    {zoomed && (
                      <text className={styles.cityLabel} x={8} y={3.5}>
                        {r.name}
                      </text>
                    )}
                  </g>
                );
              })}

            {/* The picked place's own pin. Muted while gated; otherwise it takes
              its region's severity colour (via data-sev → --sev), so a city you
              just reported matches the scale instead of a flat accent dot. Drawn
              last so it sits on top of any nearby region dot. */}
            {focus && focusPoint && (
              <g
                className={styles.focus}
                data-gated={gated}
                data-sev={
                  focusRegion ? Math.round(focusRegion.avgSeverity) : undefined
                }
                transform={`translate(${focusPoint.x} ${focusPoint.y}) scale(${markerScale})`}
              >
                <circle className={styles.focusDot} r={4} />
                <text className={styles.focusLabel} x={8} y={3.5}>
                  {focus.name}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Give-to-get prompt, kept outside the zooming frame so it stays put and
          readable. Shown whenever gated — even before a city is picked. */}
        {gated && (
          <p className={styles.prompt} role="status">
            Report today to see what others reported.
          </p>
        )}

        {/* Flashed when someone tries to zoom (not built yet). */}
        {zoomHint && (
          <p className={styles.zoomHint} role="status">
            Sorry, zooming the map isn't working yet.
          </p>
        )}
      </div>

      <div className={styles.caption}>
        {regions.length === 0 ? (
          "No reports yet in the last 3 days"
        ) : (
          <>
            <span className={styles.count}>{totalReports}</span> report
            {totalReports === 1 ? "" : "s"} across {regions.length} region
            {regions.length === 1 ? "" : "s"} in the last 3 days
          </>
        )}
      </div>
    </div>
  );
}
