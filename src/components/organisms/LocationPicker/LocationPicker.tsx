import { PlaceSearch } from "../../molecules/PlaceSearch/PlaceSearch";
import type { Place } from "../../../types";
import styles from "./LocationPicker.module.css";

type Props = {
  value: Place | null;
  onSelect: (place: Place) => void;
};

export function LocationPicker({ value, onSelect }: Props) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>Where are you?</p>
      <PlaceSearch initialPlace={value} onSelect={onSelect} />

      {/* When the picked city rolls up into a different region, say so — that
          region (not the city) is what the map shows and reports go under — and
          give the one-line reason so it reads as intentional, not imprecise. */}
      {value && value.region.name !== value.name && (
        <p className={styles.region}>
          Reporting under <strong>{value.region.name}</strong> — pollen travels
          long distances, so nearby cities share one regional reading.
        </p>
      )}
    </div>
  );
}
