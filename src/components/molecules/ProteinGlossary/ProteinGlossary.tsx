import styles from "./ProteinGlossary.module.css";

/**
 * Plain-language definitions of the Type / Strength values shown in a
 * `ProteinsTable`. Shared by the Allergens page and the severity explainer so a
 * reader who doesn't know what "panallergen" or "weak" means can find out once.
 */
export function ProteinGlossary() {
  return (
    <dl className={styles.glossary}>
      <dt>Type</dt>
      <dd>
        <strong>Major</strong> — the main protein people react to in a plant.{" "}
        <strong>Panallergen</strong> — a protein shared across many unrelated
        plants, so it links allergies broadly but usually more weakly.
      </dd>
      <dt>Strength</dt>
      <dd>
        How likely reacting to one plant means reacting to the others that carry
        the protein: <strong>strong</strong>, <strong>moderate</strong> or{" "}
        <strong>weak</strong>.
      </dd>
    </dl>
  );
}
