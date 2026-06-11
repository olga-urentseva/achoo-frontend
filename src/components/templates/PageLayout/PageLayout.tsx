import { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
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
        <div className={styles.bar}>
          <h1 className={styles.logo}>
            <Link to="/" className={styles.logoLink}>
              achoo
            </Link>
          </h1>

          <nav className={styles.nav}>
            <NavLink
              to="/allergens"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              Allergens
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              About
            </NavLink>
          </nav>
        </div>

        <p className={styles.tagline}>
          Community based anonymus allergies reports
        </p>
      </header>

      <main className={styles.main}>
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading…</p>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>
        <Link to="/about" className={styles.footerLink}>
          About &amp; privacy
        </Link>
        <span> · Anonymous, community-based reports</span>
      </footer>
    </div>
  );
}
