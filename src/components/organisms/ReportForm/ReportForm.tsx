import { use, useId, useState } from "react";
import getMeta from "../../../api/getMeta";
import createReport from "../../../api/createReport";
import { ApiError } from "../../../lib/http";
import { hasReportedToday, markReported } from "../../../lib/throttle";
import { PlaceSearch } from "../../molecules/PlaceSearch/PlaceSearch";
import { SeveritySelector } from "../../molecules/SeveritySelector/SeveritySelector";
import { Button } from "../../atoms/Button/Button";
import { Select } from "../../atoms/Select/Select";
import type { Place } from "../../../types";
import styles from "./ReportForm.module.css";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "throttled" }
  | { kind: "error"; message: string };

export function ReportForm() {
  // `use` suspends until the cached /meta promise resolves; PageLayout's
  // <Suspense> shows the fallback, and a rejection bubbles to the ErrorBoundary.
  const meta = use(getMeta());

  const [place, setPlace] = useState<Place | null>(null);
  const [allergen, setAllergen] = useState(meta.allergens[0] ?? "");
  const [severity, setSeverity] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const allergenId = useId();
  const severityId = useId();
  const errorId = useId();

  if (status.kind === "success") {
    return (
      <div className={styles.card}>
        <h2 className={styles.doneTitle}>Thanks! 🤧</h2>
        <p>
          Your report for <strong>{place?.region.name}</strong> was recorded.
        </p>
        <p className={styles.muted}>Come back tomorrow to log again.</p>
        <Button
          onClick={() => {
            setStatus({ kind: "idle" });
            setPlace(null);
            setSeverity(null);
          }}
        >
          Log another region
        </Button>
      </div>
    );
  }

  const canSubmit =
    place !== null &&
    allergen !== "" &&
    severity !== null &&
    status.kind !== "submitting";

  async function submit() {
    if (!place || !allergen || severity === null) return;

    if (hasReportedToday(place.region.id)) {
      setStatus({ kind: "throttled" });
      return;
    }

    setStatus({ kind: "submitting" });
    try {
      await createReport({ placeId: place.placeId, allergen, severity });
      markReported(place.region.id);
      setStatus({ kind: "success" });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Something went wrong";
      setStatus({ kind: "error", message });
    }
  }

  const hasError = status.kind === "throttled" || status.kind === "error";

  return (
    <form
      className={styles.card}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSubmit) submit();
      }}
    >
      <label className={styles.label}>Where are you?</label>
      <PlaceSearch
        onSelect={(p) => {
          setPlace(p);
          setStatus({ kind: "idle" });
        }}
      />
      {place && (
        <p className={styles.resolved}>
          Reporting under <strong>{place.region.name}</strong>, {place.region.country}
        </p>
      )}

      <label className={styles.label} htmlFor={allergenId}>
        Allergen
      </label>
      <Select
        id={allergenId}
        value={allergen}
        onChange={(e) => setAllergen(e.target.value)}
      >
        {meta.allergens.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </Select>

      <label className={styles.label} id={severityId}>
        How bad is it? ({meta.severity.min}–{meta.severity.max})
      </label>
      <SeveritySelector
        min={meta.severity.min}
        max={meta.severity.max}
        value={severity}
        onChange={setSeverity}
      />

      {status.kind === "throttled" && (
        <p className={styles.error} id={errorId} role="alert">
          You already reported for this region today. 🙌
        </p>
      )}
      {status.kind === "error" && (
        <p className={styles.error} id={errorId} role="alert">
          {status.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        aria-describedby={hasError ? errorId : undefined}
      >
        {status.kind === "submitting" ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
