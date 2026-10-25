"use client";

import { useState } from "react";

type FaqItemProps = {
  id: string;
  question: string;
  answer: string;
};

export const FaqItem = ({ id, question, answer }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-soft">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-semibold text-[color:var(--color-ink)]">
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 self-start mt-0.5 items-center justify-center rounded-full border border-[color:var(--color-border)] text-[color:var(--color-ink)] transition ${
            isOpen
              ? "rotate-45 border-[color:var(--color-primary)] bg-[color:var(--color-surface)] text-[color:var(--color-primary)]"
              : "bg-[color:var(--color-surface)]"
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </button>
      <div
        id={`${id}-panel`}
        className={`grid overflow-hidden px-6 transition-all duration-300 ease-out ${
          isOpen
            ? "grid-rows-[1fr] pb-5 opacity-100"
            : "grid-rows-[0fr] pb-0 opacity-0"
        }`}
      >
        <div className="overflow-hidden text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
          {answer}
        </div>
      </div>
    </div>
  );
};
