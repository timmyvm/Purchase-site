"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/app/lib/currency";
import { productPath } from "@/app/lib/product-slugs";
import type { CartLine } from "@/app/lib/types";
import { useCart } from "@/app/providers/CartProvider";
import { CartQuantityInput } from "@/app/components/cart/CartQuantityInput";
import {
  getCartLineStock,
  getLineMaxQuantity,
  stockIssueMessage,
} from "@/app/components/cart/cart-line-stock";

type CartItemRowProps = {
  line: CartLine;
};

const RemoveButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-danger)]/35 text-[color:var(--color-ink-muted)] transition hover:border-[color:var(--color-danger)] hover:text-[color:var(--color-ink)]"
  >
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="m10 11 .5 6" />
      <path d="m14 11-.5 6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </svg>
  </button>
);

export const CartItemRow = ({ line }: CartItemRowProps) => {
  const { updateQuantity, removeItem } = useCart();
  const stock = getCartLineStock(line);
  const issue = stockIssueMessage(stock);
  const maxQuantity = getLineMaxQuantity(line);
  const href = productPath(line.product);

  return (
    <div
      className={`grid items-center gap-4 rounded-2xl border bg-[color:var(--color-surface-elevated)] px-4 py-4 md:grid-cols-[2fr_1fr_1fr_auto] ${
        issue ? "border-[color:var(--color-warning)]/60" : "border-[color:var(--color-border)]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]"
        >
          {/* Transparent die-cut PNG: contain it on the light tile. */}
          <Image
            src={line.product.image.src}
            alt=""
            fill
            sizes="64px"
            className="object-contain p-1.5"
          />
        </Link>
        <div className="min-w-0">
          <Link
            href={href}
            className="text-sm font-semibold text-[color:var(--color-ink)] transition hover:text-[color:var(--color-primary)]"
          >
            {line.product.name}
          </Link>
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            {line.variant.sizeLabel} · {line.product.finish}
          </p>
          <p className="text-xs text-[color:var(--color-ink-muted)]">
            {formatMoney(line.unitPrice)} each
          </p>
          {stock.kind === "sold-out" ? (
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-warning)]">
              Sold out
            </p>
          ) : stock.kind === "short" ? (
            <p className="text-xs font-semibold text-[color:var(--color-warning)]">
              Only {stock.available} left
            </p>
          ) : stock.kind === "low" ? (
            <p className="text-xs text-[color:var(--color-warning)]">Only {stock.available} left</p>
          ) : (
            <p className="text-xs text-[color:var(--color-ink-muted)]">In stock</p>
          )}
        </div>
      </div>

      {/* Phone: quantity, total and remove share one row. md+: `contents`
          drops the wrapper so they take APL's grid columns. */}
      <div className="flex items-center gap-3 md:contents">
        <div className="w-20 shrink-0 md:w-auto">
          <CartQuantityInput
            value={line.quantity}
            max={maxQuantity}
            ariaLabel={`Quantity of ${line.product.name}, ${line.variant.sizeLabel}`}
            onCommit={(next) => updateQuantity(line.product.id, line.variant.id, next)}
          />
        </div>
        <p className="flex-1 text-sm font-semibold text-[color:var(--color-ink)] md:flex-none">
          {formatMoney(line.lineTotal)}
        </p>
        <RemoveButton
          onClick={() => removeItem(line.product.id, line.variant.id)}
          label={`Remove ${line.product.name}, ${line.variant.sizeLabel}`}
        />
      </div>

      {issue ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[color:var(--color-warning)]/50 bg-[color:var(--color-surface)] px-3 py-2 text-xs text-[color:var(--color-ink)] md:col-span-4">
          <p className="flex-1">{issue}</p>
          {stock.kind === "short" ? (
            <button
              type="button"
              onClick={() => updateQuantity(line.product.id, line.variant.id, stock.available)}
              className="font-semibold text-[color:var(--color-primary)] transition hover:underline"
            >
              Set to {stock.available}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => removeItem(line.product.id, line.variant.id)}
              className="font-semibold text-[color:var(--color-primary)] transition hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
