import { Suspense, use } from "react";
import getRegionStatus from "../../../api/getRegionStatus";
import { WorldMap } from "../../organisms/WorldMap/WorldMap";
import { ReportForm } from "../../organisms/ReportForm/ReportForm";
import { ErrorBoundary } from "../../templates/ErrorBoundary/ErrorBoundary";
import styles from "./HomePage.module.css";

/** Reads today's reports and feeds the presentational map. */
function TodayMap() {
  const regions = use(getRegionStatus());
  return <WorldMap regions={regions} />;
}

export function HomePage() {
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
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading…</p>}>
            <ReportForm />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  );
}
