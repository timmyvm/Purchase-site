"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/app/components/ui/Button";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";

type DropAlertFormProps = {
  productSlug: string;
};

/**
 * Sold-out state of the product hero (port of APL's out-of-stock form). A
 * sold-out design is retired, not restocked, so this signs up for the NEXT
 * drop rather than promising this one back. Posts /api/subscribe with
 * source "sold-out:<slug>" so signups can be traced to the design.
 */
export const DropAlertForm = ({ productSlug }: DropAlertFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: `sold-out:${productSlug}` }),
      });
      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !payload?.ok) throw new Error(payload?.error ?? "Something went wrong. Please try again.");
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "done") {
    return (
      <div className="flex min-h-[52px] w-full items-center justify-center rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 text-center text-sm text-[color:var(--color-ink-muted)]">
        You&apos;re on the list. We&apos;ll email you when the next drop goes on sale.
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink-subtle)]">
        Sold out · Get drop alerts
      </p>
      <p className="text-xs leading-relaxed text-[color:var(--color-ink-muted)] sm:text-[13px]">
        This run has sold out and the design won&apos;t be reprinted. Unpaid orders
        are cancelled after {UNPAID_ORDER_HOURS} hours, so a copy can come back on
        sale. Leave your email to hear when the next drop is out.
      </p>
      <div className="flex gap-2">
        <label htmlFor={`drop-alert-${productSlug}`} className="sr-only">
          Email address
        </label>
        <input
          id={`drop-alert-${productSlug}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          className="h-[52px] min-w-0 flex-1 rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-subtle)] focus:border-[color:var(--color-primary-soft)] focus:outline-none sm:text-sm"
        />
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="h-[52px] shrink-0 rounded-[1.25rem] px-5 text-sm shadow-card"
        >
          {status === "submitting" ? "…" : "Notify me"}
        </Button>
      </div>
      {status === "error" && message ? (
        <p className="text-xs text-[color:var(--color-danger)]">{message}</p>
      ) : null}
    </form>
  );
};
