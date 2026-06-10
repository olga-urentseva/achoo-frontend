import { startTransition, useActionState } from "react";
import getNearestPlace from "../../../api/getNearestPlace";
import { getCurrentPosition } from "../../../lib/geolocation";
import { PlaceSearch } from "../../molecules/PlaceSearch/PlaceSearch";
import { Button } from "../../atoms/Button/Button";
import type { Place } from "../../../types";
import styles from "./LocationPicker.module.css";

/** Past this distance the nearest city isn't really "yours" (seed RADIUS_KM). */
const FAR_KM = 100;

type Props = {
  value: Place | null;
  onSelect: (place: Place) => void;
};

type State = { error: string } | { farKm: number } | null;

export function LocationPicker({ value, onSelect }: Props) {
  // One action covers both ways to set a location: geolocation ("geo") and a
  // manual search result. It owns pending, the error, and the "far away" hint —
  // so the component holds no state of its own.
  const [state, run, busy] = useActionState<State, Place | "geo">(
    async (_prev, payload) => {
      if (payload !== "geo") {
        onSelect(payload);
        return null;
      }
      try {
        const { lat, lng } = await getCurrentPosition();
        const place = await getNearestPlace(lat, lng);
        onSelect(place);
        return place.distanceKm > FAR_KM ? { farKm: place.distanceKm } : null;
      } catch (e) {
        const reason =
          e instanceof Error ? e.message : "Couldn't find your area.";
        return { error: `${reason} Search for your city instead.` };
      }
    },
    null,
  );

  const error = state && "error" in state ? state.error : null;
  const farKm = state && "farKm" in state ? state.farKm : null;

  return (
    <div className={styles.card}>
      <p className={styles.label}>Where are you?</p>

      <PlaceSearch
        initialPlace={value}
        onSelect={(place) => startTransition(() => run(place))}
      />

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <div className={styles.locate}>
        <Button
          variant="subtle"
          disabled={busy}
          onClick={() => startTransition(() => run("geo"))}
        >
          {busy ? "Locating…" : "Use my location"}
        </Button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {value && (
        <p className={styles.current}>
          {farKm !== null && (
            <span className={styles.far}>
              {" "}
              · nearest city, {Math.round(farKm)} km away
            </span>
          )}
        </p>
      )}
    </div>
  );
}
