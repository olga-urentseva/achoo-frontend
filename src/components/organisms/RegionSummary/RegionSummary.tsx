import { use } from "react";
import getRegionStatus from "../../../api/getRegionStatus";
import styles from "./RegionSummary.module.css";

type Props = {
  regionId: number;
  regionName: string;
};

/** Today's report count for the chosen region (read from the shared status). */
export function RegionSummary({ regionId, regionName }: Props) {
  // Same cached promise the map reads — resolves instantly once loaded.
  const status = use(getRegionStatus()).find((r) => r.regionId === regionId);
  const count = status?.reportCount ?? 0;

  return (
    <div className={styles.card}>
      {count === 0 ? (
        <p className={styles.text}>
          No reports in <strong>{regionName}</strong> yet today.
        </p>
      ) : (
        <p className={styles.text}>
          <span className={styles.count} data-color={status?.color ?? "green"}>
            {count}
          </span>{" "}
          {count === 1 ? "person" : "people"} reported in{" "}
          <strong>{regionName}</strong> today
          {status?.color && (
            <>
              {" — severity "}
              <span className={styles.chip} data-color={status.color}>
                {status.avgSeverity.toFixed(1)}/6
              </span>
            </>
          )}
          .
        </p>
      )}
    </div>
  );
}
