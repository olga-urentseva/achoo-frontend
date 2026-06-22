import { Link } from "react-router-dom";
import { loadPlants } from "../../../lib/plantProfile";
import { collapseToLabels } from "../../../lib/plantLabels";
import { ProteinsTable } from "../../molecules/ProteinsTable/ProteinsTable";
import type { CrossReactivityGroup, Meta } from "../../../types";
import {
  CATEGORY_SECTIONS,
  categoryRows,
  familyBlock,
  shownFamilies,
} from "./allergenRows";
import styles from "./AllergenContent.module.css";

type Props = {
  meta: Meta;
  groups: CrossReactivityGroup[];
  /** Which tab is active: the full reference (`false`) or the user's own picks. */
  mine: boolean;
};

/**
 * The body of the Allergens folder panel: the plant families plus the food,
 * animal and "other" cross-reactivity tables. Reads the user's picks straight
 * from localStorage — the single source of truth for their data — as a set of
 * plant ids, then resolves names and narrows the tables off `/meta`. In "mine"
 * it lists those picks and shows only what cross-reacts with them.
 */
export function AllergenContent({ meta, groups, mine }: Props) {
  const picked = new Set(loadPlants());

  if (mine && picked.size === 0) {
    return (
      <p className={styles.empty}>
        You haven’t picked any plants yet. Choose the plants you react to on the{" "}
        <Link to="/">home page</Link> and your allergens — plus the foods and
        animals that cross-react with them — will show up here.
      </p>
    );
  }

  const families = shownFamilies(meta, picked, mine);

  return (
    <>
      {mine && (
        <p className={styles.mineIntro}>
          Since you picked{" "}
          <strong>
            {collapseToLabels(
              meta.plants.filter((p) => picked.has(p.id)),
              meta.displayGroups,
            ).join(", ")}
          </strong>{" "}
          you may react to these allergens:
        </p>
      )}

      <section className={styles.group}>
        <h3 className={styles.groupTitle}>Plants</h3>
        {families.length > 0 ? (
          families.map((f) => {
            const block = familyBlock(meta, groups, f.id, picked, mine);
            return (
              <section key={block.id} className={styles.family}>
                <h4 className={styles.familyName}>{block.title}</h4>
                <p className={styles.plants}>{block.plants}</p>
                <ProteinsTable carriersLabel="Found in" rows={block.rows} />
              </section>
            );
          })
        ) : (
          <p className={styles.empty}>No plants data.</p>
        )}
      </section>

      {CATEGORY_SECTIONS.map(({ category, title }) => {
        const rows = categoryRows(groups, category, picked, mine);
        if (rows.length === 0) return null;
        return (
          <section key={category} className={styles.group}>
            <h3 className={styles.groupTitle}>{title}</h3>
            <ProteinsTable carriersLabel="Found in" rows={rows} />
          </section>
        );
      })}
    </>
  );
}
