"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { buildCartLines, getCartTotals, lineHasStockIssue } from "@/app/lib/cart";
import { formatAud, formatMoney } from "@/app/lib/currency";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";
import {
  DISPATCH_CLAIM_SHORT,
  FREE_SHIPPING_CLAIM,
  SHIPPING_FACTS,
} from "@/app/lib/shipping";
import {
  AU_STATES,
  isAuState,
  isValidEmail,
  isValidPostcodeForState,
  type AuState,
} from "@/app/lib/validators";
// Type-only: erased at compile time, so the server-only module never ships.
import type { PlaceOrderInput } from "@/app/lib/orders";
import { useCart } from "@/app/providers/CartProvider";
import { useCatalogue } from "@/app/hooks/useCatalogue";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Container } from "@/app/components/ui/Container";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { CheckoutField } from "@/app/components/cart/CheckoutField";
import { CheckoutPolicyBlock } from "@/app/components/cart/CheckoutPolicyBlock";
import { CheckoutSummaryLines, CheckoutSummaryTotals } from "@/app/components/cart/CheckoutSummary";
import { findUnavailableItems } from "@/app/components/cart/cart-line-stock";

type FieldName = "email" | "name" | "phone" | "line1" | "line2" | "suburb" | "state" | "postcode";
type Values = Record<FieldName, string>;
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = ["email", "name", "phone", "line1", "line2", "suburb", "state", "postcode"];
const isFieldName = (value: unknown): value is FieldName =>
  typeof value === "string" && (FIELD_ORDER as string[]).includes(value);

const EMPTY_VALUES: Values = {
  email: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  suburb: "",
  state: "",
  postcode: "",
};

const STATE_NAMES: Record<AuState, string> = {
  ACT: "Australian Capital Territory",
  NSW: "New South Wales",
  NT: "Northern Territory",
  QLD: "Queensland",
  SA: "South Australia",
  TAS: "Tasmania",
  VIC: "Victoria",
  WA: "Western Australia",
};

const NOTES_MAX = 500;
const SUBMIT_LABEL = "Place order";

/**
 * Client-side checks for instant feedback. The server re-validates every field
 * (validateOrderInput) and its 400 `field` is mapped back onto the same input.
 * Phone format is left to the server so the two can't disagree.
 */
const validateField = (name: FieldName, values: Values): string | null => {
  const value = values[name].trim();
  switch (name) {
    case "email":
      if (!value) return "Enter your email address.";
      return isValidEmail(value) ? null : "Enter a valid email address.";
    case "name":
      return value.length >= 2 ? null : "Enter your full name.";
    case "line1":
      return value.length >= 3 ? null : "Enter your street address.";
    case "suburb":
      return value.length >= 2 ? null : "Enter your suburb.";
    case "state":
      return isAuState(value) ? null : "Choose your state.";
    case "postcode":
      if (!/^\d{4}$/.test(value)) return "Enter your 4-digit postcode.";
      if (isAuState(values.state) && !isValidPostcodeForState(value, values.state)) {
        return `That postcode isn't in ${values.state}.`;
      }
      return null;
    default:
      return null;
  }
};

const validateAll = (values: Values): FieldErrors => {
  const errors: FieldErrors = {};
  for (const name of FIELD_ORDER) {
    const error = validateField(name, values);
    if (error) errors[name] = error;
  }
  return errors;
};

type OrderResponse = {
  orderNumber?: string;
  redirectTo?: string;
  error?: string;
  field?: string;
  variantId?: string;
};

const readJson = async (response: Response): Promise<OrderResponse> => {
  try {
    return (await response.json()) as OrderResponse;
  } catch {
    return {};
  }
};

type FormNotice = {
  message: string;
  /** Stock / cart problems point back to the cart, where quantities change. */
  action?: "cart" | "contact";
};

const StepBadge = ({ n }: { n: number }) => (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-[10px] font-bold text-white">
    {n}
  </span>
);

const SELECT_CLASS =
  "w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-base text-[color:var(--color-ink)] shadow-none transition focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] aria-[invalid=true]:border-[color:var(--color-danger)] sm:text-sm";

