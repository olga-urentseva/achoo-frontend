import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "../ErrorBoundary/ErrorBoundary";
import styles from "./PageLayout.module.css";

type Props = { children: ReactNode };

export function PageLayout({ children }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.logo}>achoo</h1>
        <p className={styles.tagline}>How bad are your allergies today?</p>
      </header>

      <main className={styles.main}>
        <ErrorBoundary>
          <Suspense fallback={<p className={styles.hint}>loading…</p>}>
            {children}
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className={styles.footer}>Anonymous · no account · once a day</footer>
    </div>
  );
}
