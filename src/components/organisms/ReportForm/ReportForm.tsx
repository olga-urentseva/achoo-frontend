import { use, useActionState, useId, useOptimistic, useState } from "react";
import getMeta from "../../../api/getMeta";
import createSubmission from "../../../api/createSubmission";
import { ApiError } from "../../../lib/http";
import { hasReportedToday, markReported } from "../../../lib/throttle";
import { PlantPicker } from "../../molecules/PlantPicker/PlantPicker";
import { SeveritySelector } from "../../molecules/SeveritySelector/SeveritySelector";
import { Button } from "../../atoms/Button/Button";
import type { Place } from "../../../types";
import styles from "./ReportForm.module.css";

type Result = { ok: true } | { ok: false; error: string } | null;

type Props = {
  /** Location chosen upstream — supplies the placeId to report under, or null
   * until the user picks a city (the form is shown right away regardless). */
  place: Place | null;
  /** The user's plants (their saved profile), shown pre-selected. */
  plants: string[];
  /** Persist a change to the plant selection (also saved to localStorage). */
  onPlantsChange: (next: string[]) => void;
  /** Fired after a report is stored, so the page can refresh the family panel. */
  onReported?: () => void;
};

export function ReportForm({
  place,
  plants,
  onPlantsChange,
  onReported,
}: Props) {
  // /meta is the source of truth for the plant options + severity range.
  const meta = use(getMeta());

  const plantsId = useId();
  const severityId = useId();
  const errorId = useId();

  // "I don't know what I react to" → reports against the `unknown` family and
  // ignores the plant selection. Transient (a per-day statement, not saved).
  const [unknown, setUnknown] = useState(false);

  // Flip to the "thanks" view the instant we submit; reverts if the action fails.
  const [submitted, showSubmitted] = useOptimistic(false, () => true);

  const [result, action, pending] = useActionState<Result, FormData>(
    async (_prev, formData) => {
      const severity = Number(formData.get("severity") ?? 0);

      if (!place) {
        return { ok: false, error: "Pick your location first." };
      }
      if (!unknown && plants.length === 0) {
        return {
          ok: false,
          error: "Pick the plants you react to, or check “I don't know”.",
        };
      }
      if (!severity) {
        return { ok: false, error: "Pick how bad it is today." };
      }
      if (hasReportedToday(place.region.id)) {
        return {
          ok: false,
          error: "You already reported for this region today. 🙌",
        };
      }

      showSubmitted(true);
      try {
        await createSubmission({
          placeId: place.placeId,
          severity,
          plants: unknown ? [] : plants,
          ...(unknown && { unknown: true }),
        });
        markReported(place.region.id);
        onReported?.();
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
          Your report for <strong>{place?.region.name}</strong> was recorded.
        </p>
        <p className={styles.muted}>Come back tomorrow to log again.</p>
      </div>
    );
  }

  const error = result && !result.ok ? result.error : null;

  return (
    <form className={styles.card} action={action}>
      <h2 className={styles.title}>How do you feel today?</h2>

      <p className={styles.label} id={plantsId}>
        Plants you react to
      </p>
      <PlantPicker
        plants={meta.plants}
        displayGroups={meta.displayGroups}
        value={plants}
        onChange={onPlantsChange}
        disabled={unknown}
        labelledBy={plantsId}
      />

      <label className={styles.unknown}>
        <input
          type="checkbox"
          checked={unknown}
          onChange={(e) => setUnknown(e.target.checked)}
        />
        I don't know what I react to
      </label>

      <p className={styles.label} id={severityId}>
        How bad is it today? ({meta.severity.min}–{meta.severity.max})
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
        disabled={pending || !place}
        aria-describedby={error ? errorId : undefined}
      >
        {pending ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
