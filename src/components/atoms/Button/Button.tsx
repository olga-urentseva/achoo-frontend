import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", type = "button", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[styles.btn, styles[variant], className].filter(Boolean).join(" ")}
      {...props}
    />
  );
});
