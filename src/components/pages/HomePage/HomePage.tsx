import { Suspense, use, useState } from "react";
import getRegionStatus from "../../../api/getRegionStatus";
import { WorldMap } from "../../organisms/WorldMap/WorldMap";
import { LocationPicker } from "../../organisms/LocationPicker/LocationPicker";
import { RegionSummary } from "../../organisms/RegionSummary/RegionSummary";
import { ReportForm } from "../../organisms/ReportForm/ReportForm";
import { ErrorBoundary } from "../../templates/ErrorBoundary/ErrorBoundary";
import type { Place } from "../../../types";
import styles from "./HomePage.module.css";

/** Reads today's reports and feeds the presentational map. */
function TodayMap() {
  const regions = use(getRegionStatus());
  return <WorldMap regions={regions} />;
}

export function HomePage() {
  // The chosen location anchors both halves: it gives the region to read counts
  // for and the placeId to report under.
  const [place, setPlace] = useState<Place | null>(null);

  return (
    <div className={styles.layout}>
      <section className={styles.mapPanel}>
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading map…</p>}>
            <TodayMap />
          </Suspense>
        </ErrorBoundary>
      </section>

      <section className={styles.formPanel}>
        <LocationPicker value={place} onSelect={setPlace} />

        {/*
          Boundaries stay mounted (we gate only the content on `place`). If they
          were created together with their suspending child, React would bubble
          the fallback up to the page-level <Suspense> and flash the map away.
          Mounted up front, the city selection loads in place within the
          action's transition.
        */}
        <div className={styles.panelBody}>
          <ErrorBoundary>
            <Suspense fallback={<p className={styles.hint}>loading…</p>}>
              {place && (
                <RegionSummary
                  regionId={place.region.id}
                  regionName={place.region.name}
                />
              )}
            </Suspense>
            <Suspense fallback={<p className={styles.hint}>loading…</p>}>
              {/* Remount on location change so the action state resets. */}
              {place && <ReportForm key={place.placeId} place={place} />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
}
