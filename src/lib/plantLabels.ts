import type { DisplayGroup, Plant } from "../types";

/**
 * Collapse a set of picked plants to their friendly labels: display-group
 * members fold into the group's label once (the eight grasses → "Grasses"),
 * ungrouped plants keep their own name. Groups come first, then loose plants,
 * each in the order the plants were given.
 *
 * The user's profile stores plant *ids* (the join key for families and
 * cross-reactivity); these labels are derived from `/meta` for display only,
 * so the id list stays the single source of truth. Shared by the Allergens
 * page and `RegionFamilies`, which need the same "Grasses, Birch" wording.
 */
export function collapseToLabels(
  plants: Plant[],
  displayGroups: DisplayGroup[],
): string[] {
  const seen = new Set<string>();
  const groups: string[] = [];
  const loose: string[] = [];
  for (const p of plants) {
    if (p.displayGroup) {
      if (seen.has(p.displayGroup)) continue;
      seen.add(p.displayGroup);
      const g = displayGroups.find((dg) => dg.id === p.displayGroup);
      groups.push(g?.label ?? p.displayGroup);
    } else {
      loose.push(p.name);
    }
  }
  return [...groups, ...loose];
}
