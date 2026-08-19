import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "ghost" | "cta" | "secondary";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// Extending ButtonHTMLAttributes means this accepts every normal <button> prop
// (onClick, type, disabled, aria-*, ...) for free — we only add `variant` on top.
export function Button({ variant = "primary", className, ...rest }: Props) {
  const classes = [styles.btn, styles[variant], className].filter(Boolean).join(" ");
  return <button className={classes} {...rest} />;
}
