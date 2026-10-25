import Link from "next/link";
import { CopyField } from "@/app/components/ui/CopyField";
import { getBankTransferDetails, hasBankTransferDetails } from "@/app/lib/bank-transfer";
import { formatAud } from "@/app/lib/currency";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";
import { DISPATCH_CLAIM_SHORT } from "@/app/lib/shipping";
import {
  formatOrderDateTime,
  getPaymentDeadline,
} from "@/app/components/cart/order-dates";

type BankTransferPanelProps = {
  orderNumber: string;
  total: number;
  createdAt: string;
  /** Server "now", so the past-deadline copy is decided in one place. */
  now: number;
};

/**
 * The pending order's invoice card: amount, bank details and the reference,
 * each one tap to copy. Bank details come from env (getBankTransferDetails);
 * when they aren't configured the card says so rather than showing blanks.
 */
export const BankTransferPanel = ({ orderNumber, total, createdAt, now }: BankTransferPanelProps) => {
  const bank = getBankTransferDetails();
  const hasBank = hasBankTransferDetails(bank);
  const deadline = getPaymentDeadline(createdAt);
  const deadlineLabel = deadline ? formatOrderDateTime(deadline.toISOString()) : null;
  const placedLabel = formatOrderDateTime(createdAt);
  const pastDeadline = deadline !== null && now > deadline.getTime();

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-3">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
          Order {orderNumber} · Bank transfer
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-warning)]/50 bg-[color:var(--color-warning)]/10 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[color:var(--color-warning)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-warning)]" aria-hidden="true" />
          Awaiting payment
        </span>
      </div>

      {/* Amount */}
      <div className="px-5 pt-5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
          Transfer exactly
        </span>
        <p className="mt-1 font-display text-[clamp(34px,5vw,52px)] font-extrabold leading-none tracking-[-0.03em] text-[color:var(--color-ink)]">
          {formatAud(total)}
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-[color:var(--color-ink-muted)]">
          <span aria-hidden="true" className="text-[color:var(--color-success)]">
            ✓
          </span>
          <span>We post your stickers once it lands. {DISPATCH_CLAIM_SHORT}.</span>
        </p>
      </div>

      {/* Bank details */}
      <div className="space-y-2 px-5 pb-2 pt-4">
        {hasBank ? (
          <>
            <CopyField label="Account name" value={bank.accountName} />
            <CopyField label="BSB" value={bank.bsb} />
            <CopyField label="Account number" value={bank.accountNumber} />
          </>
        ) : (
          <p className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 text-sm text-[color:var(--color-ink-muted)]">
            Our bank details aren&apos;t showing here right now.{" "}
            <Link href="/contact" className="font-semibold text-[color:var(--color-primary)] hover:underline">
              Contact us
            </Link>{" "}
            with your order number and we&apos;ll send them. Use the reference and amount below
            when you transfer.
          </p>
        )}
        <CopyField label="Reference (your order number)" value={orderNumber} emphasis />
        <CopyField label="Amount" value={formatAud(total)} />
        {hasBank && bank.bankName ? (
          <p className="px-1 text-[11px] text-[color:var(--color-ink-subtle)]">
            Bank: {bank.bankName}
          </p>
        ) : null}
      </div>

      <div className="space-y-1 px-5 pb-5 pt-2 text-[11px] leading-relaxed text-[color:var(--color-ink-subtle)]">
        <p>
          Put <span className="font-semibold text-[color:var(--color-ink)]">{orderNumber}</span>{" "}
          in the reference so we can match your transfer to this order.
        </p>
        {deadlineLabel ? (
          pastDeadline ? (
            <p>
              The {UNPAID_ORDER_HOURS}-hour payment window for this order closed on{" "}
              <span className="font-semibold text-[color:var(--color-ink)]">{deadlineLabel}</span>{" "}
              (Melbourne time). Unpaid orders are cancelled and the stickers go back on sale.
            </p>
          ) : (
            <p>
              Pay within {UNPAID_ORDER_HOURS} hours of placing your order
              {placedLabel ? ` on ${placedLabel}` : ""}, so by{" "}
              <span className="font-semibold text-[color:var(--color-ink)]">{deadlineLabel}</span>{" "}
              (Melbourne time). Unpaid orders are cancelled after that and the stickers go back on
              sale.
            </p>
          )
        ) : null}
      </div>
    </div>
  );
};
