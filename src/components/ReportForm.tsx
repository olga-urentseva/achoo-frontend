import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { Meta, Place } from "../api/types";
import { hasReportedToday, markReported } from "../lib/throttle";
import { PlaceSearch } from "./PlaceSearch";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "throttled" }
  | { kind: "error"; message: string };

export function ReportForm() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [place, setPlace] = useState<Place | null>(null);
  const [allergen, setAllergen] = useState("");
  const [severity, setSeverity] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    api
      .getMeta()
      .then((m) => {
        setMeta(m);
        setAllergen(m.allergens[0] ?? "");
      })
      .catch(() => setStatus({ kind: "error", message: "Couldn't reach the server" }));
  }, []);

  if (!meta) {
    return <p className="hint">loading…</p>;
  }

  if (status.kind === "success") {
    return (
      <div className="card">
        <h2 className="done-title">Thanks! 🤧</h2>
        <p>
          Your report for <strong>{place?.region.name}</strong> was recorded.
        </p>
        <p className="muted">Come back tomorrow to log again.</p>
        <button
          className="btn"
          onClick={() => {
            setStatus({ kind: "idle" });
            setPlace(null);
            setSeverity(null);
          }}
        >
          Log another region
        </button>
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
      await api.createReport({ placeId: place.placeId, allergen, severity });
      markReported(place.region.id);
      setStatus({ kind: "success" });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Something went wrong";
      setStatus({ kind: "error", message });
    }
  }

  const severities = Array.from(
    { length: meta.severity.max - meta.severity.min + 1 },
    (_, i) => meta.severity.min + i,
  );

  return (
    <div className="card">
      <label className="label">Where are you?</label>
      <PlaceSearch
        onSelect={(p) => {
          setPlace(p);
          setStatus({ kind: "idle" });
        }}
      />
      {place && (
        <p className="resolved">
          Reporting under <strong>{place.region.name}</strong>, {place.region.country}
        </p>
      )}

      <label className="label">Allergen</label>
      <select
        className="input"
        value={allergen}
        onChange={(e) => setAllergen(e.target.value)}
      >
        {meta.allergens.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <label className="label">
        How bad is it? ({meta.severity.min}–{meta.severity.max})
      </label>
      <div className="severity">
        {severities.map((n) => {
          const hue = severityHue(n, meta.severity.max);
          const selected = severity === n;
          return (
            <button
              key={n}
              type="button"
              className={`sev ${selected ? "sev-on" : ""}`}
              style={
                selected
                  ? { background: hue, borderColor: hue }
                  : { borderColor: hue, color: hue }
              }
              onClick={() => setSeverity(n)}
            >
              {n}
            </button>
          );
        })}
      </div>

      {status.kind === "throttled" && (
        <p className="error">You already reported for this region today. 🙌</p>
      )}
      {status.kind === "error" && <p className="error">{status.message}</p>}

      <button className="btn" disabled={!canSubmit} onClick={submit}>
        {status.kind === "submitting" ? "Submitting…" : "Submit report"}
      </button>
    </div>
  );
}

/** Green (low) → red (high) hue for the severity buttons. */
function severityHue(n: number, max: number): string {
  const t = (n - 1) / Math.max(1, max - 1);
  return `hsl(${Math.round(120 - 120 * t)} 70% 45%)`;
}
