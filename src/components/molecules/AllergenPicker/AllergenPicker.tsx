import styles from "./AllergenPicker.module.css";

type Props = {
  /** All selectable allergens (from /meta). */
  options: string[];
  /** Currently selected allergens. */
  value: string[];
  onChange: (next: string[]) => void;
  /** Display overrides keyed by option value (e.g. unknown → "Don't know"). */
  labels?: Record<string, string>;
  /** id of the element that labels the group (for WCAG). */
  labelledBy?: string;
};

/**
 * Controlled multi-select of allergen chips (checkboxes styled as toggles).
 * Selection order follows `options`, so the saved profile stays stable.
 */
export function AllergenPicker({
  options,
  value,
  onChange,
  labels,
  labelledBy,
}: Props) {
  const selected = new Set(value);

  function toggle(allergen: string) {
    const next = new Set(selected);
    if (next.has(allergen)) next.delete(allergen);
    else next.add(allergen);
    onChange(options.filter((o) => next.has(o)));
  }

  return (
    <div className={styles.grid} role="group" aria-labelledby={labelledBy}>
      {options.map((allergen) => (
        <label key={allergen} className={styles.chip}>
          <input
            className={styles.input}
            type="checkbox"
            checked={selected.has(allergen)}
            onChange={() => toggle(allergen)}
          />
          <span className={styles.face}>{labels?.[allergen] ?? allergen}</span>
        </label>
      ))}
    </div>
  );
}
