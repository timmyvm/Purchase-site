"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/Button";
import { Container } from "@/app/components/ui/Container";
import { CONTACT_LIMITS } from "@/app/components/sections/ContactLimits";
import { DAMAGE_CLAIM_WINDOW_DAYS } from "@/app/components/sections/PolicyFacts";
import {
  BUSINESS,
  BUSINESS_DISPATCH_LOCATION,
  BUSINESS_ENTITY_LINE,
} from "@/app/lib/business-identity";
import { DISPATCH_CLAIM_SHORT } from "@/app/lib/shipping";
import { isValidEmail } from "@/app/lib/validators";

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "success" }
  // offerEmail: point at the support inbox (when there is one) as the way
  // round a form that couldn't deliver.
  | { status: "error"; text: string; offerEmail: boolean };

const enquiryItems = [
  "Orders and payment",
  "Shipping and delivery",
  "Damaged or faulty stickers",
  "Designs and drops",
  "General questions",
];

const readJson = async (response: Response): Promise<{ ok?: boolean; error?: string }> => {
  try {
    const parsed: unknown = await response.json();
    return parsed && typeof parsed === "object" ? (parsed as { ok?: boolean; error?: string }) : {};
  } catch {
    return {};
  }
};

const cardClass =
  "rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5";
const labelClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink-subtle)]";
const linkClass =
  "font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline";
const fieldClass =
  "mt-2 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-ink)] shadow-none transition focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] disabled:opacity-60 sm:text-sm";

const SupportEmailLink = () =>
  BUSINESS.email ? (
    <a href={`mailto:${BUSINESS.email}`} className={linkClass}>
      {BUSINESS.email}
    </a>
  ) : null;

