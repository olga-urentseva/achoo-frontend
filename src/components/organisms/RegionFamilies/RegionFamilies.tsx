import { use } from "react";
import getMeta from "../../../api/getMeta";
import getRegionFamilies from "../../../api/getRegionFamilies";
import type { Plant, RegionFamily } from "../../../types";
import styles from "./RegionFamilies.module.css";

type Props = {
  regionId: number;
  regionName: string;
  /** The user's saved plant ids — mapped to families locally, never sent. */
  plants: string[];
};

/** Botanical family id → its display name (e.g. `fagales` → `Fagales`). */
const sci = (familyId: string) =>
  familyId.charAt(0).toUpperCase() + familyId.slice(1);

/**
 * After a location is picked, show the severity for the families the user
 * reacts to (their picked plants, tagged with the botanical family) plus the
 * other families reported here. The plant → family mapping is done from `/meta`;
 * only the region id goes to the server. A few of each family's plants are shown
 * inline (capped, so big families don't bloat the row).
 */
export function RegionFamilies({ regionId, regionName, plants }: Props) {
  const meta = use(getMeta());
  const reported = use(getRegionFamilies(regionId));

  // Group every plant by family (names for tooltips) and track which the user
  // picked (full objects, so we can collapse display-group members below).
  const membersByFamily = new Map<string, string[]>();
  const pickedByFamily = new Map<string, Plant[]>();
  for (const p of meta.plants) {
    if (!membersByFamily.has(p.family)) membersByFamily.set(p.family, []);
    membersByFamily.get(p.family)!.push(p.name);
    if (plants.includes(p.id)) {
      if (!pickedByFamily.has(p.family)) pickedByFamily.set(p.family, []);
      pickedByFamily.get(p.family)!.push(p);
    }
  }

  const byFamily = new Map(reported.map((f) => [f.family, f]));

  // What the user picked in a family, with display-group members collapsed to
  // the group's friendly label (so a whole cypress pick reads "Cypress & cedar",
  // not all seven species).
  const pickedLabel = (picked: Plant[]): string => {
    const seen = new Set<string>();
    const groups: string[] = [];
    const loose: string[] = [];
    for (const p of picked) {
      if (p.displayGroup) {
        if (seen.has(p.displayGroup)) continue;
        seen.add(p.displayGroup);
        const g = meta.displayGroups.find((g) => g.id === p.displayGroup);
        groups.push(g?.label ?? p.displayGroup);
      } else {
        loose.push(p.name);
      }
    }
    return [...groups, ...loose].join(", ");
  };

  // A short, inline preview of a family's plants — capped so a big family (the
  // eight grasses) doesn't bloat the row. `exclude` drops the ones the user
  // already picked, so a "your" row lists the *other* members. Returns null when
  // there's nothing to add (unknown family, or they picked them all).
  const MAX_INLINE = 3;
  const membersLine = (
    familyId: string,
    { exclude = [], prefix = "" }: { exclude?: string[]; prefix?: string } = {},
  ) => {
    const members = (membersByFamily.get(familyId) ?? []).filter(
      (n) => !exclude.includes(n),
    );
    if (members.length === 0) return null;
    let shown = members.slice(0, MAX_INLINE);
    let more = members.length - shown.length;
    if (more === 1) {
      shown = members; // don't hide a single extra behind "+1"
      more = 0;
    }
    return (
      <span className={styles.members}>
        {prefix}
        {shown.join(", ")}
        {more > 0 ? ` +${more}` : ""}
      </span>
    );
  };

  // Your families — always listed (even if quiet), in meta.plants order.
  const yours = [...pickedByFamily.keys()].map((id) => {
    const picked = pickedByFamily.get(id)!;
    return {
      id,
      label: pickedLabel(picked),
      pickedNames: picked.map((p) => p.name),
      signal: byFamily.get(id) ?? null,
    };
  });
  const others = reported.filter((f) => !pickedByFamily.has(f.family));

  if (yours.length === 0 && others.length === 0) {
    return (
      <p className={styles.empty}>
        No reports in <strong>{regionName}</strong> in the last 3 days.
      </p>
    );
  }

  // Just the severity — never the headcount, so a one-person family reads the
  // same as a forty-person one and can't be singled out.
  const chip = (f: RegionFamily) => (
    <span className={styles.chip} data-sev={Math.round(f.avgSeverity)}>
      {f.avgSeverity.toFixed(1)}/6
    </span>
  );

  return (
    <div className={styles.panel}>
      {yours.length > 0 && (
        <section className={styles.yours}>
          <p className={styles.heading}>
            Results mathing the plants you picked in {regionName}, from the last
            3 days
          </p>
          <ul className={styles.list}>
            {yours.map(({ id, label, pickedNames, signal }) => (
              <li key={id} className={styles.row}>
                <span className={styles.family}>
                  <span className={styles.familyName}>
                    {label} <span className={styles.sci}>({sci(id)})</span>
                  </span>
                  {membersLine(id, { exclude: pickedNames, prefix: "also " })}
                </span>
                {signal ? (
                  chip(signal)
                ) : (
                  <span className={styles.quiet}>no reports yet</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <p className={styles.heading}>
            {yours.length > 0
              ? `Also reported in ${regionName}, last 3 days`
              : `Reported in ${regionName}, last 3 days`}
          </p>
          <ul className={styles.list}>
            {others.map((f) => (
              <li key={f.family} className={styles.row}>
                <span className={styles.family}>
                  <span className={styles.familyName}>
                    {membersByFamily.has(f.family) ? sci(f.family) : f.label}
                  </span>
                  {membersLine(f.family)}
                </span>
                {chip(f)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
