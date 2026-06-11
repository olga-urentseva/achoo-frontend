import { Suspense, use, useEffect, useState } from "react";
import getRegionStatus, {
  clearRegionStatus,
} from "../../../api/getRegionStatus";
import getNearbyRegions from "../../../api/getNearbyRegions";
import { WorldMap, type MapFocus } from "../../organisms/WorldMap/WorldMap";
import { LocationPicker } from "../../organisms/LocationPicker/LocationPicker";
import { RegionFamilies } from "../../organisms/RegionFamilies/RegionFamilies";
import { ReportForm } from "../../organisms/ReportForm/ReportForm";
import { ButtonedLink } from "../../atoms/ButtonedLink/ButtonedLink";
import { Button } from "../../atoms/Button/Button";
import { ErrorBoundary } from "../../templates/ErrorBoundary/ErrorBoundary";
import { clearRegionFamilies } from "../../../api/getRegionFamilies";
import { loadPlants, savePlants } from "../../../lib/plantProfile";
import { latestLocation, saveLocation } from "../../../lib/locationHistory";
import {
  hasReportedToday,
  hasReportedAnythingToday,
} from "../../../lib/throttle";
import type { Place, RegionStatus } from "../../../types";
import styles from "./HomePage.module.css";

/** Reads today's reports and feeds the presentational map. */
function TodayMap({
  focus,
  nearby,
  showRegions,
  gated,
}: {
  focus: MapFocus | null;
  nearby: RegionStatus[];
  showRegions: boolean;
  gated: boolean;
}) {
  const regions = use(getRegionStatus());
  return (
    <WorldMap
      regions={regions}
      focus={focus}
      nearby={nearby}
      showRegions={showRegions}
      gated={gated}
    />
  );
}

export function HomePage() {
  // The chosen location anchors both halves: it gives the region to read counts
  // for and the placeId to report under. Restored from localStorage so a
  // returning visitor opens with their latest location already selected.
  const [place, setPlace] = useState<Place | null>(latestLocation);

  // Whether the user chose to peek at the region's general results without
  // reporting. Reset on every new location, so each region re-gates.
  const [peeking, setPeeking] = useState(false);

  // Persist every pick as the newest stored location.
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

  // Major cities (region anchors) near the picked place, reported and not — the
  // map plots these once a location is chosen. Interactive, so it's plain state
  // (not a suspending `use` resource). Re-fetched when the place changes or a
  // report is filed (reportTick), so a fresh report recolours its dot.
  const [nearby, setNearby] = useState<RegionStatus[]>([]);
  useEffect(() => {
    if (
      !place ||
      typeof place.lat !== "number" ||
      typeof place.lng !== "number"
    ) {
      setNearby([]);
      return;
    }
    let cancelled = false;
    getNearbyRegions(place.lat, place.lng)
      .then((rs) => !cancelled && setNearby(rs))
      .catch(() => !cancelled && setNearby([]));
    return () => {
      cancelled = true;
    };
  }, [place, reportTick]);

  function handleReported() {
    if (place) clearRegionFamilies(place.region.id);
    // The map is memoized; drop it so it re-fetches and the just-reported
    // region shows up (and its pin can take the severity colour).
    clearRegionStatus();
    setReportTick((t) => t + 1);
  }

  // Give-to-get, in two tiers (both recomputed each render; reportTick bumps
  // after a submit so they flip the moment a report is filed):
  //  - reportedToday: reported in *any* region today → earns the global view
  //    (other cities on the map + each region's general numbers).
  //  - reportedHere: reported in *this* region → also earns personal severity
  //    for the families the user reacts to.
  const reportedToday = hasReportedAnythingToday();
  const reportedHere = place ? hasReportedToday(place.region.id) : false;

  // Whether to reveal results without a personal report here: earned globally
  // by reporting anything today, or by explicitly peeking at this region.
  const revealResults = reportedToday || peeking;

  // Until the user reveals results, the map is gated: muted pin and an on-map
  // prompt to report (shown even before a city is picked).
  const gated = !revealResults;

  // What the map centres and pins on. A place restored from older localStorage
  // may predate lat/lng; it just won't zoom until re-picked.
  const focus: MapFocus | null =
    place && typeof place.lat === "number" && typeof place.lng === "number"
      ? {
          lat: place.lat,
          lng: place.lng,
          // The map is region-centric: a suburb (Burnaby) reports under, and is
          // shown as, its major-city region (Vancouver).
          name: place.region.name,
          regionId: place.region.id,
        }
      : null;

  return (
    <div className={styles.layout}>
      {/* Output column: the map, and below it the result of a picked location. */}
      <section className={styles.mapPanel}>
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading map…</p>}>
            {/* Other cities are earned: hidden until the user reports anything
                today. */}
            <TodayMap
              key={reportTick}
              focus={focus}
              nearby={nearby}
              showRegions={reportedToday}
              gated={gated}
            />
          </Suspense>
        </ErrorBoundary>

        {/* The family panel is the result of the form, so it sits under the map
            — not in the form column. Its own boundary, so it never flashes the
            map. */}
        {place && (
          <div className={styles.results}>
            {revealResults ? (
              <ErrorBoundary>
                <Suspense fallback={<p className={styles.hint}>loading…</p>}>
                  {/* Reported in this region → personal families. Otherwise
                      (reported elsewhere today, or peeking) → pass no plants, so
                      the panel shows the region's general numbers with no
                      personalized severity. */}
                  <RegionFamilies
                    key={reportTick}
                    regionId={place.region.id}
                    regionName={place.region.name}
                    plants={reportedHere ? plants : []}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              // The prompt now lives on the map (see WorldMap); here we only
              // offer the way out of the gate.
              <div className={styles.gate}>
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
          <ButtonedLink
            to="/allergens"
            variant="subtle"
            className={styles.learnMoreButton}
          >
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
              {/* Shown right away; submitting just needs a city to be picked.
                  Keyed on the city so picking a new one remounts a fresh form —
                  the previous city's "thanks" state doesn't carry over. */}
              <ReportForm
                key={place?.placeId}
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
