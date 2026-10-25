"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { CheckoutField } from "@/app/components/cart/CheckoutField";
import { isValidEmail } from "@/app/lib/validators";

type OrderLookupFormProps = {
  /** Prefilled when the visitor came from an order link (email gets focus). */
  initialOrderNumber?: string;
  heading?: string;
  intro?: string;
};

/** "s123456", "#S123456", "123456" → "S123456". */
const normalizeOrderNumber = (value: string) => {
  const compact = value.replace(/[\s#]/g, "").toUpperCase();
  return /^\d{6}$/.test(compact) ? `S${compact}` : compact;
};

/**
 * Track Order: order number + the email it was placed with. The API gives the
 * same answer for "no such order" and "wrong email", and on a match returns
 * the signed order-page link.
 */
export const OrderLookupForm = ({
  initialOrderNumber = "",
  heading = "Track your order",
  intro = "Enter your order number and the email you ordered with. Your order number (it looks like S123456) is in your confirmation email and at the top of your order page.",
}: OrderLookupFormProps) => {
  const router = useRouter();
  const prefilled = Boolean(initialOrderNumber);
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState("");
  const [orderNumberError, setOrderNumberError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pendingRef = useRef(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const orderRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingRef.current) return;

    const normalizedOrder = normalizeOrderNumber(orderNumber);
    const trimmedEmail = email.trim();
    const nextOrderError = /^S\d{6}$/.test(normalizedOrder)
      ? null
      : "Enter your order number, e.g. S123456.";
    const nextEmailError = isValidEmail(trimmedEmail) ? null : "Enter the email you ordered with.";
    setOrderNumberError(nextOrderError);
    setEmailError(nextEmailError);
    setError(null);
    if (nextOrderError) {
      orderRef.current?.focus();
      return;
    }
    if (nextEmailError) {
      emailRef.current?.focus();
      return;
    }

    pendingRef.current = true;
    setLoading(true);
    setOrderNumber(normalizedOrder);
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: normalizedOrder, email: trimmedEmail }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        redirectTo?: string;
        error?: string;
      };
      if (response.ok && payload.redirectTo) {
        // Keep the button locked while the order page loads.
        router.push(payload.redirectTo);
        return;
      }
      setError(
        payload.error ??
          (response.status === 404
            ? "We couldn't find an order with that number and email."
            : "Order tracking is unavailable right now. Please try again shortly.")
      );
    } catch {
      setError("We couldn't reach the store. Check your connection and try again.");
    }
    pendingRef.current = false;
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 shadow-soft"
    >
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-[color:var(--color-ink)] sm:text-3xl">
          {heading}
        </h1>
        <p className="text-sm text-[color:var(--color-ink-muted)]">{intro}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <CheckoutField
          ref={orderRef}
          name="orderNumber"
          id="lookup-order-number"
          label="Order number"
          value={orderNumber}
          onChange={(event) => {
            setOrderNumber(event.target.value.toUpperCase());
            if (orderNumberError) setOrderNumberError(null);
          }}
          placeholder="S123456"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={12}
          required
          error={orderNumberError}
        />
        <CheckoutField
          ref={emailRef}
          name="email"
          id="lookup-email"
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError(null);
          }}
          onBlur={() => {
            if (email.trim() && !isValidEmail(email)) setEmailError("Enter a valid email address.");
          }}
          placeholder="you@example.com"
          maxLength={254}
          required
          autoFocus={prefilled}
          error={emailError}
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
        {loading ? "Checking…" : "Find my order"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-[color:var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </form>
  );
};
