import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import styles from "./PageLayout.module.css";

/**
 * App shell + the single Suspense/ErrorBoundary the routed pages render into.
 * The router renders this once and swaps only the <Outlet/> on navigation, so
 * the header and footer persist across pages.
 */
export function PageLayout() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            achoo
          </Link>
        </h1>
        <p className={styles.tagline}>How bad are your allergies today?</p>
      </header>

      <main className={styles.main}>
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>
        Anonymous · no account · once a day
      </footer>
    </div>
  );
}
