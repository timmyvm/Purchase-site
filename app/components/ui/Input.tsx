import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-base sm:text-sm text-[color:var(--color-ink)] shadow-none transition focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] ${className}`}
      {...props}
    />
  )
);

Input.displayName = "Input";
