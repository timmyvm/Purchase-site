"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/app/components/ui/Container";

type EmailCaptureSectionProps = {
  id?: string;
  /** sticker_subscribers.source, so signups trace back to the page. */
  source?: string;
};

/**
 * "Get drop alerts" band (port of APL's EmailCaptureSection): one email
 * field, an orange Subscribe (a primary CTA). Posts /api/subscribe.
 */
export const EmailCaptureSection = ({ id, source = "home" }: EmailCaptureSectionProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting" || !email.trim()) return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source }),
      });
      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !payload?.ok) throw new Error(payload?.error ?? "Unable to sign you up right now.");
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to sign you up right now.");
    }
  };

  const inputId = `${id ?? "drop-alerts"}-email`;

  return (
    <section
      id={id}
      className="scroll-mt-24 border-y border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)]"
    >
      <Container className="py-14 text-center sm:py-16">
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)] sm:text-3xl">
          Get drop alerts
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
          Every design is a single limited run. Leave your email to hear when the
          next drop goes on sale.
        </p>

        {status === "done" ? (
          <p
            role="status"
            className="mx-auto mt-6 max-w-md rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]"
          >
            You&apos;re on the list. We&apos;ll email you when the next drop goes on sale.
          </p>
        ) : (
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mx-auto mt-6 flex w-full max-w-md flex-col gap-2 sm:flex-row"
          >
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <input
              id={inputId}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              className="h-14 min-w-0 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-subtle)] focus:border-[color:var(--color-primary-soft)] focus:outline-none sm:h-12 sm:flex-1 sm:text-sm"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex h-14 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-highlight)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.65)] transition hover:bg-[color:var(--color-highlight-strong)] active:translate-y-px disabled:opacity-60 sm:h-12"
            >
              {status === "submitting" ? "…" : "Subscribe"}
            </button>
          </form>
        )}
        {status === "error" && message ? (
          <p role="alert" className="mt-2 text-xs text-[color:var(--color-danger)]">
            {message}
          </p>
        ) : null}
        <p className="mt-3 text-[11px] text-[color:var(--color-ink-subtle)]">
          Drop alerts only. No spam.
        </p>
      </Container>
    </section>
  );
};
