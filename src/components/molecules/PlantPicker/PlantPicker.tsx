import { useId, useState } from "react";
import type { DisplayGroup, Plant } from "../../../types";
import styles from "./PlantPicker.module.css";

type Props = {
  /** All selectable plants (from /meta). */
  plants: Plant[];
  /** Friendly umbrella groups some plants fold into (from /meta). */
  displayGroups: DisplayGroup[];
  /** Currently selected plant ids. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Dim and lock the whole picker (e.g. while "I don't know" is checked). */
  disabled?: boolean;
  /** id of the element that labels the group (for WCAG). */
  labelledBy?: string;
};

/**
 * Controlled multi-select of plant chips. Featured plants and the friendly
 * group chips (grasses, cypress) show up front; the long tail lives behind a
 * "show more" expander. A group chip selects all its members at once — they
 * all map to one family anyway, and within these families the species
 * distinction is meaningless to a patient. Selection order follows the
 * `plants` list, so the saved profile stays stable.
 */
export function PlantPicker({
  plants,
  displayGroups,
  value,
  onChange,
  disabled = false,
  labelledBy,
}: Props) {
  const [showOther, setShowOther] = useState(false);
  const otherId = useId();

  const selected = new Set(value);

  // Keep emitted order aligned with `plants` so localStorage stays stable.
  function setSelected(next: Set<string>) {
    onChange(plants.filter((p) => next.has(p.id)).map((p) => p.id));
  }

  // Toggle one or many ids as a unit (a group chip flips all its members).
  function toggle(ids: string[]) {
    const next = new Set(selected);
    const on = ids.some((id) => next.has(id));
    for (const id of ids) {
      if (on) next.delete(id);
      else next.add(id);
    }
    setSelected(next);
  }

  const featured = plants.filter((p) => p.featured && !p.displayGroup);
  const other = plants.filter((p) => !p.featured && !p.displayGroup);
  const groups = displayGroups
    .map((g) => ({ group: g, members: plants.filter((p) => p.displayGroup === g.id) }))
    .filter((g) => g.members.length > 0);

  function chip(key: string, label: string, ids: string[], title?: string) {
    return (
      <label key={key} className={styles.chip}>
        <input
          className={styles.input}
          type="checkbox"
          checked={ids.some((id) => selected.has(id))}
          onChange={() => toggle(ids)}
          disabled={disabled}
        />
        <span className={styles.face} title={title}>
          {label}
        </span>
      </label>
    );
  }

  return (
    <div
      className={styles.picker}
      role="group"
      aria-labelledby={labelledBy}
      aria-disabled={disabled || undefined}
    >
      <div className={styles.grid}>
        {featured.map((p) => chip(p.id, p.name, [p.id], p.scientificName))}
        {groups.map(({ group, members }) =>
          chip(group.id, group.label, members.map((m) => m.id)),
        )}
      </div>

      {other.length > 0 && (
        <div className={styles.group}>
          <button
            type="button"
            className={styles.more}
            aria-expanded={showOther}
            aria-controls={otherId}
            onClick={() => setShowOther((v) => !v)}
            disabled={disabled}
          >
            {showOther ? "Show fewer plants" : `Show ${other.length} more plants…`}
          </button>
          {showOther && (
            <div id={otherId} className={styles.grid}>
              {other.map((p) => chip(p.id, p.name, [p.id], p.scientificName))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