const CheckoutShell = ({ children }: { children: ReactNode }) => (
  <section className="min-h-[720px] pb-16 pt-6 lg:pt-8">
    <Container>{children}</Container>
  </section>
);

const CheckoutSkeleton = () => (
  <section className="min-h-[720px] pb-28 pt-0 lg:pb-16 lg:pt-8" aria-busy="true" aria-label="Loading checkout">
    {/* Same height as the phone summary chip it stands in for. */}
    <div className="h-[53px] border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] lg:hidden" />
    <Container className="space-y-6 pt-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[color:var(--color-surface-muted)] sm:h-9" />
        <div className="h-5 w-72 max-w-full animate-pulse rounded-lg bg-[color:var(--color-surface-muted)]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_460px]">
        <div className="space-y-4">
          <div className="h-[520px] animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] sm:h-[420px]" />
          <div className="h-36 animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]" />
        </div>
        <div className="hidden h-[560px] animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] lg:block" />
      </div>
    </Container>
  </section>
);

export const CheckoutPageClient = () => {
  const router = useRouter();
  const { items, hydrated, clearCart } = useCart();
  const { products, loading, error: catalogueError, refresh } = useCatalogue();

  const lines = useMemo(() => buildCartLines(items, products), [items, products]);
  const totals = useMemo(() => getCartTotals(lines), [lines]);
  const unavailable = useMemo(
    () => (!loading && !catalogueError ? findUnavailableItems(items, lines) : []),
    [catalogueError, items, lines, loading]
  );
  const hasStockIssues = lines.some(lineHasStockIssue);

  const [values, setValues] = useState<Values>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notes, setNotes] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [flaggedVariantId, setFlaggedVariantId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ orderNumber: string; redirectTo: string } | null>(null);
  // The ref is the double-submit guard: state updates land a render late, so
  // two quick taps (or the in-form button + the fixed bar) could both pass a
  // state check before either re-render.
  const submittingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const canSubmit =
    lines.length > 0 &&
    !hasStockIssues &&
    unavailable.length === 0 &&
    !submitting &&
    placed === null;

  const focusField = (name: FieldName) => {
    const element = formRef.current?.elements.namedItem(name);
    if (element instanceof HTMLElement) element.focus();
  };

  const setField = (name: FieldName, value: string) => {
    const next = { ...values, [name]: value };
    setValues(next);
    // Live re-check only once a field is showing an error, so the message
    // clears the moment it's fixed without nagging while someone types.
    setErrors((current) => {
      const updated = { ...current };
      if (current[name]) {
        const error = validateField(name, next);
        if (error) updated[name] = error;
        else delete updated[name];
      }
      // Changing state can make an entered postcode right (or wrong).
      if (name === "state" && next.postcode) {
        const postcodeError = validateField("postcode", next);
        if (postcodeError) updated.postcode = postcodeError;
        else delete updated.postcode;
      }
      return updated;
    });
  };

  // Validate on blur, but only once something's been typed: tabbing through
  // empty fields shouldn't paint the form red. Empty required fields are
  // caught on submit.
  const handleBlur = (name: FieldName) => {
    if (!values[name].trim()) return;
    const error = validateField(name, values);
    setErrors((current) => {
      const updated = { ...current };
      if (error) updated[name] = error;
      else delete updated[name];
      return updated;
    });
  };

  const fieldProps = (name: FieldName) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event: ChangeEvent<HTMLInputElement>) => setField(name, event.target.value),
    onBlur: () => handleBlur(name),
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || !canSubmit) return;

    const nextErrors = validateAll(values);
    const firstInvalid = FIELD_ORDER.find((name) => nextErrors[name]);
    if (firstInvalid) {
      setErrors(nextErrors);
      setNotice({ message: "Please check the highlighted details." });
      focusField(firstInvalid);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setNotice(null);
    setFlaggedVariantId(null);

    // Ids and quantities only: place_sticker_order() prices every line from
    // sticker_variants. The client never sends a price.
    const body = {
      email: values.email.trim(),
      name: values.name.trim(),
      phone: values.phone.trim() || undefined,
      address: {
        line1: values.line1.trim(),
        line2: values.line2.trim() || undefined,
        suburb: values.suburb.trim(),
        state: values.state,
        postcode: values.postcode.trim(),
        country: "AU" as const,
      },
      items: lines.map((line) => ({ variantId: line.variant.id, quantity: line.quantity })),
      marketingOptIn,
      notes: notes.trim() || undefined,
    } satisfies PlaceOrderInput;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await readJson(response);

      if (response.ok && payload.redirectTo) {
        // Placed: keep the guard closed for good. `placed` renders first, so
        // the emptied cart never flashes the "your cart is empty" state.
        setPlaced({ orderNumber: payload.orderNumber ?? "", redirectTo: payload.redirectTo });
        clearCart();
        router.push(payload.redirectTo);
        return;
      }

      if (response.status === 400 && isFieldName(payload.field)) {
        const field = payload.field;
        setErrors((current) => ({ ...current, [field]: payload.error ?? "Please check this field." }));
        setNotice({ message: payload.error ?? "Please check the highlighted details." });
        focusField(field);
      } else if (response.status === 400 && payload.field === "items") {
        await refresh();
        setFlaggedVariantId(payload.variantId ?? null);
        setNotice({
          message: payload.error ?? "Please check the quantities in your cart.",
          action: "cart",
        });
      } else if (response.status === 409) {
        // Stock moved under this buyer: re-read it so the lines show the truth.
        await refresh();
        setFlaggedVariantId(payload.variantId ?? null);
        setNotice({
          message:
            payload.error ??
            "One of your stickers has sold out or has fewer left than you selected.",
          action: "cart",
        });
      } else if (response.status === 429) {
        setNotice({
          message:
            payload.error ??
            "Too many orders from this connection. Please wait a few minutes and try again.",
        });
      } else {
        setNotice({
          message: payload.error ?? "We couldn't place your order. Please try again.",
          action: "contact",
        });
      }
    } catch {
      setNotice({
        message: "We couldn't reach the store. Check your connection and try again.",
      });
    }

    submittingRef.current = false;
    setSubmitting(false);
  };

  // ── States before the form ────────────────────────────────────────────────

  if (placed) {
    return (
      <CheckoutShell>
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 text-center shadow-soft" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--color-success)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <h1 className="font-display text-2xl font-bold text-[color:var(--color-ink)]">
            {placed.orderNumber ? `Order ${placed.orderNumber} placed` : "Order placed"}
          </h1>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            Taking you to your order page with the bank transfer details…
          </p>
          <LinkButton href={placed.redirectTo} variant="secondary">
            Open my order
          </LinkButton>
        </div>
      </CheckoutShell>
    );
  }

  if (!hydrated || (items.length > 0 && loading)) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0) {
    return (
      <CheckoutShell>
        <div className="flex flex-col items-center gap-6 py-14 text-center">
          <div className="max-w-xl space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">
              Your cart is empty
            </h1>
            <p className="text-base text-[color:var(--color-ink-muted)]">
              There&apos;s nothing to check out yet.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href="/shop">Browse stickers</LinkButton>
            <LinkButton href="/cart" variant="secondary">
              Back to cart
            </LinkButton>
          </div>
        </div>
      </CheckoutShell>
    );
  }

  if (catalogueError && lines.length === 0) {
    return (
      <CheckoutShell>
        <div className="flex flex-col items-center gap-6 py-14 text-center">
          <div className="max-w-xl space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">
              Checkout
            </h1>
            <p className="text-base text-[color:var(--color-ink-muted)]">
              We couldn&apos;t load the latest prices and stock. Your cart is saved on this device.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={() => void refresh()}>Try again</Button>
            <LinkButton href="/cart" variant="secondary">
              Back to cart
            </LinkButton>
          </div>
        </div>
      </CheckoutShell>
    );
  }

  // ── Shared blocks (rendered in both layouts) ──────────────────────────────

  const submitLabel = submitting ? "Placing order…" : SUBMIT_LABEL;
  const unavailableCount = unavailable.reduce((sum, item) => sum + item.quantity, 0);
  const blockingMessage =
    unavailable.length > 0
      ? `${unavailableCount === 1 ? "1 sticker" : `${unavailableCount} stickers`} in your cart ${
          unavailableCount === 1 ? "is" : "are"
        } no longer available. Update your cart to continue.`
      : hasStockIssues
        ? "Some stickers have sold out or have fewer left than you selected. Update your cart to continue."
        : null;

  const marketingOptInRow = (
    <label className="flex cursor-pointer items-start gap-2 text-xs text-[color:var(--color-ink-muted)]">
      <input
        type="checkbox"
        checked={marketingOptIn}
        onChange={(event) => setMarketingOptIn(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-primary)]"
      />
      <span>Email me about new drops</span>
    </label>
  );

  const blockingNotice = blockingMessage ? (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[color:var(--color-warning)]/50 bg-[color:var(--color-surface)] px-3 py-2 text-xs text-[color:var(--color-ink)]">
      <p className="flex-1">{blockingMessage}</p>
      <Link href="/cart" className="font-semibold text-[color:var(--color-primary)] hover:underline">
        Update cart
      </Link>
    </div>
  ) : null;

  const noticeBlock = notice ? (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-[color:var(--color-danger)]/40 bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-ink)]"
    >
      <p>{notice.message}</p>
      {notice.action ? (
        <div className="flex flex-wrap gap-3">
          {notice.action === "cart" ? (
            <LinkButton href="/cart" variant="secondary" className="px-4 py-2">
              Update cart
            </LinkButton>
          ) : (
            <LinkButton href="/contact" variant="ghost" className="px-4 py-2">
              Contact us
            </LinkButton>
          )}
        </div>
      ) : null}
    </div>
  ) : null;

  const firstLine = lines[0];

  return (
    <section className="pb-28 pt-0 lg:pb-16 lg:pt-8">
      {/* ── Phone: sticky summary chip ── */}
      <div className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] lg:hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-2.5"
          onClick={() => setSummaryOpen((open) => !open)}
          aria-expanded={summaryOpen}
          aria-controls="checkout-summary-chip"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {firstLine ? (
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]">
                <Image
                  src={firstLine.product.image.src}
                  alt=""
                  fill
                  sizes="28px"
                  className="object-contain p-0.5"
                />
              </div>
            ) : null}
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-semibold text-[color:var(--color-ink)]">
                {firstLine?.product.name ?? "Your order"}
                {lines.length > 1 ? ` +${lines.length - 1} more` : ""}
              </p>
              <p className="text-[10px] text-[color:var(--color-primary)]">
                {summaryOpen ? "Hide summary ▴" : "View summary ▾"}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-ink-muted)]">
              Total
            </p>
            <p className="text-sm font-bold text-[color:var(--color-ink)]">
              {formatMoney(totals.total)}
            </p>
          </div>
        </button>
        {summaryOpen ? (
          <div
            id="checkout-summary-chip"
            className="space-y-3 border-t border-[color:var(--color-border)] px-4 py-3"
          >
            <CheckoutSummaryLines lines={lines} flaggedVariantId={flaggedVariantId} />
            <div className="border-t border-[color:var(--color-border)] pt-3">
              <CheckoutSummaryTotals totals={totals} compact />
            </div>
          </div>
        ) : null}
      </div>

      <Container className="space-y-6 pt-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[color:var(--color-ink)] sm:text-3xl">
            Checkout
          </h1>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            Place your order, then pay by bank transfer using your order number as the reference.
          </p>
        </div>

        <form
          id="checkout-form"
          ref={formRef}
          className="grid gap-6 lg:grid-cols-[1fr_460px]"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* ── LEFT COLUMN ── */}
          <div className="min-w-0 space-y-4">
            {/* 1. Contact & delivery */}
            <Card className="space-y-5">
              <h2 className="text-base font-semibold text-[color:var(--color-ink)]">
                <span className="text-[color:var(--color-ink-subtle)]">1 ·</span> Contact &amp; delivery
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckoutField
                  {...fieldProps("email")}
                  label="Email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={254}
                  required
                  hint="Your order updates go here."
                  className="sm:col-span-2"
                />
                <CheckoutField
                  {...fieldProps("name")}
                  label="Full name"
                  autoComplete="name"
                  maxLength={80}
                  required
                />
                <CheckoutField
                  {...fieldProps("phone")}
                  label="Phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  optional
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <CheckoutField
                  {...fieldProps("line1")}
                  label="Street address"
                  autoComplete="address-line1"
                  placeholder="Street number and name"
                  maxLength={80}
                  required
                  className="sm:col-span-2"
                />
                <CheckoutField
                  {...fieldProps("line2")}
                  label="Apartment, unit, etc."
                  autoComplete="address-line2"
                  maxLength={80}
                  optional
                  className="sm:col-span-2"
                />
                <CheckoutField
                  {...fieldProps("suburb")}
                  label="Suburb"
                  autoComplete="address-level2"
                  maxLength={40}
                  required
                />
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="field-state"
                    className="text-sm font-medium text-[color:var(--color-ink)]"
                  >
                    State *
                  </label>
                  <select
                    id="field-state"
                    name="state"
                    required
                    autoComplete="address-level1"
                    value={values.state}
                    onChange={(event) => setField("state", event.target.value)}
                    onBlur={() => handleBlur("state")}
                    aria-invalid={errors.state ? true : undefined}
                    aria-describedby={errors.state ? "field-state-message" : undefined}
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled>
                      Select state
                    </option>
                    {AU_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state} — {STATE_NAMES[state]}
                      </option>
                    ))}
                  </select>
                  {errors.state ? (
                    <p
                      id="field-state-message"
                      className="text-xs font-medium text-[color:var(--color-danger)]"
                    >
                      {errors.state}
                    </p>
                  ) : null}
                </div>
                <CheckoutField
                  {...fieldProps("postcode")}
                  onChange={(event) =>
                    setField("postcode", event.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  label="Postcode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                />
                {/* AU-only store: country is fixed, not typed. */}
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[color:var(--color-ink)]">Country</span>
                  <div className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-3 text-base text-[color:var(--color-ink-muted)] sm:text-sm">
                    Australia
                  </div>
                </div>
              </div>
            </Card>

            {/* 2. Shipping */}
            <Card className="space-y-4">
              <h2 className="text-base font-semibold text-[color:var(--color-ink)]">
                <span className="text-[color:var(--color-ink-subtle)]">2 ·</span> Shipping
              </h2>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/5 px-4 py-3 text-sm text-[color:var(--color-ink)]">
                <span className="font-medium">
                  {SHIPPING_FACTS.carrier} · {SHIPPING_FACTS.service}
                </span>
                <span className="shrink-0 font-semibold">
                  {totals.shipping === 0 ? (
                    <span className="text-[color:var(--color-success)]">Free</span>
                  ) : (
                    formatMoney(totals.shipping)
                  )}
                </span>
              </div>
              <p className="text-xs text-[color:var(--color-ink-muted)]">
                {DISPATCH_CLAIM_SHORT}, then usually {SHIPPING_FACTS.transitBusinessDays.min}–
                {SHIPPING_FACTS.transitBusinessDays.max} business days in the post.
                {totals.shipping > 0 ? ` ${FREE_SHIPPING_CLAIM}.` : ""}
              </p>
            </Card>

            {/* 3. Payment — a neutral how-it-works, not a warning. */}
            <Card className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[color:var(--color-ink)]">
                  <span className="text-[color:var(--color-ink-subtle)]">3 ·</span> Payment — Bank transfer
                </h2>
                <p className="mt-0.5 text-xs text-[color:var(--color-ink-muted)]">
                  No card details here: you pay from your own banking app.
                </p>
              </div>
              <ol className="space-y-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3 text-xs text-[color:var(--color-ink-muted)]">
                <li className="flex gap-2.5">
                  <StepBadge n={1} />
                  <p className="pt-0.5">
                    <span className="font-semibold text-[color:var(--color-ink)]">Place your order.</span>{" "}
                    Your order number and our bank details come up on the next page.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <StepBadge n={2} />
                  <p className="pt-0.5">
                    <span className="font-semibold text-[color:var(--color-ink)]">
                      Transfer the total
                    </span>{" "}
                    using your order number as the reference.
                  </p>
                </li>
                <li className="flex gap-2.5">
                  <StepBadge n={3} />
                  <p className="pt-0.5">
                    <span className="font-semibold text-[color:var(--color-ink)]">
                      We post once it lands.
                    </span>{" "}
                    {DISPATCH_CLAIM_SHORT}.
                  </p>
                </li>
              </ol>
              <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
                  Amount to transfer
                </p>
                <p className="mt-0.5 font-display text-3xl font-extrabold tracking-[-0.02em] text-[color:var(--color-ink)]">
                  {formatAud(totals.total)}
                </p>
              </div>
              <p className="text-[11px] text-[color:var(--color-ink-subtle)]">
                Your stickers are set aside as soon as you place the order. Unpaid orders are
                cancelled after {UNPAID_ORDER_HOURS} hours and the stickers go back on sale.
              </p>
            </Card>

            {/* 4. Order note */}
            {noteOpen ? (
              <div className="space-y-2 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="field-notes"
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-[color:var(--color-ink-subtle)]"
                  >
                    Order note <span className="font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setNoteOpen(false)}
                    aria-label="Close order note"
                    className="text-xs text-[color:var(--color-ink-muted)] hover:text-[color:var(--color-ink)]"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  id="field-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, NOTES_MAX))}
                  placeholder="Anything we should know about your order"
                  rows={3}
                  maxLength={NOTES_MAX}
                  className="w-full resize-none rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3 py-2 text-base text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-muted)] focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] sm:text-sm"
                />
                <p className="text-right text-xs text-[color:var(--color-ink-muted)]">
                  {notes.length}/{NOTES_MAX}
                </p>
              </div>
            ) : (
              <div className="px-1">
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="text-sm text-[color:var(--color-primary)] hover:underline"
                >
                  {notes.trim() ? "Edit order note" : "+ Add order note"}
                </button>
              </div>
            )}

            {/* ── Phone column: everything the desktop summary carries that
                must be seen before paying, directly above the fixed bar. ── */}
            <div className="space-y-4 lg:hidden">
              {noticeBlock}
              {blockingNotice}
              {marketingOptInRow}
              <Button variant="cta" type="submit" disabled={!canSubmit} className="w-full">
                {submitLabel}
              </Button>
              <CheckoutPolicyBlock />
            </div>
          </div>

          {/* ── RIGHT COLUMN: sticky order summary (desktop) ── */}
          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <Card className="space-y-4">
                <h2 className="text-base font-semibold text-[color:var(--color-ink)]">
                  Order summary
                </h2>
                <CheckoutSummaryLines lines={lines} flaggedVariantId={flaggedVariantId} />
                <div className="border-t border-[color:var(--color-border)] pt-4">
                  <CheckoutSummaryTotals totals={totals} />
                </div>
                {noticeBlock}
                {blockingNotice}
                {marketingOptInRow}
                <Button variant="cta" type="submit" disabled={!canSubmit} className="w-full">
                  {submitLabel}
                </Button>
                <div className="rounded-lg border-l-2 border-[color:var(--color-success)] bg-[color:var(--color-success)]/5 px-3 py-2">
                  <p className="text-xs font-semibold text-[color:var(--color-ink)]">
                    ✓ Your stickers are held for {UNPAID_ORDER_HOURS} hours while you transfer
                  </p>
                  <p className="mt-0.5 text-[11px] text-[color:var(--color-ink-muted)]">
                    Unpaid orders are cancelled after that and the stickers go back on sale.
                  </p>
                </div>
                <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[color:var(--color-ink-muted)]">
                  <li>✓ Secure checkout</li>
                  <li>✓ Direct bank transfer</li>
                  <li>✓ {DISPATCH_CLAIM_SHORT}</li>
                  <li>✓ {FREE_SHIPPING_CLAIM}</li>
                </ul>
                <CheckoutPolicyBlock />
              </Card>
            </div>
          </div>
        </form>
      </Container>

      {/* ── Phone: fixed bottom CTA bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_16px_-8px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-[color:var(--color-ink-muted)]">
              {totals.shipping > 0
                ? `${formatMoney(Math.max(0, SHIPPING_FACTS.freeThresholdAud - totals.subtotal))} to free shipping`
                : "Total"}
            </p>
            <p className="text-base font-bold text-[color:var(--color-ink)]">
              {formatMoney(totals.total)}
            </p>
          </div>
          <button
            type="submit"
            form="checkout-form"
            disabled={!canSubmit}
            className="rounded-lg bg-[color:var(--color-highlight)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-highlight-strong)] disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </section>
  );
};
