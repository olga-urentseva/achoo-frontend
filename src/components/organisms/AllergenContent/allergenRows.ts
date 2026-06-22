import type {
  AllergenCategory,
  CrossReactivityGroup,
  Family,
  Meta,
} from "../../../types";
import type { ProteinRow } from "../../molecules/ProteinsTable/ProteinsTable";

/** Botanical family id → display name (e.g. `fagales` → `Fagales`). */
export const sci = (familyId: string) =>
  familyId.charAt(0).toUpperCase() + familyId.slice(1);

const STRENGTH_ORDER = { strong: 0, moderate: 1, weak: 2 } as const;
const byStrength = (a: CrossReactivityGroup, b: CrossReactivityGroup) =>
  STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength];

/** The non-plant category sections, in display order. */
export const CATEGORY_SECTIONS: {
  category: Exclude<AllergenCategory, "plant">;
  title: string;
}[] = [
  { category: "food", title: "Food" },
  { category: "animal", title: "Animals" },
  { category: "other", title: "Other" },
];

/** Families that have any plant — in "mine", only those with a picked plant. */
export function shownFamilies(
  meta: Meta,
  picked: Set<string>,
  mine: boolean,
): Family[] {
  return meta.families.filter((f) =>
    meta.plants.some((p) => p.family === f.id && (!mine || picked.has(p.id))),
  );
}

export type FamilyBlock = {
  id: string;
  /** Botanical name heading, e.g. "Fagales". */
  title: string;
  /** The family's plants to list inline, comma-joined. */
  plants: string;
  rows: ProteinRow[];
};

/**
 * One plant-family block: the plants in the family plus the shared-protein rows
 * that touch them. In "mine" both narrow to the user's picks (and the proteins
 * those picks carry); a row notes when its protein also reaches beyond the
 * family.
 */
export function familyBlock(
  meta: Meta,
  groups: CrossReactivityGroup[],
  famId: string,
  picked: Set<string>,
  mine: boolean,
): FamilyBlock {
  const familyPlants = meta.plants.filter((p) => p.family === famId);
  const familyIds = new Set(familyPlants.map((p) => p.id));
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

  return {
    id: famId,
    title: sci(famId),
    plants: shownPlants.map((p) => p.name).join(", "),
    rows,
  };
}

/**
 * Cross-reactivity rows for a food/animal/other category. In "mine" only the
 * clusters that also link to a plant the user picked (i.e. ones that actually
 * cross-react with their profile).
 */
export function categoryRows(
  groups: CrossReactivityGroup[],
  category: Exclude<AllergenCategory, "plant">,
  picked: Set<string>,
  mine: boolean,
): ProteinRow[] {
  return groups
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
}
