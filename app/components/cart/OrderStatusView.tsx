import Link from "next/link";
import type { StoredOrder } from "@/app/lib/orders";
import type { OrderStatus } from "@/app/lib/types";
import { BUSINESS } from "@/app/lib/business-identity";
import { formatAud, formatMoney } from "@/app/lib/currency";
import { productPath } from "@/app/lib/product-slugs";
import { DISPATCH_CLAIM_SHORT, SHIPPING_FACTS } from "@/app/lib/shipping";
import { Card } from "@/app/components/ui/Card";
import { Container } from "@/app/components/ui/Container";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { BankTransferPanel } from "@/app/components/cart/BankTransferPanel";
import { OrderRefreshButton } from "@/app/components/cart/OrderRefreshButton";
import { OrderTimeline } from "@/app/components/cart/OrderTimeline";
import { formatOrderDate, formatOrderDateTime } from "@/app/components/cart/order-dates";

type OrderStatusViewProps = {
  order: StoredOrder;
  /** Server time of this render (the page is force-dynamic). */
  now: number;
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  shipped: "Posted",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_PILL_TONE: Record<OrderStatus, string> = {
  pending:
    "border-[color:var(--color-warning)]/50 bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]",
  paid: "border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
  shipped:
    "border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
  completed:
    "border-[color:var(--color-success)]/40 bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
  cancelled:
    "border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 text-[color:var(--color-danger)]",
};

const SECTION_LABEL =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink-subtle)]";

const StatusPill = ({ status }: { status: OrderStatus }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${STATUS_PILL_TONE[status]}`}
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
    {STATUS_LABEL[status]}
  </span>
);

const transitLabel = `${SHIPPING_FACTS.transitBusinessDays.min}–${SHIPPING_FACTS.transitBusinessDays.max} business days`;

/** Dark confirmation hero once the money has landed (APL's SuccessHero). */
const SuccessHero = ({ order }: { order: StoredOrder }) => {
  const copy =
    order.status === "completed"
      ? { title: "Order complete. Thank you!", body: "Enjoy your stickers." }
      : order.status === "shipped"
        ? {
            title: "Your stickers are on the way",
            body: `Posted ${formatOrderDate(order.shippedAt) ?? "recently"} with ${SHIPPING_FACTS.carrier}.`,
          }
        : { title: "Payment received. Thank you!", body: "We're packing your stickers." };

  return (
    <div className="rounded-2xl bg-[color:var(--color-ink)] px-6 py-10 text-center text-white sm:py-12">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--color-success)]">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <h1 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.01em] sm:text-3xl">
        {copy.title}
      </h1>
      <p className="mt-2 text-sm text-white/70">
        Order{" "}
        <span className="font-semibold text-[color:var(--color-primary-tint)]">{order.orderNumber}</span>{" "}
        · {copy.body}
      </p>
    </div>
  );
};

const WhatHappensNext = () => (
  <Card className="space-y-4">
    <h2 className="font-display text-lg font-bold text-[color:var(--color-ink)]">What happens next</h2>
    <ol className="space-y-4">
      {[
        {
          title: DISPATCH_CLAIM_SHORT,
          body: `${SHIPPING_FACTS.service}, posted from ${SHIPPING_FACTS.dispatchFrom}.`,
        },
        {
          title: "This page updates when it's posted",
          body: "Bookmark it, or come back with your order number and email any time.",
        },
        {
          title: `Then ${transitLabel} in the post`,
          body: `That's ${SHIPPING_FACTS.carrier}'s usual letter transit time.`,
        },
      ].map((step, index) => (
        <li key={step.title} className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-surface)] text-sm font-bold text-[color:var(--color-primary)]">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-bold text-[color:var(--color-ink)]">{step.title}</p>
            <p className="text-xs leading-relaxed text-[color:var(--color-ink-muted)]">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  </Card>
);

const DeliveryCard = ({ order }: { order: StoredOrder }) => (
  <Card className="space-y-3">
    <p className={SECTION_LABEL}>{order.trackingNumber ? "AusPost tracking" : "Delivery"}</p>
    <p className="text-sm text-[color:var(--color-ink-muted)]">
      Posted {formatOrderDate(order.shippedAt) ?? "recently"} with {SHIPPING_FACTS.carrier}.{" "}
      {order.status === "shipped" ? `Letter post usually takes ${transitLabel}.` : null}
    </p>
    {order.trackingNumber ? (
      <>
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          Tracking number:{" "}
          <span className="font-mono font-semibold text-[color:var(--color-ink)]">
            {order.trackingNumber}
          </span>
        </p>
        <a
          href={`https://auspost.com.au/mypost/track/details/${encodeURIComponent(order.trackingNumber)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-lg bg-[color:var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-soft)]"
        >
          Track with AusPost ↗
        </a>
      </>
    ) : null}
  </Card>
);

