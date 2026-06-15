import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./IconButton.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Required: an icon-only button has no visible text, so it must be labelled
   * for screen readers (WCAG 4.1.2). */
  "aria-label": string;
};

/** A small, round, icon-only button (info triggers, close buttons). Children are
 * the icon (an SVG or glyph); the label comes from the required `aria-label`. */
export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton({ type = "button", className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={[styles.iconBtn, className].filter(Boolean).join(" ")}
        {...props}
      />
    );
  },
);
