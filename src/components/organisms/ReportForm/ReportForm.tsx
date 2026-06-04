import { use, useActionState, useId, useOptimistic } from "react";
import getMeta from "../../../api/getMeta";
import createReport from "../../../api/createReport";
import { ApiError } from "../../../lib/http";
import { hasReportedToday, markReported } from "../../../lib/throttle";
import { AllergenPicker } from "../../molecules/AllergenPicker/AllergenPicker";
import { SeveritySelector } from "../../molecules/SeveritySelector/SeveritySelector";
import { Button } from "../../atoms/Button/Button";
import type { Place } from "../../../types";
import styles from "./ReportForm.module.css";

type Result = { ok: true } | { ok: false; error: string } | null;

type Props = {
  /** Location chosen upstream — supplies the placeId to report under, or null
   * until the user picks a city (the form is shown right away regardless). */
  place: Place | null;
  /** The user's allergens (their saved profile), shown pre-selected. */
  allergens: string[];
  /** Persist a change to the allergen selection (also saved to localStorage). */
  onAllergensChange: (next: string[]) => void;
};

export function ReportForm({ place, allergens, onAllergensChange }: Props) {
  // /meta is the source of truth for the allergen options + severity range.
  const meta = use(getMeta());

  const allergensId = useId();
  const severityId = useId();
  const errorId = useId();

  // Flip to the "thanks" view the instant we submit; reverts if the action fails.
  const [submitted, showSubmitted] = useOptimistic(false, () => true);

  const [result, action, pending] = useActionState<Result, FormData>(
    async (_prev, formData) => {
      const severity = Number(formData.get("severity") ?? 0);

      if (!place) {
        return { ok: false, error: "Pick your location first." };
      }
      if (allergens.length === 0) {
        return { ok: false, error: "Pick your allergens, or “Don't know”." };
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

      // One severity today, shared across every allergen the user has.
      const reports = allergens.map((allergen) => ({ allergen, severity }));

      showSubmitted(true);
      try {
        await createReport({ placeId: place.placeId, reports });
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

      <p className={styles.label} id={allergensId}>
        Your allergens
      </p>
      <AllergenPicker
        options={[...meta.allergens, meta.unknownAllergen]}
        value={allergens}
        onChange={onAllergensChange}
        labels={{ [meta.unknownAllergen]: "Don't know" }}
        labelledBy={allergensId}
      />

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
