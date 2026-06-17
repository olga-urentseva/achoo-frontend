import { use, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import getMeta from "../../../api/getMeta";
import getCrossReactivity from "../../../api/getCrossReactivity";
import { loadPlants } from "../../../lib/plantProfile";
import { ProteinsTable } from "../../molecules/ProteinsTable/ProteinsTable";
import { ProteinGlossary } from "../../molecules/ProteinGlossary/ProteinGlossary";
import type { AllergenCategory, CrossReactivityGroup } from "../../../types";
import styles from "./AllergensPage.module.css";

/** Botanical family id → display name (e.g. `fagales` → `Fagales`). */
const sci = (familyId: string) =>
  familyId.charAt(0).toUpperCase() + familyId.slice(1);

const STRENGTH_ORDER = { strong: 0, moderate: 1, weak: 2 } as const;
const byStrength = (a: CrossReactivityGroup, b: CrossReactivityGroup) =>
  STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength];

/** The non-plant category sections, in display order. */
const CATEGORY_SECTIONS: {
  category: Exclude<AllergenCategory, "plant">;
  title: string;
}[] = [
  { category: "food", title: "Food" },
  { category: "animal", title: "Animals" },
  { category: "other", title: "Other" },
];

/**
 * Reference page for every allergen source and the proteins that link them.
 * Plants are grouped by botanical family; food, animals and "other" by their
 * shared-protein clusters. Folder tabs switch between the full reference (All)
 * and the user's own allergens (My) — their saved plant picks plus the foods,
 * animals and others that cross-react with them via a shared protein. Picks are
 * read locally from `plantProfile`, never the server.
 */
export function AllergensPage() {
  const meta = use(getMeta());
  const groups = use(
    getCrossReactivity(["plant", "food", "animal", "other"]),
  );

  const [view, setView] = useState<"all" | "mine">("all");
  const mine = view === "mine";
  const picked = new Set(loadPlants());

  // Roving tablist focus — Left/Right move and re-focus the active tab.
  const allTabRef = useRef<HTMLButtonElement>(null);
  const mineTabRef = useRef<HTMLButtonElement>(null);
  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = mine ? "all" : "mine";
    setView(next);
    (next === "all" ? allTabRef : mineTabRef).current?.focus();
  }

  // --- Plants: grouped by botanical family, as the reference always was. ---
  const families = meta.families.filter((f) =>
    meta.plants.some((p) => p.family === f.id),
  );
  const shownFamilies = mine
    ? families.filter((f) =>
        meta.plants.some((p) => p.family === f.id && picked.has(p.id)),
      )
    : families;

  const familySection = (famId: string) => {
    const familyPlants = meta.plants.filter((p) => p.family === famId);
    const familyIds = new Set(familyPlants.map((p) => p.id));
    // The plants/proteins to surface: the user's picks in "mine", else all.
    const relevantIds = mine
      ? new Set([...familyIds].filter((id) => picked.has(id)))
      : familyIds;
    const shownPlants = mine
      ? familyPlants.filter((p) => picked.has(p.id))
      : familyPlants;
    const rows = groups
      .filter((g) =>
        g.sources.some((s) => s.category === "plant" && relevantIds.has(s.id)),
      )
      .sort(byStrength)
      .map((g) => {
        const carriers = g.sources
          .filter((s) => s.category === "plant" && relevantIds.has(s.id))
          .map((s) => s.name);
        const spansOthers = g.sources.some(
          (s) => s.category === "plant" && !familyIds.has(s.id),
        );
        return {
          protein: g.protein,
          name: g.name,
          kind: g.kind,
          strength: g.strength,
          carriers:
            carriers.join(", ") +
            (spansOthers ? " · also reaches beyond this family" : ""),
        };
      });

    return (
      <section key={famId} className={styles.family}>
        <h4 className={styles.familyName}>{sci(famId)}</h4>
        <p className={styles.plants}>
          {shownPlants.map((p) => p.name).join(", ")}
        </p>
        <ProteinsTable carriersLabel="In this family" rows={rows} />
      </section>
    );
  };

  // --- Food / Animals / Other: one cluster table per category. In "mine" only
  // clusters that also link to a plant the user picked (i.e. cross-react). ---
  const categoryRows = (category: Exclude<AllergenCategory, "plant">) =>
    groups
      .filter((g) => g.sources.some((s) => s.category === category))
      .filter(
        (g) =>
          !mine ||
          g.sources.some((s) => s.category === "plant" && picked.has(s.id)),
      )
      .sort(byStrength)
      .map((g) => ({
        protein: g.protein,
        name: g.name,
        kind: g.kind,
        strength: g.strength,
        carriers: g.sources
          .filter((s) => s.category === category)
          .map((s) => s.name)
          .join(", "),
      }));

  const noPicks = mine && picked.size === 0;

  return (
    <article className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back
      </Link>
      <h2 className={styles.title}>Allergens</h2>
      <p className={styles.intro}>
        Allergen sources are linked by the <strong>proteins</strong> they share.
        React to one source carrying a protein and you often react to the others
        that share it — that’s <strong>cross-reactivity</strong>. Panallergens
        are broad, usually weaker links. This is general information,{" "}
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
        {noPicks ? (
          <p className={styles.empty}>
            You haven’t picked any plants yet. Choose the plants you react to on
            the <Link to="/">home page</Link> and your allergens — plus the foods
            and animals that cross-react with them — will show up here.
          </p>
        ) : (
          <>
            <section className={styles.group}>
              <h3 className={styles.groupTitle}>Plants</h3>
              {shownFamilies.length > 0 ? (
                shownFamilies.map((f) => familySection(f.id))
              ) : (
                <p className={styles.empty}>No plant matches.</p>
              )}
            </section>

            {CATEGORY_SECTIONS.map(({ category, title }) => {
              const rows = categoryRows(category);
              if (rows.length === 0) return null;
              return (
                <section key={category} className={styles.group}>
                  <h3 className={styles.groupTitle}>{title}</h3>
                  <ProteinsTable
                    carriersLabel={mine ? `${title} you may react to` : title}
                    rows={rows}
                  />
                </section>
              );
            })}
          </>
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
