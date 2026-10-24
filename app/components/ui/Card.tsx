import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className = "", ...props }: CardProps) => (
  <div
    className={`rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--color-primary-soft)] hover:shadow-card ${className}`}
    {...props}
  />
);

