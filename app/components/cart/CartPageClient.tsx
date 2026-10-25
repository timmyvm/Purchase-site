"use client";

import { useMemo } from "react";
import { buildCartLines, getCartTotals, lineHasStockIssue } from "@/app/lib/cart";
import { formatMoney } from "@/app/lib/currency";
import {
  DISPATCH_CLAIM_WITH_ORIGIN,
  FREE_SHIPPING_CLAIM,
  SHIPPING_FACTS,
} from "@/app/lib/shipping";
import { useCart } from "@/app/providers/CartProvider";
import { useCatalogue } from "@/app/hooks/useCatalogue";
import { Button } from "@/app/components/ui/Button";
import { Container } from "@/app/components/ui/Container";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { CartItemRow } from "@/app/components/cart/CartItemRow";
import { FreeShippingProgress } from "@/app/components/cart/FreeShippingProgress";
import { findUnavailableItems } from "@/app/components/cart/cart-line-stock";

// Every state renders inside the same min-height so the skeleton → cart (or
// → empty) swap after hydration doesn't pull the footer up the screen.
const SECTION_CLASS = "min-h-[640px] py-10 sm:py-14";

const LockIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="h-3 w-3 text-[color:var(--color-success)]"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="7" width="10" height="7" rx="1.5" />
    <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
  </svg>
);

const CartSkeleton = () => (
  <section className={SECTION_CLASS} aria-busy="true" aria-label="Loading your cart">
    <Container className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-[color:var(--color-surface-muted)] sm:h-10" />
        <div className="h-5 w-72 max-w-full animate-pulse rounded-lg bg-[color:var(--color-surface-muted)]" />
      </div>
      <div className="h-[58px] animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]" />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="h-[120px] animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] md:h-24" />
          <div className="h-[120px] animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] md:h-24" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]" />
      </div>
    </Container>
  </section>
);

const EmptyCart = ({ note, onClear }: { note?: string; onClear?: () => void }) => (
  <section className={`${SECTION_CLASS} flex items-center`}>
    <Container className="flex flex-col items-center gap-6 text-center">
      <div className="max-w-xl space-y-4">
        <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">
          Your cart is empty
        </h1>
        <p className="text-base text-[color:var(--color-ink-muted)]">
          {note ?? "Pick a design or two. Each one is a limited run, and once it sells out it isn't reprinted."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <LinkButton href="/shop">Browse stickers</LinkButton>
        {onClear ? (
          <Button variant="secondary" onClick={onClear}>
            Clear my cart
          </Button>
        ) : null}
      </div>
    </Container>
  </section>
);

export const CartPageClient = () => {
  const { items, hydrated, removeItem } = useCart();
  // Prices and stock are always the live catalogue's; the cart only holds ids.
  // Enabled from the first render so `loading` starts true: enabling it only
  // after hydration left one frame with no products and no loading flag, which
  // read as "everything in your cart is gone".
  const { products, loading, error, refresh } = useCatalogue();

  const lines = useMemo(() => buildCartLines(items, products), [items, products]);
  const totals = useMemo(() => getCartTotals(lines), [lines]);
  const catalogueReady = !loading && !error;
  const unavailable = useMemo(
    () => (catalogueReady ? findUnavailableItems(items, lines) : []),
    [catalogueReady, items, lines]
  );
  const hasStockIssues = lines.some(lineHasStockIssue) || unavailable.length > 0;

  if (!hydrated || (items.length > 0 && loading)) {
    return <CartSkeleton />;
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  if (error && lines.length === 0) {
    return (
      <section className={`${SECTION_CLASS} flex items-center`}>
        <Container className="flex flex-col items-center gap-6 text-center">
          <div className="max-w-xl space-y-4">
            <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)]">
              Your cart
            </h1>
            <p className="text-base text-[color:var(--color-ink-muted)]">
              We couldn&apos;t load the latest prices and stock. Your cart is saved on this device.
            </p>
          </div>
          <Button onClick={() => void refresh()}>Try again</Button>
        </Container>
      </section>
    );
  }

  const removeUnavailable = () => {
    for (const item of unavailable) removeItem(item.productId, item.variantId);
  };

  if (lines.length === 0) {
    // Everything in the cart has left the catalogue.
    return (
      <EmptyCart
        note="The stickers that were in your cart are no longer available, so there's nothing to check out. Have a look at what's in the shop now."
        onClear={removeUnavailable}
      />
    );
  }

  const unavailableCount = unavailable.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className={SECTION_CLASS}>
      <Container className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold text-[color:var(--color-ink)] sm:text-4xl">
            Your Cart
          </h1>
          <p className="text-base text-[color:var(--color-ink-muted)]">
            Check your stickers and quantities, then head to checkout.
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(34,197,94,0.25)] bg-[rgba(34,197,94,0.06)] px-4 py-3">
          <FreeShippingProgress subtotal={totals.subtotal} />
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            {unavailable.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--color-warning)]/50 bg-[color:var(--color-surface-elevated)] px-4 py-3">
                <p className="text-sm text-[color:var(--color-ink)]">
                  {unavailableCount === 1
                    ? "1 sticker in your cart is no longer available."
                    : `${unavailableCount} stickers in your cart are no longer available.`}
                </p>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={removeUnavailable}>
                  Remove {unavailable.length === 1 ? "it" : "them"}
                </Button>
              </div>
            ) : null}

            {lines.map((line) => (
              <CartItemRow key={`${line.product.id}-${line.variant.id}`} line={line} />
            ))}
          </div>

          <aside className="space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 shadow-soft lg:sticky lg:top-36">
            <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)]">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[color:var(--color-ink-muted)]">Subtotal</span>
                <span className="font-semibold text-[color:var(--color-ink)]">
                  {formatMoney(totals.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[color:var(--color-ink-muted)]">
                  Shipping ({SHIPPING_FACTS.carrier})
                </span>
                {totals.shipping === 0 ? (
                  <span className="font-semibold text-[color:var(--color-success)]">Free</span>
                ) : (
                  <span className="font-semibold text-[color:var(--color-ink)]">
                    {formatMoney(totals.shipping)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-3">
                <span className="font-display text-base font-bold text-[color:var(--color-ink)]">
                  Total
                </span>
                <span className="font-display text-xl font-bold text-[color:var(--color-ink)]">
                  {formatMoney(totals.total)}
                </span>
              </div>
            </div>

            <LinkButton href="/checkout" variant="cta" className="w-full" disabled={hasStockIssues}>
              Checkout →
            </LinkButton>

            {hasStockIssues ? (
              <p className="rounded-xl border border-[color:var(--color-warning)]/50 bg-[color:var(--color-surface)] px-3 py-2 text-xs text-[color:var(--color-ink)]">
                Some stickers have sold out, have fewer left than you selected, or are no longer
                available. Adjust your cart before checkout.
              </p>
            ) : null}

            <div className="space-y-1.5 border-t border-[color:var(--color-border)] pt-3">
              <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-[color:var(--color-ink-subtle)]">
                <LockIcon />
                Secure checkout · Direct bank transfer
              </p>
              <ul className="space-y-1 text-[11px] text-[color:var(--color-ink-muted)]">
                <li>✓ {DISPATCH_CLAIM_WITH_ORIGIN}</li>
                <li>✓ {FREE_SHIPPING_CLAIM}</li>
                <li>✓ Pay after you order, using your order number as the reference</li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
};
