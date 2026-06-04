import { use, useActionState, useId, useOptimistic } from "react";
import getMeta from "../../../api/getMeta";
import createReport from "../../../api/createReport";
import { ApiError } from "../../../lib/http";
import { hasReportedToday, markReported } from "../../../lib/throttle";
import { SeveritySelector } from "../../molecules/SeveritySelector/SeveritySelector";
import { Button } from "../../atoms/Button/Button";
import { Select } from "../../atoms/Select/Select";
import type { Place } from "../../../types";
import styles from "./ReportForm.module.css";

type Result = { ok: true } | { ok: false; error: string } | null;

type Props = {
  /** Location chosen upstream — supplies the placeId to report under. */
  place: Place;
};

export function ReportForm({ place }: Props) {
  // /meta is the source of truth for allergens + severity range.
  const meta = use(getMeta());

  const allergenId = useId();
  const severityId = useId();
  const errorId = useId();

  // Flip to the "thanks" view the instant we submit; reverts if the action fails.
  const [submitted, showSubmitted] = useOptimistic(false, () => true);

  const [result, action, pending] = useActionState<Result, FormData>(
    async (_prev, formData) => {
      const allergen = String(formData.get("allergen") ?? "");
      const severity = Number(formData.get("severity") ?? 0);

      if (!allergen || !severity) {
        return { ok: false, error: "Pick an allergen and how bad it is." };
      }
      if (hasReportedToday(place.region.id)) {
        return {
          ok: false,
          error: "You already reported for this region today. 🙌",
        };
      }

      showSubmitted(true);
      try {
        await createReport({ placeId: place.placeId, allergen, severity });
        markReported(place.region.id);
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof ApiError ? e.message : "Something went wrong",
        };
      }
    },
    null,
  );

  if (submitted || result?.ok) {
    return (
      <div className={styles.card} aria-live="polite">
        <h2 className={styles.doneTitle}>Thanks! 🤧</h2>
        <p>
          Your report for <strong>{place.region.name}</strong> was recorded.
        </p>
        <p className={styles.muted}>Come back tomorrow to log again.</p>
      </div>
    );
  }

  const error = result && !result.ok ? result.error : null;

  return (
    <form className={styles.card} action={action}>
      <h2 className={styles.title}>Add your report</h2>
      <p className={styles.resolved}>
        Reporting under <strong>{place.region.name}</strong>,{" "}
        {place.region.country}
      </p>

      <label className={styles.label} htmlFor={allergenId}>
        Allergen
      </label>
      <Select
        id={allergenId}
        name="allergen"
        defaultValue={meta.allergens[0] ?? ""}
      >
        {meta.allergens.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </Select>

      <p className={styles.label} id={severityId}>
        How bad is it? ({meta.severity.min}–{meta.severity.max})
      </p>
      <SeveritySelector
        name="severity"
        min={meta.severity.min}
        max={meta.severity.max}
        labelledBy={severityId}
      />

      {error && (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        aria-describedby={error ? errorId : undefined}
      >
        {pending ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
