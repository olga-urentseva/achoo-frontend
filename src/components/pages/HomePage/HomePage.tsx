import { Suspense, use, useState } from "react";
import getRegionStatus from "../../../api/getRegionStatus";
import { WorldMap } from "../../organisms/WorldMap/WorldMap";
import { LocationPicker } from "../../organisms/LocationPicker/LocationPicker";
import { RegionFamilies } from "../../organisms/RegionFamilies/RegionFamilies";
import { ReportForm } from "../../organisms/ReportForm/ReportForm";
import { ButtonedLink } from "../../atoms/ButtonedLink/ButtonedLink";
import { Button } from "../../atoms/Button/Button";
import { ErrorBoundary } from "../../templates/ErrorBoundary/ErrorBoundary";
import { clearRegionFamilies } from "../../../api/getRegionFamilies";
import { loadPlants, savePlants } from "../../../lib/plantProfile";
import { latestLocation, saveLocation } from "../../../lib/locationHistory";
import { hasReportedToday } from "../../../lib/throttle";
import type { Place } from "../../../types";
import styles from "./HomePage.module.css";

/** Reads today's reports and feeds the presentational map. */
function TodayMap() {
  const regions = use(getRegionStatus());
  return <WorldMap regions={regions} />;
}

export function HomePage() {
  // The chosen location anchors both halves: it gives the region to read counts
  // for and the placeId to report under. Restored from localStorage so a
  // returning visitor opens with their latest location already selected.
  const [place, setPlace] = useState<Place | null>(latestLocation);

  // Whether the user chose to peek at the region's general results without
  // reporting. Reset on every new location, so each region re-gates.
  const [peeking, setPeeking] = useState(false);

  // Persist every pick (search or geolocation) as the newest stored location.
  function selectPlace(next: Place) {
    setPlace(next);
    saveLocation(next);
    setPeeking(false);
  }

  // The user's plants, restored from localStorage so a returning visitor sees
  // them already selected. The picker lives inside the report form, right next
  // to the severity picker; changes are persisted as they happen.
  const [plants, setPlants] = useState<string[]>(loadPlants);

  function updatePlants(next: string[]) {
    setPlants(next);
    savePlants(next);
  }

  // Bumped after a report so the family panel remounts and refetches — its
  // cached signal predates the just-filed report, so clear that first.
  const [reportTick, setReportTick] = useState(0);

  function handleReported() {
    if (place) clearRegionFamilies(place.region.id);
    setReportTick((t) => t + 1);
  }

  // Give-to-get: results are earned by reporting. Someone who reported today
  // sees their own families; otherwise they can only peek at the region's
  // general numbers — never their personal severity. Recomputed each render
  // (reportTick bumps after a submit, so it flips true the moment they file).
  const reported = place ? hasReportedToday(place.region.id) : false;

  return (
    <div className={styles.layout}>
      {/* Output column: the map, and below it the result of a picked location. */}
      <section className={styles.mapPanel}>
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading map…</p>}>
            <TodayMap />
          </Suspense>
        </ErrorBoundary>

        {/* The family panel is the result of the form, so it sits under the map
            — not in the form column. Its own boundary, so it never flashes the
            map. */}
        {place && (
          <div className={styles.results}>
            {reported || peeking ? (
              <ErrorBoundary>
                <Suspense fallback={<p className={styles.hint}>loading…</p>}>
                  {/* Reported today → personal families. Only peeking → pass no
                      plants, so the panel shows the region's general numbers
                      with no personalized severity. */}
                  <RegionFamilies
                    key={reportTick}
                    regionId={place.region.id}
                    regionName={place.region.name}
                    plants={reported ? plants : []}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <div className={styles.gate}>
                <p className={styles.gateText}>
                  Report today to see how your allergens are doing in{" "}
                  <strong>{place.region.name}</strong>.
                </p>
                <Button
                  variant="subtle"
                  className={styles.showReportsBtn}
                  onClick={() => setPeeking(true)}
                >
                  Show what others reported
                </Button>
              </div>
            )}
          </div>
        )}

        <div className={styles.learnMore}>
          <ButtonedLink to="/allergens" variant="subtle">
            Learn more about allergens
          </ButtonedLink>
        </div>
      </section>

      {/* Input column: pick a place, then report. */}
      <section className={styles.formPanel}>
        <LocationPicker value={place} onSelect={selectPlace} />

        <div className={styles.panelBody}>
          <ErrorBoundary>
            <Suspense fallback={<p className={styles.hint}>loading…</p>}>
              {/* Shown right away; submitting just needs a city to be picked. */}
              <ReportForm
                place={place}
                plants={plants}
                onPlantsChange={updatePlants}
                onReported={handleReported}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </section>
    </div>
  );
}
