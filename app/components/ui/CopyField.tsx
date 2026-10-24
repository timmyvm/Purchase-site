"use client";

import { useState } from "react";
import { copyToClipboard } from "@/app/lib/clipboard";

type CopyFieldProps = {
  label: string;
  value: string;
  /** Monospaced + tracked out — right for codes, wrong for long URLs. */
  emphasis?: boolean;
  onCopied?: () => void;
};

/**
 * A value with a one-tap copy button. The whole row is the target so a thumb
 * can't miss it.
 */
export const CopyField = ({
  label,
  value,
  emphasis = false,
  onCopied,
}: CopyFieldProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    onCopied?.();
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-[color:var(--color-border-soft)] bg-[color:var(--color-surface)] px-4 py-3 text-left transition hover:border-[color:var(--color-primary)]"
    >
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
          {label}
        </span>
        <span
          className={
            emphasis
              ? "block font-mono text-lg font-bold tracking-[0.14em] text-[color:var(--color-ink)]"
              : "block truncate font-mono text-xs text-[color:var(--color-ink)]"
          }
        >
          {value}
        </span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-[color:var(--color-primary)]">
        {copied ? "Copied ✓" : "Copy"}
      </span>
    </button>
  );
};
