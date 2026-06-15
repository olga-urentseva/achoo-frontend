import { Suspense, use } from "react";
import getMeta from "../../../api/getMeta";
import getCrossReactivity from "../../../api/getCrossReactivity";
import { loadPlants } from "../../../lib/plantProfile";
import { ErrorBoundary } from "../../templates/ErrorBoundary/ErrorBoundary";
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
  const meta = use(getMeta());
  const groups = use(getCrossReactivity());

  // The plants the user said they react to (local-only), and the proteins those
  // plants carry — strongest first, same ordering as the Allergens reference.
  const picked = new Set(loadPlants());
  const nameById = new Map(meta.plants.map((p) => [p.id, p.name]));
  const proteins = groups
    .filter((g) => g.plants.some((id) => picked.has(id)))
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
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Protein</th>
                  <th scope="col">Type</th>
                  <th scope="col">Strength</th>
                  <th scope="col">From your plants</th>
                </tr>
              </thead>
              <tbody>
                {proteins.map((g) => {
                  const carriers = g.plants
                    .filter((id) => picked.has(id))
                    .map((id) => nameById.get(id) ?? id);
                  return (
                    <tr key={g.protein}>
                      <th scope="row" className={styles.proteinName}>
                        {g.name}
                      </th>
                      <td>
                        <span className={styles.kind} data-kind={g.kind}>
                          {g.kind}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.strength}
                          data-strength={g.strength}
                        >
                          {g.strength}
                        </span>
                      </td>
                      <td className={styles.carriers}>{carriers.join(", ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <dl className={styles.glossary}>
              <dt>Type</dt>
              <dd>
                <strong>Major</strong> — the main protein people react to in a
                plant. <strong>Panallergen</strong> — a protein shared across
                many unrelated plants, so it links allergies broadly but usually
                more weakly.
              </dd>
              <dt>Strength</dt>
              <dd>
                How likely reacting to one plant means reacting to the others
                that carry the protein: <strong>strong</strong>,{" "}
                <strong>moderate</strong> or <strong>weak</strong>.
              </dd>
            </dl>
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
