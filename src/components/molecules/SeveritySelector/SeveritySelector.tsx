import styles from "./SeveritySelector.module.css";

type Props = {
  name: string;
  min: number;
  max: number;
  /** id of the element that labels the group (for WCAG). */
  labelledBy?: string;
};

/**
 * Uncontrolled radio group — the chosen severity rides along in the form's
 * FormData under `name`. Styled as buttons via :checked, no React state.
 */
export function SeveritySelector({ name, min, max, labelledBy }: Props) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div
      className={styles.row}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : `Severity, ${min} to ${max}`}
    >
      {steps.map((n) => (
        <label key={n} className={styles.sev} data-sev={n}>
          <input className={styles.input} type="radio" name={name} value={n} />
          <span className={styles.face}>{n}</span>
        </label>
      ))}
    </div>
  );
}
