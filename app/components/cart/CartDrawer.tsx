"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { buildCartLines, getCartSubtotal, lineHasStockIssue, MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import { useCart } from "@/app/providers/CartProvider";
import { formatMoney } from "@/app/lib/currency";
import { useCatalogue } from "@/app/hooks/useCatalogue";
import { useScrollLock } from "@/app/hooks/useScrollLock";
import { Button } from "@/app/components/ui/Button";
import { FreeShippingProgress } from "@/app/components/cart/FreeShippingProgress";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem } = useCart();
  const { products, loading } = useCatalogue(open);
  const drawerRef = useRef<HTMLElement>(null);
  const swipeStartX = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
    if (drawerRef.current) {
      drawerRef.current.style.transition = "none";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || !drawerRef.current) return;
    const delta = Math.max(0, e.touches[0].clientX - swipeStartX.current);
    drawerRef.current.style.transform = `translateX(${delta}px)`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || !drawerRef.current) return;
    const delta = Math.max(0, e.changedTouches[0].clientX - swipeStartX.current);
    drawerRef.current.style.transition = "";
    if (delta >= SWIPE_THRESHOLD) {
      onClose();
    } else {
      drawerRef.current.style.transform = "";
    }
    swipeStartX.current = null;
  };

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, open]);

  const lines = useMemo(() => buildCartLines(items, products), [items, products]);
  const subtotal = useMemo(() => getCartSubtotal(lines), [lines]);
  const hasStockIssues = useMemo(() => lines.some(lineHasStockIssue), [lines]);
  const isResolvingCartLines = open && items.length > 0 && products.length === 0;

  return (
    <>
      <button
        type="button"
        aria-label="Close cart"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/45 transition-opacity ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed inset-y-0 right-0 z-[61] flex w-full max-w-[420px] flex-col border-l border-[color:var(--color-border)] bg-[color:var(--color-charcoal)] shadow-card transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[color:var(--color-ink)]">Your Cart</p>
            <p className="text-xs text-[color:var(--color-ink-muted)]">
              {items.reduce((count, item) => count + item.quantity, 0)} item
              {items.reduce((count, item) => count + item.quantity, 0) === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--color-border)] p-2 text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
            aria-label="Close cart drawer"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6">
          {(loading || isResolvingCartLines) ? (
            <div className="space-y-3">
              <div className="h-20 animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]" />
              <div className="h-20 animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]" />
            </div>
          ) : null}
          {!loading && !isResolvingCartLines && lines.length === 0 ? (
            <div className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-4 py-4">
              <p className="text-sm text-[color:var(--color-ink-muted)]">
                Your cart is empty.
              </p>
              <Link href="/shop" onClick={onClose} className="block">
                <Button className="w-full">Browse stickers</Button>
              </Link>
            </div>
          ) : null}
          {lines.map((line) => {
            const maxQty = Math.min(MAX_QUANTITY_PER_ITEM, line.variant.inventory);
            return (
              <div
                key={`${line.product.id}-${line.variant.id}`}
                className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <Image
                      src={line.product.image.src}
                      alt={line.product.image.alt}
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="space-y-1">
                  <p className="text-sm font-semibold text-[color:var(--color-ink)]">
                    {line.product.name}
                  </p>
                  <p className="text-xs text-[color:var(--color-ink-muted)]">
                    {line.variant.sizeLabel} · {line.product.finish}
                  </p>
                  {lineHasStockIssue(line) ? (
                    <p className="text-xs font-semibold text-[color:var(--color-warning)]">
                      {line.variant.inventory > 0
                        ? `Only ${line.variant.inventory} left`
                        : "Sold out"}
                    </p>
                  ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {/* Qty stepper */}
                  <div className="flex items-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${line.product.name}`}
                      onClick={() => updateQuantity(line.product.id, line.variant.id, Math.max(1, line.quantity - 1))}
                      disabled={line.quantity <= 1}
                      className="flex h-11 w-11 items-center justify-center rounded-l-xl text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)] disabled:opacity-30"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold text-[color:var(--color-ink)]">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${line.product.name}`}
                      onClick={() => {
                        if (line.quantity >= maxQty) return;
                        updateQuantity(line.product.id, line.variant.id, line.quantity + 1);
                      }}
                      disabled={line.quantity >= maxQty}
                      className="flex h-11 w-11 items-center justify-center rounded-r-xl text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)] disabled:opacity-30"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                  </div>
                  <p className="flex-1 text-sm font-semibold text-[color:var(--color-ink)]">
                    {formatMoney(line.lineTotal)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(line.product.id, line.variant.id)}
                    aria-label={`Remove ${line.product.name}`}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--color-danger)]/35 text-[color:var(--color-ink-muted)] transition hover:border-[color:var(--color-danger)] hover:text-[color:var(--color-ink)]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7h16" />
                      <path d="m10 11 .5 6" />
                      <path d="m14 11-.5 6" />
                      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
                      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 border-t border-[color:var(--color-border)] px-4 py-4 sm:px-6">
          {lines.length > 0 ? (
            <FreeShippingProgress subtotal={subtotal} />
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[color:var(--color-ink-muted)]">Subtotal</span>
            <span className="font-semibold text-[color:var(--color-ink)]">
              {formatMoney(subtotal)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {lines.length > 0 && !hasStockIssues ? (
              <Link href="/checkout" onClick={onClose} className="w-full">
                <Button variant="cta" className="w-full">Proceed to Checkout</Button>
              </Link>
            ) : (
              <Button variant="cta" className="w-full" disabled>
                Proceed to Checkout
              </Button>
            )}
            {/* The full /cart page is the review step — keep it one tap away. */}
            {lines.length > 0 ? (
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full rounded-lg border border-[color:var(--color-border)] py-2 text-center text-sm font-semibold text-[color:var(--color-ink)] transition hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-primary)]"
              >
                View full cart
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-center text-xs font-medium text-[color:var(--color-ink-muted)] transition hover:text-[color:var(--color-ink)]"
            >
              Continue browsing
            </button>
          </div>
          {hasStockIssues ? (
            <p className="text-xs text-[color:var(--color-warning)]">
              Some items have sold out or have fewer left than you selected.
            </p>
          ) : null}
        </div>
      </aside>
    </>
  );
};
