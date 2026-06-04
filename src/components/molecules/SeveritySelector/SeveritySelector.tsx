import type { CSSProperties } from "react";
import styles from "./SeveritySelector.module.css";

type Props = {
  name: string;
  min: number;
  max: number;
  /** id of the element that labels the group (for WCAG). */
  labelledBy?: string;
};

/** Green (mild) → red (severe) OKLCH hue for the given step. */
export function severityColor(n: number, min: number, max: number): string {
  const t = (n - min) / Math.max(1, max - min);
  const hue = Math.round(150 - 125 * t);
  return `oklch(0.68 0.17 ${hue})`;
}

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
        <label
          key={n}
          className={styles.sev}
          style={{ "--sev": severityColor(n, min, max) } as CSSProperties}
        >
          <input className={styles.input} type="radio" name={name} value={n} />
          <span className={styles.face}>{n}</span>
        </label>
      ))}
    </div>
  );
}
