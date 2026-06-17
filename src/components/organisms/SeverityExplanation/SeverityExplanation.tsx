import { Suspense, use } from "react";
import getCrossReactivity from "../../../api/getCrossReactivity";
import { loadPlants } from "../../../lib/plantProfile";
import { ErrorBoundary } from "../../templates/ErrorBoundary/ErrorBoundary";
import { ProteinsTable } from "../../molecules/ProteinsTable/ProteinsTable";
import { ProteinGlossary } from "../../molecules/ProteinGlossary/ProteinGlossary";
import styles from "./SeverityExplanation.module.css";
import { ButtonedLink } from "../../atoms/ButtonedLink/ButtonedLink";

const STRENGTH_ORDER = { strong: 0, moderate: 1, weak: 2 } as const;

const SEVERITY_LEGEND = [
  { level: 1, label: "Mild" },
  { level: 2, label: "Slight" },
  { level: 3, label: "Moderate" },
  { level: 4, label: "Strong" },
  { level: 5, label: "Heavy" },
  { level: 6, label: "Severe" },
];

/**
 * Explains the severity score and shows the proteins behind the user's own
 * picks. Reads the user's plant profile from localStorage (never the server)
 * and pairs it with the EAACI cross-reactivity map. Two parts: how the number is
 * made (community average, 1–6 scale), then "your" proteins.
 */
function Body() {
  // Plants only — this explains the proteins behind the user's pollen picks.
  const groups = use(getCrossReactivity(["plant"]));

  // The plants the user said they react to (local-only), and the proteins those
  // plants carry — strongest first, same ordering as the Allergens reference.
  const picked = new Set(loadPlants());
  const proteins = groups
    .filter((g) => g.sources.some((s) => picked.has(s.id)))
    .sort((a, b) => STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength]);

  return (
    <div className={styles.body}>
      <p className={styles.disclaimer}>
        <strong>General information, not medical advice!</strong>
      </p>
      <section>
        <h3 className={styles.heading}>Proteins behind your picks</h3>
        {proteins.length > 0 ? (
          <>
            <p className={styles.text}>
              From the plants you picked, these are the allergenic{" "}
              <strong>proteins</strong> you <strong>may</strong> react to. React
              to one plant carrying a protein and you often react to the others
              that share it.
            </p>
            <ProteinsTable
              carriersLabel="From your plants"
              rows={proteins.map((g) => ({
                protein: g.protein,
                name: g.name,
                kind: g.kind,
                strength: g.strength,
                carriers: g.sources
                  .filter((s) => picked.has(s.id))
                  .map((s) => s.name)
                  .join(", "),
              }))}
            />

            <ProteinGlossary />
            <p>
              {`Source: `}
              <a href="https://eaaci.org/" target="_blank" rel="noreferrer">
                EAACI Molecular Allergology User's Guide
              </a>
            </p>

            <div className={styles.learnMore}>
              <ButtonedLink
                to="/allergens"
                variant="subtle"
                className={styles.learnMoreButton}
              >
                Learn more about allergens
              </ButtonedLink>
            </div>
          </>
        ) : (
          <p className={styles.text}>
            Pick the plants you react to in the report form and they’ll show up
            here — with the proteins that link them to other plants.
          </p>
        )}
      </section>

      <section>
        <h3 className={styles.heading}>How the severity number works</h3>
        <p className={styles.text}>
          When people report here, each rates their reaction from{" "}
          <strong>1 (mild)</strong> to <strong>6 (severe)</strong>. The{" "}
          <strong>x.x/6</strong> you see is the <strong>average</strong> of
          every report for that plant family in the region over the{" "}
          <strong>last 3 days</strong> — not your own reading. Its colour is
          that average rounded to the nearest level:
        </p>
        <ul
          className={styles.legend}
          aria-label="Severity scale, 1 mild to 6 severe"
        >
          {SEVERITY_LEGEND.map(({ level, label }) => (
            <li key={level} className={styles.swatch} data-sev={level}>
              <span className={styles.swatchNum}>{level}</span>
              {label && <span className={styles.swatchLabel}>{label}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Self-contained wrapper: its own boundary + fallback so the modal can drop it
 * in without each call site re-wiring Suspense/error handling. */
export function SeverityExplanation() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<p className={styles.text}>loading…</p>}>
        <Body />
      </Suspense>
    </ErrorBoundary>
  );
}
