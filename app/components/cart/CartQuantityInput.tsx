"use client";

import { useEffect, useState } from "react";
import { Input } from "@/app/components/ui/Input";

type CartQuantityInputProps = {
  value: number;
  max?: number;
  ariaLabel: string;
  className?: string;
  onCommit: (quantity: number) => void;
};

const normalizeQuantity = (value: string, max?: number) => {
  if (!value.trim()) return null;
  if (typeof max === "number" && max < 1) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  const clamped = typeof max === "number" ? Math.min(parsed, max) : parsed;
  return Math.max(1, clamped);
};

export const CartQuantityInput = ({
  value,
  max,
  ariaLabel,
  className = "",
  onCommit,
}: CartQuantityInputProps) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitDraft = () => {
    const nextQuantity = normalizeQuantity(draft, max);
    if (nextQuantity === null) {
      setDraft(String(value));
      return;
    }

    setDraft(String(nextQuantity));
    if (nextQuantity !== value) {
      onCommit(nextQuantity);
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={draft}
      aria-label={ariaLabel}
      onChange={(event) => {
        const nextValue = event.target.value.replace(/[^\d]/g, "");
        setDraft(nextValue);
      }}
      onBlur={commitDraft}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          commitDraft();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setDraft(String(value));
        }
      }}
      className={className}
    />
  );
};
