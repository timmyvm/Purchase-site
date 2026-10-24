"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/app/lib/currency";
import { SHIPPING_FACTS } from "@/app/lib/shipping";

type Props = {
  subtotal: number;
};

// One threshold, one bar: the push is toward free shipping (SHIPPING_FACTS).
export const FreeShippingProgress = ({ subtotal }: Props) => {
  const threshold = SHIPPING_FACTS.freeThresholdAud;
  const reached = subtotal >= threshold;
  const progress = Math.min(subtotal / threshold, 1);
  const remaining = reached ? null : formatMoney(threshold - subtotal);

  const [celebrating, setCelebrating] = useState(false);
  const prevReachedRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevReachedRef.current === null) {
      prevReachedRef.current = reached;
      return;
    }
    if (prevReachedRef.current !== reached && reached) {
      setCelebrating(true);
      const id = window.setTimeout(() => setCelebrating(false), 900);
      prevReachedRef.current = reached;
      return () => window.clearTimeout(id);
    }
    prevReachedRef.current = reached;
  }, [reached]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 min-h-[18px]">
        {reached ? (
          <svg
            className="h-3.5 w-3.5 shrink-0 text-green-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        ) : null}
        <p
          className={`text-xs leading-tight transition-colors duration-300 ${
            reached
              ? "font-semibold text-green-500"
              : "text-[color:var(--color-ink-muted)]"
          } ${celebrating ? "animate-pulse" : ""}`}
        >
          {reached
            ? "You've got free shipping! 🎉"
            : `Add ${remaining!} more for free shipping`}
        </p>
      </div>

      <progress
        value={Math.round(progress * 100)}
        max={100}
        aria-label="Free shipping progress"
        className={`block h-1.5 w-full appearance-none overflow-hidden rounded-full bg-[color:var(--color-border)] [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-[color:var(--color-border)] [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-[width] [&::-webkit-progress-value]:duration-500 ${
          reached
            ? "[&::-moz-progress-bar]:bg-green-500 [&::-webkit-progress-value]:bg-green-500"
            : "[&::-moz-progress-bar]:bg-[color:var(--color-primary)] [&::-webkit-progress-value]:bg-[color:var(--color-primary)]"
        } ${celebrating ? "animate-[shimmer_0.9s_ease-out]" : ""}`}
      />
    </div>
  );
};
