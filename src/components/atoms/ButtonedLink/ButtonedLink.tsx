import { Link, type LinkProps } from "react-router-dom";
import btn from "../Button/Button.module.css";

type Props = LinkProps & {
  variant?: "primary" | "ghost" | "subtle";
};

/**
 * A router `Link` that looks like a `Button`. Same visual styles as the Button
 * atom (single source of truth in Button.module.css), but it navigates instead
 * of firing an onClick — for "go to this page" actions.
 */
export function ButtonedLink({ variant = "primary", className, ...props }: Props) {
  return (
    <Link
      className={[btn.btn, btn[variant], className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
