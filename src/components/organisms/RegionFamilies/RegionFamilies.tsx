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
 * only the region id goes to the server. Hovering a family tag reveals the rest
 * of the plants in it.
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

  // Tooltip text for a family tag: the other plants in the family. If the user
  // already picked them all (e.g. via the cypress/grass group chip), there's no
  // "rest" — fall back to the full member list so every tag still has a tooltip.
  const familyTip = (familyId: string, picked: string[] = []): string => {
    const members = membersByFamily.get(familyId) ?? [];
    const rest = members.filter((n) => !picked.includes(n));
    if (rest.length) return `Also in this family: ${rest.join(", ")}`;
    if (members.length) return `Plants in this family: ${members.join(", ")}`;
    return "";
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

  // The family tag, with a tooltip (hover + keyboard focus) of the other plants.
  const familyTag = (text: string, tip: string) =>
    tip ? (
      <span className={styles.tagWrap}>
        <span className={styles.tag} tabIndex={0}>
          {text}
        </span>
        <span className={styles.tip} role="tooltip">
          {tip}
        </span>
      </span>
    ) : (
      <span className={styles.tag}>{text}</span>
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
                  {label}{" "}
                  {familyTag(`(${sci(id)})`, familyTip(id, pickedNames))}
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
                  {familyTag(
                    membersByFamily.has(f.family) ? sci(f.family) : f.label,
                    familyTip(f.family),
                  )}
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
