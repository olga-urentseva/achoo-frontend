import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../atoms/Button/Button";
import { clearStoredData } from "../../../lib/clearData";
import styles from "./AboutPage.module.css";

/**
 * Plain-language explainer: what achoo is, why it's anonymous, where your data
 * lives (your browser, deletable right here), and the medical-advice caveat.
 * Static content — no `use`, no fetch.
 */
export function AboutPage() {
  // Two-step clear so a stray tap can't wipe someone's data by accident.
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState(false);

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearStoredData();
    setConfirming(false);
    setCleared(true);
  }

  return (
    <article className={styles.page}>
      <Link to="/" className={styles.back}>
        ← Back
      </Link>

      <h2 className={styles.title}>About achoo</h2>
      <p className={styles.intro}>
        achoo is a community-based, anonymous map of what people are reacting to,
        right now, where they are. You share how bad your allergies feel today;
        in return you see what others nearby are reporting. That's the whole
        deal — neighbours helping neighbours read the air.
      </p>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Anonymous &amp; transparent</h3>
        <p className={styles.text}>
          There are no accounts, no logins, and no tracking. Every report is
          recorded against a <em>region</em> and a date — never against you. We
          don't know who you are, and we'd like to keep it that way.
        </p>
        <p className={styles.text}>
          Regions are deliberately coarse. Each one is centred on a major city,
          and they sit roughly <strong>100&nbsp;km</strong> apart — about how far
          pollen travels — so a smaller town's reports roll up into the nearest
          one. A report only ever says “somewhere in this area,” never your exact
          spot.
        </p>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>What stays private, and what you share</h3>
        <p className={styles.text}>
          <strong>Kept only on this device:</strong> the plants you react to,
          the places you've chosen, and a note of where you've already reported
          today. These live in your browser's local storage so the form
          remembers you and your results show up here — they're never uploaded.
        </p>
        <p className={styles.text}>
          <strong>Shared, anonymously:</strong> when you file a report, it is
          sent to us and stored — so it can become part of the shared map. A
          stored report is only the <em>region</em>, how bad you felt
          (severity), the date, and which plant <em>families</em> were involved.
          The exact city you pick is used just to find your region and isn't
          kept; your specific plants are collapsed into families and counted,
          never tied to you. There's no account, no name, no precise location.
        </p>
        <p className={styles.text}>
          The button below erases everything achoo saved on this device — your
          plants, places, and report history. Anonymous reports already on the
          map stay there: nothing links them to you, so there's nothing about
          you to remove.
        </p>

        <div className={styles.clearRow}>
          <Button
            variant={confirming ? "primary" : "subtle"}
            onClick={handleClear}
            disabled={cleared}
          >
            {cleared
              ? "Cleared ✓"
              : confirming
                ? "Tap again to confirm"
                : "Clear everything stored on this device"}
          </Button>
          <span className={styles.clearNote} aria-live="polite">
            {cleared
              ? "Your plants, reports, and saved locations were removed from this device."
              : confirming
                ? "This can't be undone."
                : ""}
          </span>
        </div>
      </section>

      <section className={styles.card} data-accent="warn">
        <h3 className={styles.cardTitle}>Not medical advice</h3>
        <p className={styles.text}>
          achoo is for information only. It is <strong>not</strong> medical
          advice, not a diagnosis, and not a recommendation. If something here
          helps you make sense of a rough allergy day, that's wonderful — but it
          can't replace a professional. When it comes to your health,{" "}
          <strong>talking to your doctor is always the best option</strong>.
        </p>
      </section>

      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Where the science comes from</h3>
        <p className={styles.text}>
          Every bit of allergen analysis in achoo — the botanical families, the
          shared proteins, the cross-reactivity links — comes from the{" "}
          <a href="https://eaaci.org/" target="_blank" rel="noreferrer">
            EAACI
          </a>{" "}
          Molecular Allergology User's Guide (MAUG). It's the reference behind
          the numbers; we don't invent any of it.
        </p>
        <p className={styles.downloads}>
          <a className={styles.download} href="/maug.pdf" download>
            ⬇ Download the MAUG (PDF)
          </a>
        </p>
      </section>

      <aside className={styles.note}>
        <p className={styles.noteLabel}>P.S.</p>
        <p className={styles.noteText}>
          achoo is a personal project. I've struggled with seasonal allergies
          since I was a kid, and I've always been frustrated that there's no
          clear, current picture of what's actually in the air. Measuring pollen
          is genuinely hard — it takes specialised sensors and instruments that
          simply aren't widespread yet.
        </p>
        <p className={styles.noteText}>
          I truly believe science and engineering will close that gap one day,
          and real-time pollen detection will become ordinary. But until then, we
          have each other — and every report you share helps someone nearby
          understand what they're breathing today.
        </p>
        <p className={styles.signature}>— Olga</p>
      </aside>

      <footer className={styles.source}>
        Source:{" "}
        <a href="https://eaaci.org/" target="_blank" rel="noreferrer">
          EAACI Molecular Allergology User's Guide
        </a>
        .
      </footer>
    </article>
  );
}
