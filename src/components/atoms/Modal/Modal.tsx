import { useEffect, useId, useRef, type ReactNode } from "react";
import { IconButton } from "../IconButton/IconButton";
import styles from "./Modal.module.css";

type Props = {
  open: boolean;
  /** Called on every dismissal — the close button, Escape, or a backdrop click.
   * The parent owns `open`, so it must flip it here. */
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * A modal dialog built on the native `<dialog>` element. `showModal()` gives us
 * focus trapping, focus return, Escape-to-close, an inert background and
 * top-layer rendering (no portal, no z-index) for free — so this stays a thin
 * presentational shell. Content is passed as children; data fetching lives in
 * the organism that fills it.
 */
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Drive the native dialog from the `open` prop. `showModal()`/`close()` are
  // idempotent-guarded so re-renders don't re-open or re-close.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      // Fires for any native close, including Escape — keeps `open` in sync.
      onClose={onClose}
      // A click whose point lies outside the dialog box is a backdrop click
      // (the backdrop is part of the dialog, so it targets this element).
      onClick={(event) => {
        const dialog = ref.current;
        if (!dialog) return;
        const r = dialog.getBoundingClientRect();
        const outside =
          event.clientX < r.left ||
          event.clientX > r.right ||
          event.clientY < r.top ||
          event.clientY > r.bottom;
        if (outside) onClose();
      }}
    >
      <div className={styles.body}>
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </dialog>
  );
}
