import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "cta";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const buttonBaseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-soft)] shadow-soft",
  // CTA (buy-path only): the one place orange lives — Add to Cart, Shop All,
  // checkout. Reserved for actions we want to entice a click on. Everything
  // else stays in the site's blue so orange never becomes a "style".
  cta:
    "bg-[color:var(--color-highlight)] text-white hover:bg-[color:var(--color-highlight-strong)] shadow-[0_10px_24px_-10px_rgba(234,88,12,0.65)]",
  secondary:
    "bg-[color:var(--color-surface-elevated)] text-[color:var(--color-ink)] border border-[color:var(--color-border)] hover:border-[color:var(--color-primary-soft)] hover:bg-[color:var(--color-surface)]",
  ghost:
    "bg-transparent text-[color:var(--color-ink)] border border-transparent hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-elevated)]",
};

export const getButtonClasses = (
  variant: ButtonVariant,
  className = ""
) => `${buttonBaseClasses} ${buttonVariants[variant]} ${className}`;

export const Button = ({
  variant = "primary",
  className = "",
  type,
  ...props
}: ButtonProps) => (
  <button
    type={type ?? "button"}
    className={getButtonClasses(variant, className)}
    {...props}
  />
);

