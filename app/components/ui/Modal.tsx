"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useScrollLock } from "@/app/hooks/useScrollLock";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  showClose?: boolean;
  closeOnEscape?: boolean;
  children: ReactNode;
};

export const Modal = ({
  open,
  title,
  onClose,
  showClose = true,
  closeOnEscape = true,
  children,
}: ModalProps) => {
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, closeOnEscape]);

  useScrollLock(open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex min-h-screen items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />
      <div className="relative w-full max-w-lg">
        <div className="pointer-events-auto max-h-[80vh] overflow-y-auto rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-4 sm:p-6 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="modal-title"
              className="font-display text-lg font-semibold text-[color:var(--color-ink)] sm:text-xl"
            >
              {title}
            </h2>
            {showClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
              >
                X
              </button>
            ) : null}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
