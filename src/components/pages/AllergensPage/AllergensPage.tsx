import { use, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import getMeta from "../../../api/getMeta";
import getCrossReactivity from "../../../api/getCrossReactivity";
import { loadPlants } from "../../../lib/plantProfile";
import { ProteinsTable } from "../../molecules/ProteinsTable/ProteinsTable";
import { ProteinGlossary } from "../../molecules/ProteinGlossary/ProteinGlossary";
import styles from "./AllergensPage.module.css";

/** Botanical family id → display name (e.g. `fagales` → `Fagales`). */
const sci = (familyId: string) =>
  familyId.charAt(0).toUpperCase() + familyId.slice(1);

const STRENGTH_ORDER = { strong: 0, moderate: 1, weak: 2 } as const;

/**
 * Reference page: every allergen family, the plants in it, and the proteins
 * those plants share (with kind/strength). Folder tabs switch between the
 * general reference (all families) and the user's own allergens — their saved
 * plant picks, read locally from `plantProfile`, never the server.
 */
export function AllergensPage() {
  const meta = use(getMeta());
  const groups = use(getCrossReactivity());

  // "all" = the general reference; "mine" = scoped to the user's picked plants.
  const [view, setView] = useState<"all" | "mine">("all");
  const mine = view === "mine";
  const picked = new Set(loadPlants());

  // Roving focus for the tablist — Left/Right move and re-focus the active tab.
  const allTabRef = useRef<HTMLButtonElement>(null);
  const mineTabRef = useRef<HTMLButtonElement>(null);
  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = mine ? "all" : "mine";
    setView(next);
    (next === "all" ? allTabRef : mineTabRef).current?.focus();
  }

  const nameById = new Map(meta.plants.map((p) => [p.id, p.name]));
  // Real families only (the `unknown` bucket has no plants).
  const families = meta.families.filter((f) =>
    meta.plants.some((p) => p.family === f.id),
  );
  // In "mine" mode, only families the user actually picked a plant from.
  const shownFamilies = mine
    ? families.filter((f) =>
        meta.plants.some((p) => p.family === f.id && picked.has(p.id)),
      )
    : families;

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

      <section className={styles.terms}>
        <ProteinGlossary />
      </section>

      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Allergen view"
        onKeyDown={onTabKeyDown}
      >
        <button
          ref={allTabRef}
          type="button"
          role="tab"
          id="tab-all"
          aria-selected={!mine}
          aria-controls="allergen-panel"
          tabIndex={mine ? -1 : 0}
          className={`${styles.tab} ${mine ? "" : styles.tabActive}`}
          onClick={() => setView("all")}
        >
          All allergens
        </button>
        <button
          ref={mineTabRef}
          type="button"
          role="tab"
          id="tab-mine"
          aria-selected={mine}
          aria-controls="allergen-panel"
          tabIndex={mine ? 0 : -1}
          className={`${styles.tab} ${mine ? styles.tabActive : ""}`}
          onClick={() => setView("mine")}
        >
          My allergens
        </button>
      </div>

      <div
        id="allergen-panel"
        role="tabpanel"
        aria-labelledby={mine ? "tab-mine" : "tab-all"}
        className={styles.panel}
      >
        {mine && shownFamilies.length === 0 ? (
          <p className={styles.empty}>
            You haven’t picked any plants yet. Choose the plants you react to on
            the <Link to="/">home page</Link> and your allergens will show up
            here.
          </p>
        ) : (
          shownFamilies.map((fam) => {
            const familyPlants = meta.plants.filter((p) => p.family === fam.id);
            const familyIds = new Set(familyPlants.map((p) => p.id));
            // The plants/proteins to surface: the user's picks in "mine" mode,
            // the whole family otherwise.
            const relevantIds = mine
              ? new Set([...familyIds].filter((id) => picked.has(id)))
              : familyIds;
            const shownPlants = mine
              ? familyPlants.filter((p) => picked.has(p.id))
              : familyPlants;
            const proteins = groups
              .filter((g) => g.plants.some((id) => relevantIds.has(id)))
              .sort(
                (a, b) =>
                  STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength],
              );

            return (
              <section key={fam.id} className={styles.family}>
                <h3 className={styles.familyName}>{sci(fam.id)}</h3>
                <p className={styles.plants}>
                  {shownPlants.map((p) => p.name).join(", ")}
                </p>

                <ProteinsTable
                  carriersLabel={mine ? "Your plants" : "In this family"}
                  rows={proteins.map((g) => {
                    const carriers = g.plants
                      .filter((id) => relevantIds.has(id))
                      .map((id) => nameById.get(id) ?? id);
                    const spansOthers = g.plants.some(
                      (id) => !familyIds.has(id),
                    );
                    return {
                      protein: g.protein,
                      name: g.name,
                      kind: g.kind,
                      strength: g.strength,
                      carriers:
                        carriers.join(", ") +
                        (spansOthers
                          ? " · also reaches beyond this family"
                          : ""),
                    };
                  })}
                />
              </section>
            );
          })
        )}
      </div>

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