const OrderSummaryCard = ({ order }: { order: StoredOrder }) => (
  <Card className="space-y-4">
    <p className={SECTION_LABEL}>Order summary</p>
    <ul className="space-y-3">
      {order.items.map((item) => (
        <li key={item.variantId} className="flex items-start justify-between gap-4 text-sm">
          <div className="min-w-0">
            <Link
              href={productPath({ slug: item.productSlug })}
              className="font-semibold text-[color:var(--color-ink)] transition hover:text-[color:var(--color-primary)]"
            >
              {item.name}
            </Link>
            <p className="text-xs text-[color:var(--color-ink-muted)]">
              {item.size} × {item.quantity} · {formatMoney(item.unitPrice)} each
            </p>
          </div>
          <p className="shrink-0 font-semibold text-[color:var(--color-ink)]">
            {formatMoney(item.lineTotal)}
          </p>
        </li>
      ))}
    </ul>
    <div className="space-y-1.5 border-t border-[color:var(--color-border)] pt-3 text-sm text-[color:var(--color-ink-muted)]">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatMoney(order.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Shipping ({SHIPPING_FACTS.carrier})</span>
        <span>
          {order.shipping === 0 ? (
            <span className="text-[color:var(--color-success)]">Free</span>
          ) : (
            formatMoney(order.shipping)
          )}
        </span>
      </div>
      <div className="flex justify-between border-t border-[color:var(--color-border)] pt-2 text-lg font-semibold text-[color:var(--color-ink)]">
        <span>Total</span>
        <span>{formatAud(order.total)}</span>
      </div>
    </div>
  </Card>
);

const AddressCard = ({ order }: { order: StoredOrder }) => {
  const address = order.shippingAddress;
  return (
    <Card className="space-y-3">
      <p className={SECTION_LABEL}>Posting to</p>
      <address className="text-sm not-italic leading-relaxed text-[color:var(--color-ink)]">
        <span className="font-semibold">{order.customerName}</span>
        <br />
        {address.line1}
        {address.line2 ? (
          <>
            <br />
            {address.line2}
          </>
        ) : null}
        <br />
        {address.suburb} {address.state} {address.postcode}
        <br />
        Australia
      </address>
    </Card>
  );
};

export const OrderStatusView = ({ order, now }: OrderStatusViewProps) => {
  const firstName = order.customerName.trim().split(/\s+/)[0] ?? "";
  const isPending = order.status === "pending";
  const isSettled = order.status === "paid" || order.status === "shipped" || order.status === "completed";
  const isPosted = order.status === "shipped" || order.status === "completed";

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[color:var(--color-ink-muted)]">
              Order:{" "}
              <span className="font-semibold text-[color:var(--color-ink)]">{order.orderNumber}</span>
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/order-status"
                className="text-xs font-semibold text-[color:var(--color-primary)] transition hover:text-[color:var(--color-ink)]"
              >
                Track a different order
              </Link>
              <OrderRefreshButton />
            </div>
          </div>

          {isPending ? (
            <div className="space-y-2 pt-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[color:var(--color-ink)] sm:text-3xl">
                Thanks{firstName ? `, ${firstName}` : ""}. Your order is in.
              </h1>
              <p className="text-sm text-[color:var(--color-ink-muted)]">
                Your stickers are set aside. Transfer the total below with your order number as the
                reference, and we&apos;ll post them once it lands.
              </p>
            </div>
          ) : null}

          {isSettled ? <SuccessHero order={order} /> : null}

          {order.status === "cancelled" ? (
            <div className="space-y-3 pt-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-[color:var(--color-ink)] sm:text-3xl">
                Order {order.orderNumber} was cancelled
              </h1>
              <p className="text-sm text-[color:var(--color-ink-muted)]">
                {formatOrderDateTime(order.cancelledAt)
                  ? `Cancelled ${formatOrderDateTime(order.cancelledAt)} (Melbourne time). `
                  : ""}
                If you&apos;ve already paid for it or think this is a mistake, get in touch and
                quote your order number.
              </p>
              <div className="flex flex-wrap gap-3">
                <LinkButton href="/shop">Browse stickers</LinkButton>
                <LinkButton href="/contact" variant="secondary">
                  Contact us
                </LinkButton>
              </div>
            </div>
          ) : null}

          {isPending ? (
            <>
              <BankTransferPanel
                orderNumber={order.orderNumber}
                total={order.total}
                createdAt={order.createdAt}
                now={now}
              />
              {/* Progress card */}
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
                    Progress
                  </span>
                  <span className="text-xs text-[color:var(--color-ink-muted)]">
                    Placed {formatOrderDateTime(order.createdAt) ?? ""}
                  </span>
                </div>
                <OrderTimeline order={order} />
              </div>
            </>
          ) : (
            <Card className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={SECTION_LABEL}>Order</p>
                  <p className="text-lg font-semibold text-[color:var(--color-ink)]">{order.orderNumber}</p>
                </div>
                <StatusPill status={order.status} />
              </div>
              <dl className="grid gap-3 text-sm text-[color:var(--color-ink-muted)] sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-[color:var(--color-ink)]">Placed</dt>
                  <dd>{formatOrderDateTime(order.createdAt) ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[color:var(--color-ink)]">Paid</dt>
                  <dd>{formatOrderDateTime(order.paidAt) ?? "—"}</dd>
                </div>
                {order.status === "cancelled" ? (
                  <div>
                    <dt className="font-semibold text-[color:var(--color-ink)]">Cancelled</dt>
                    <dd>{formatOrderDateTime(order.cancelledAt) ?? "—"}</dd>
                  </div>
                ) : (
                  <div>
                    <dt className="font-semibold text-[color:var(--color-ink)]">Posted</dt>
                    <dd>{formatOrderDateTime(order.shippedAt) ?? "Not yet"}</dd>
                  </div>
                )}
              </dl>
              <div className="space-y-2">
                <p className={SECTION_LABEL}>Progress</p>
                <OrderTimeline order={order} />
              </div>
            </Card>
          )}

          {order.status === "paid" ? <WhatHappensNext /> : null}
          {isPosted ? <DeliveryCard order={order} /> : null}

          <OrderSummaryCard order={order} />
          <AddressCard order={order} />

          <p className="text-center text-xs text-[color:var(--color-ink-muted)]">
            Questions about this order?{" "}
            {BUSINESS.email ? (
              <>
                Email{" "}
                <a
                  href={`mailto:${BUSINESS.email}?subject=${encodeURIComponent(`Order ${order.orderNumber}`)}`}
                  className="font-semibold text-[color:var(--color-primary)] hover:underline"
                >
                  {BUSINESS.email}
                </a>{" "}
                and quote {order.orderNumber}.
              </>
            ) : (
              <>
                <Link href="/contact" className="font-semibold text-[color:var(--color-primary)] hover:underline">
                  Contact us
                </Link>{" "}
                and quote {order.orderNumber}.
              </>
            )}
          </p>
        </div>
      </Container>
    </section>
  );
};
