import Image from "next/image";
import { formatMoney } from "@/app/lib/currency";
import { SHIPPING_FACTS } from "@/app/lib/shipping";
import type { CartLine } from "@/app/lib/types";
import { getCartLineStock, stockIssueMessage } from "@/app/components/cart/cart-line-stock";

type Totals = { subtotal: number; shipping: number; total: number };

type CheckoutSummaryLinesProps = {
  lines: CartLine[];
  /** The variant the server just refused (409), flagged until the next submit. */
  flaggedVariantId?: string | null;
};

/**
 * Line items for the checkout summary. Shared by the desktop summary card and
 * the phone's expandable summary chip, so both flag the same stock problems.
 */
export const CheckoutSummaryLines = ({ lines, flaggedVariantId = null }: CheckoutSummaryLinesProps) => (
  <ul className="space-y-3">
    {lines.map((line) => {
      const issue =
        stockIssueMessage(getCartLineStock(line)) ??
        (line.variant.id === flaggedVariantId
          ? "Stock on this sticker just changed. Check it in your cart."
          : null);
      return (
        <li
          key={`${line.product.id}-${line.variant.id}`}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
              <Image
                src={line.product.image.src}
                alt=""
                fill
                sizes="40px"
                className="object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-[color:var(--color-ink)]">{line.product.name}</p>
              <p className="text-xs text-[color:var(--color-ink-muted)]">
                {line.variant.sizeLabel} × {line.quantity}
              </p>
              {issue ? (
                <p className="text-xs font-semibold text-[color:var(--color-warning)]">{issue}</p>
              ) : null}
            </div>
          </div>
          <span className="shrink-0 font-semibold text-[color:var(--color-ink)]">
            {formatMoney(line.lineTotal)}
          </span>
        </li>
      );
    })}
  </ul>
);

type CheckoutSummaryTotalsProps = {
  totals: Totals;
  /** The phone chip's denser type scale. */
  compact?: boolean;
};

/** Subtotal / shipping / total, straight from getCartTotals. */
export const CheckoutSummaryTotals = ({ totals, compact = false }: CheckoutSummaryTotalsProps) => {
  const remaining = Math.max(0, SHIPPING_FACTS.freeThresholdAud - totals.subtotal);
  const row = compact
    ? "flex justify-between text-xs text-[color:var(--color-ink-muted)]"
    : "flex justify-between text-[color:var(--color-ink-muted)]";

  return (
    <div className={compact ? "space-y-1.5" : "space-y-1.5 text-sm"}>
      <div className={row}>
        <span>Subtotal</span>
        <span>{formatMoney(totals.subtotal)}</span>
      </div>
      <div className={row}>
        <span>Shipping ({SHIPPING_FACTS.carrier})</span>
        <span>
          {totals.shipping === 0 ? (
            <span className="text-[color:var(--color-success)]">Free</span>
          ) : (
            formatMoney(totals.shipping)
          )}
        </span>
      </div>
      {remaining > 0 ? (
        <p className="text-xs text-[color:var(--color-primary)]">
          Add {formatMoney(remaining)} for free shipping
        </p>
      ) : (
        <p className="text-xs font-semibold text-[color:var(--color-success)]">✓ Free shipping</p>
      )}
      <div
        className={`flex justify-between border-t border-[color:var(--color-border)] font-bold text-[color:var(--color-ink)] ${
          compact ? "pt-1.5 text-sm" : "pt-2 text-base"
        }`}
      >
        <span>Total</span>
        <span>{formatMoney(totals.total)}</span>
      </div>
    </div>
  );
};
