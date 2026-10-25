"use client";

import type { ProductVariant } from "@/app/lib/types";
import { formatMoney, isVariantAvailable } from "@/app/lib/currency";

type SizePickerProps = {
  variants: ProductVariant[];
  selectedId: string | null;
  onSelect: (variantId: string) => void;
};

/**
 * Size buttons (port of APL's variant selector): label + price, a sold-out
 * size disabled and marked as such. No "popular" flag — nothing here is
 * ranked, only described.
 */
export const SizePicker = ({ variants, selectedId, onSelect }: SizePickerProps) => {
  const selected = variants.find((variant) => variant.id === selectedId) ?? null;

  return (
    <div className="space-y-2" role="radiogroup" aria-label="Size">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-ink-subtle)]">
          Size
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-primary-soft)]">
          {selected?.sizeLabel ?? "Select one"}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          const isAvailable = isVariantAvailable(variant);
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelect(variant.id)}
              disabled={!isAvailable}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold leading-none transition sm:text-[13px] ${
                isSelected
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white shadow-soft"
                  : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-ink)]"
              } ${!isAvailable ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <span className="block leading-none">
                {variant.sizeLabel}
                {isAvailable ? "" : " · Sold out"}
              </span>
              <span
                className={`block text-[11px] font-medium leading-none ${
                  isSelected ? "text-white/85" : "text-[color:var(--color-ink-subtle)]"
                }`}
              >
                {formatMoney(variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
