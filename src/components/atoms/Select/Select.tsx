import { forwardRef, type SelectHTMLAttributes } from "react";
import styles from "./Select.module.css";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={[styles.select, className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </select>
  );
});
