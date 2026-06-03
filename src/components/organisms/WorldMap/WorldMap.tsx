import { WORLD_PATH, MAP_WIDTH, MAP_HEIGHT } from "../../../assets/worldPath";
import type { RegionStatus, SeverityColor } from "../../../types";
import styles from "./WorldMap.module.css";

const COLOR_CLASS: Record<SeverityColor, string | undefined> = {
  green: styles.green,
  yellow: styles.yellow,
  red: styles.red,
  purple: styles.purple,
};

// Same equirectangular mapping used to generate WORLD_PATH.
const toX = (lng: number) => lng + 180;
const toY = (lat: number) => 90 - lat;

type Props = {
  regions: RegionStatus[];
};

export function WorldMap({ regions }: Props) {
  const totalReports = regions.reduce((sum, r) => sum + r.reportCount, 0);

  return (
    <div className={styles.worldmap}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label="World map of allergy reports today"
        preserveAspectRatio="xMidYMid meet"
      >
        <path className={styles.land} d={WORLD_PATH} />

        {regions.map((r) => {
          const colorClass = r.color ? COLOR_CLASS[r.color] : styles.green;
          const label = `${r.name}, ${r.country} — ${r.reportCount} report${
            r.reportCount === 1 ? "" : "s"
          }`;
          return (
            <g
              key={r.regionId}
              className={colorClass}
              transform={`translate(${toX(r.lng)} ${toY(r.lat)})`}
            >
              <title>{label}</title>
              <circle className={styles.pulse} r={2.4} />
              <circle className={styles.dot} r={1.1} />
            </g>
          );
        })}
      </svg>

      <div className={styles.caption}>
        {regions.length === 0 ? (
          "No reports yet today"
        ) : (
          <>
            <span className={styles.count}>{totalReports}</span> report
            {totalReports === 1 ? "" : "s"} across {regions.length} region
            {regions.length === 1 ? "" : "s"} today
          </>
        )}
      </div>
    </div>
  );
}
