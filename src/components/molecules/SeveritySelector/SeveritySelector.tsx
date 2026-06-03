import styles from "./SeveritySelector.module.css";

type Props = {
  min: number;
  max: number;
  value: number | null;
  onChange: (n: number) => void;
};

/** Green (mild) → red (severe) OKLCH hue for the given step. */
export function severityColor(n: number, min: number, max: number): string {
  const t = (n - min) / Math.max(1, max - min);
  const hue = Math.round(150 - 125 * t);
  return `oklch(0.68 0.17 ${hue})`;
}

export function SeveritySelector({ min, max, value, onChange }: Props) {
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className={styles.row} role="group" aria-label={`Severity, ${min} to ${max}`}>
      {steps.map((n) => {
        const color = severityColor(n, min, max);
        const selected = value === n;
        return (
          <button
            key={n}
            type="button"
            className={`${styles.sev} ${selected ? styles.on : ""}`}
            style={
              selected
                ? { background: color, borderColor: color }
                : { borderColor: color, color }
            }
            aria-pressed={selected}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
