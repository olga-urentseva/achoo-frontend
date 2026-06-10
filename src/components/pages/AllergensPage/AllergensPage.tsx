import { use } from "react";
import { Link } from "react-router-dom";
import getMeta from "../../../api/getMeta";
import getCrossReactivity from "../../../api/getCrossReactivity";
import styles from "./AllergensPage.module.css";

/** Botanical family id → display name (e.g. `fagales` → `Fagales`). */
const sci = (familyId: string) =>
  familyId.charAt(0).toUpperCase() + familyId.slice(1);

const STRENGTH_ORDER = { strong: 0, moderate: 1, weak: 2 } as const;

/**
 * Reference page: every allergen family, the plants in it, and the proteins
 * those plants share (with kind/strength), plus the source. Built entirely from
 * `/meta` and `/meta/cross-reactivity` via `use` — no personal data.
 */
export function AllergensPage() {
  const meta = use(getMeta());
  const groups = use(getCrossReactivity());

  const nameById = new Map(meta.plants.map((p) => [p.id, p.name]));
  // Real families only (the `unknown` bucket has no plants).
  const families = meta.families.filter((f) =>
    meta.plants.some((p) => p.family === f.id),
  );

  return (
    <article className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back
      </Link>
      <h2 className={styles.title}>Allergen families</h2>
      <p className={styles.intro}>
        Plants are grouped into <strong>families</strong> that share major
        allergenic <strong>proteins</strong>. React to one plant in a family and
        you often react to the others — that shared protein is what
        “cross-reactivity” means. Panallergens are broad, usually weaker links
        that reach across families. This is general information,{" "}
        <strong>not medical advice</strong>.
      </p>

      {families.map((fam) => {
        const plants = meta.plants.filter((p) => p.family === fam.id);
        const ids = new Set(plants.map((p) => p.id));
        const proteins = groups
          .filter((g) => g.plants.some((id) => ids.has(id)))
          .sort(
            (a, b) => STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength],
          );

        return (
          <section key={fam.id} className={styles.family}>
            <h3 className={styles.familyName}>{sci(fam.id)}</h3>
            <p className={styles.plants}>
              {plants.map((p) => p.name).join(", ")}
            </p>

            <ul className={styles.proteins}>
              {proteins.map((g) => {
                const carriers = g.plants
                  .filter((id) => ids.has(id))
                  .map((id) => nameById.get(id) ?? id);
                const spansOthers = g.plants.some((id) => !ids.has(id));
                return (
                  <li key={g.protein} className={styles.protein}>
                    <span className={styles.proteinName}>{g.name}</span>
                    <span className={styles.badges}>
                      <span className={styles.kind} data-kind={g.kind}>
                        {g.kind}
                      </span>
                      <span
                        className={styles.strength}
                        data-strength={g.strength}
                      >
                        {g.strength}
                      </span>
                    </span>
                    <span className={styles.carriers}>
                      {carriers.join(", ")}
                      {spansOthers && " · also reaches beyond this family"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <footer className={styles.source}>
        Source:{" "}
        <a href="https://eaaci.org/" target="_blank" rel="noreferrer">
          EAACI
        </a>{" "}
        — the EAACI Molecular Allergology User’s Guide.
      </footer>
    </article>
  );
}
