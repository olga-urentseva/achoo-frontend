import worldUrl from "./world-omg.svg";
import { project } from "./project";
import { MAP_WIDTH, MAP_HEIGHT } from "./mapMeta";
import type { RegionStatus } from "../../../types";
import styles from "./WorldMap.module.css";

type Props = {
  regions: RegionStatus[];
};

export function WorldMap({ regions }: Props) {
  const totalReports = regions.reduce((sum, r) => sum + r.reportCount, 0);

  return (
    <div className={styles.worldmap}>
      <div
        className={styles.frame}
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
      >
        {/* The world map, used as-is — its own coordinate box. */}
        <img className={styles.base} src={worldUrl} alt="" />

        {/* Dot overlay sharing the SVG's coordinate space, so dots line up. */}
        <svg
          className={styles.overlay}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="World map of allergy reports, last 3 days"
        >
          {regions.map((r) => {
            const { x, y } = project(r.lat, r.lng);
            const label = `${r.name}, ${r.country} — ${r.reportCount} report${
              r.reportCount === 1 ? "" : "s"
            }`;
            return (
              <g
                key={r.regionId}
                className={styles.pin}
                data-sev={Math.round(r.avgSeverity)}
                transform={`translate(${x} ${y})`}
              >
                <title>{label}</title>
                <circle className={styles.pulse} r={6.5} />
                <circle className={styles.dot} r={3} />
              </g>
            );
          })}
        </svg>
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