export const ContactPageClient = () => {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const [orderNumber, setOrderNumber] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      orderNumber: orderNumber.trim() || undefined,
      message: String(data.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.message) {
      setState({ status: "error", text: "Please fill in your name and message.", offerEmail: false });
      return;
    }
    if (!isValidEmail(payload.email)) {
      setState({ status: "error", text: "Enter a valid email address.", offerEmail: false });
      return;
    }

    setState({ status: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await readJson(response);

      if (response.ok && result.ok) {
        setState({ status: "success" });
        form.reset();
        setOrderNumber("");
        return;
      }
      if (response.status === 503) {
        setState({
          status: "error",
          text: "The contact form isn't available right now.",
          offerEmail: true,
        });
        return;
      }
      setState({
        status: "error",
        text: result.error ?? "We couldn't send your message just now. Please try again.",
        // A validation or rate-limit message is the user's to fix; anything
        // else is ours, so offer the inbox.
        offerEmail: response.status >= 500,
      });
    } catch {
      setState({
        status: "error",
        text: "We couldn't send your message just now. Please try again.",
        offerEmail: true,
      });
    }
  };

  const isSending = state.status === "sending";

  let statusMessage: ReactNode = null;
  if (state.status === "success") {
    statusMessage = "Message sent. We'll reply to you by email.";
  } else if (state.status === "error") {
    statusMessage = (
      <>
        {state.text}{" "}
        {state.offerEmail ? (
          BUSINESS.email ? (
            <>
              You can email us at <SupportEmailLink /> instead.
            </>
          ) : (
            "Please try again later."
          )
        ) : null}
      </>
    );
  }

  // Business details come from the one identity module. Rows that aren't
  // configured are left out, never filled with a placeholder.
  const businessDetails: Array<{ label: string; value: ReactNode }> = [
    { label: "Support", value: "By email only" },
    ...(BUSINESS.email ? [{ label: "Email", value: <SupportEmailLink /> }] : []),
    { label: "Posts from", value: `${BUSINESS_DISPATCH_LOCATION}, ${BUSINESS.dispatchFrom.country}` },
    ...(BUSINESS.legalName ? [{ label: "Legal entity", value: BUSINESS_ENTITY_LINE }] : []),
    ...(BUSINESS.abn ? [{ label: "ABN", value: BUSINESS.abn }] : []),
  ];

  return (
    <section className="bg-transparent py-16 sm:py-20">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h1 className="text-[color:var(--color-ink)]">
              <span className="block font-display text-4xl font-semibold sm:text-5xl">Contact</span>{" "}
              <span className="mt-2 block text-base font-semibold text-[color:var(--color-ink-muted)] sm:text-lg">
                {BUSINESS.tradingName}, {BUSINESS_DISPATCH_LOCATION}
              </span>
            </h1>
            <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
              Questions about an order, a design or shipping? Send us a message and we&apos;ll
              reply by email.
            </p>
            <p className="text-sm font-semibold text-[color:var(--color-ink)]">
              You can contact {BUSINESS.tradingName} about:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-[color:var(--color-ink-muted)]">
              {enquiryItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <section className={cardClass}>
              <h2 className={labelClass}>Order and tracking support</h2>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                <p>
                  If your message is about an order, please include your order number. It starts
                  with S (for example S123456) and is on your order page.
                </p>
                <p>
                  Already ordered? You can{" "}
                  <Link href="/order-status" className={linkClass}>
                    track your order
                  </Link>{" "}
                  any time. Payment, shipping and limited runs are covered in the{" "}
                  <Link href="/faq" className={linkClass}>
                    FAQ
                  </Link>
                  .
                </p>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className={labelClass}>Damaged or faulty stickers</h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                {BUSINESS.email ? (
                  <>
                    Email <SupportEmailLink /> a photo within {DAMAGE_CLAIM_WINDOW_DAYS} days of
                    delivery, with your order number.
                  </>
                ) : (
                  <>
                    Send us a message with your order number within {DAMAGE_CLAIM_WINDOW_DAYS} days
                    of delivery, and we&apos;ll reply so you can send a photo.
                  </>
                )}{" "}
                The{" "}
                <Link href="/refund-policy" className={linkClass}>
                  refund &amp; replacement policy
                </Link>{" "}
                has the details.
              </p>
            </section>

            <section className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 shadow-soft">
              <h2 className={labelClass}>Where we post from</h2>
              <p className="mt-3 text-sm leading-relaxed text-[color:var(--color-ink-muted)]">
                Every order is packed and posted from {BUSINESS_DISPATCH_LOCATION}.{" "}
                {DISPATCH_CLAIM_SHORT}. We ship to Australian addresses only.
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink-subtle)]">
                Business details
              </p>
              <dl className="mt-4 space-y-3 text-sm text-[color:var(--color-ink-muted)]">
                {businessDetails.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4">
                    <dt className="shrink-0 font-semibold text-[color:var(--color-ink)]">{row.label}</dt>
                    <dd className="min-w-0 break-words text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <form
            onSubmit={onSubmit}
            aria-busy={isSending}
            className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 shadow-soft sm:p-8"
          >
            <div className="space-y-6">
              <label className="block text-sm font-medium text-[color:var(--color-ink)]">
                Name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={CONTACT_LIMITS.name}
                  disabled={isSending}
                  placeholder="Your name"
                  className={fieldClass}
                />
              </label>

              <label className="block text-sm font-medium text-[color:var(--color-ink)]">
                Email
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  required
                  maxLength={CONTACT_LIMITS.email}
                  disabled={isSending}
                  placeholder="you@example.com"
                  className={fieldClass}
                />
              </label>

              <label className="block text-sm font-medium text-[color:var(--color-ink)]">
                Order number{" "}
                <span className="font-normal text-[color:var(--color-ink-subtle)]">(optional)</span>
                <input
                  type="text"
                  name="orderNumber"
                  autoComplete="off"
                  maxLength={CONTACT_LIMITS.orderNumber}
                  disabled={isSending}
                  placeholder="e.g. S123456"
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
                  className={fieldClass}
                />
              </label>

              <label className="block text-sm font-medium text-[color:var(--color-ink)]">
                Message
                <textarea
                  name="message"
                  required
                  maxLength={CONTACT_LIMITS.message}
                  disabled={isSending}
                  placeholder="How can we help?"
                  rows={6}
                  className={`${fieldClass} resize-none`}
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="submit" disabled={isSending} className="w-full sm:w-auto">
                  {isSending ? "Sending..." : "Send message"}
                </Button>
                <p
                  className={`text-sm ${
                    state.status === "error"
                      ? "text-[color:var(--color-danger)]"
                      : "text-[color:var(--color-ink-muted)]"
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {statusMessage}
                </p>
              </div>
            </div>
          </form>
        </div>
      </Container>
    </section>
  );
};
