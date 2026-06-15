import styles from "./ProteinsTable.module.css";

export type ProteinRow = {
  /** Stable key (the protein id). */
  protein: string;
  name: string;
  kind: "major" | "panallergen";
  strength: "strong" | "moderate" | "weak";
  /** Free text for the final, caller-specific column (e.g. carrier plants). */
  carriers: string;
};

type Props = {
  rows: ProteinRow[];
  /** Header for the final column — its meaning differs per caller. */
  carriersLabel: string;
};

/**
 * Cross-reactivity proteins as a labelled table: name, type (major/panallergen),
 * strength, and a context column. Shared by the Allergens page and the severity
 * explainer so the columns and badges stay identical — pair it with
 * `ProteinGlossary`, which defines the Type/Strength values.
 */
export function ProteinsTable({ rows, carriersLabel }: Props) {
  return (
    <table className={styles.table}>
      {/* Fixed widths so columns line up across every table on the page. */}
      <colgroup>
        <col className={styles.colName} />
        <col className={styles.colType} />
        <col className={styles.colStrength} />
        <col className={styles.colCarriers} />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Protein</th>
          <th scope="col">Type</th>
          <th scope="col">Strength</th>
          <th scope="col">{carriersLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.protein}>
            <th scope="row" className={styles.proteinName}>
              {r.name}
            </th>
            <td>
              <span className={styles.kind} data-kind={r.kind}>
                {r.kind}
              </span>
            </td>
            <td>
              <span className={styles.strength} data-strength={r.strength}>
                {r.strength}
              </span>
            </td>
            <td className={styles.carriers}>{r.carriers}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
