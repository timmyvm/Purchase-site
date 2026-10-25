import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getOrderByNumber, type StoredOrder } from "@/app/lib/orders";
import { isValidOrderStatusToken } from "@/app/lib/order-status-token";
import { Container } from "@/app/components/ui/Container";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { OrderLookupForm } from "@/app/components/cart/OrderLookupForm";
import { OrderStatusView } from "@/app/components/cart/OrderStatusView";

// Signed, per-order and live: never cached, never indexed.
export const dynamic = "force-dynamic";

type Params = Promise<{ orderNumber: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const ORDER_NUMBER_PATTERN = /^S\d{6}$/;

const normalizeOrderNumber = (raw: string) => {
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    // Already decoded, or malformed: use as-is and let the pattern decide.
  }
  return value.trim().toUpperCase();
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const orderNumber = normalizeOrderNumber((await params).orderNumber);
  return {
    title: ORDER_NUMBER_PATTERN.test(orderNumber) ? `Order ${orderNumber}` : "Your Order",
    robots: { index: false, follow: false },
  };
}

const PageFrame = ({ children }: { children: ReactNode }) => (
  <section className="py-10 sm:py-14">
    <Container>
      <div className="mx-auto w-full max-w-2xl">{children}</div>
    </Container>
  </section>
);

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const orderNumber = normalizeOrderNumber((await params).orderNumber);
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) notFound();

  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t : undefined;

  // No (or a wrong) signature: the order number alone opens nothing. Ask for
  // the email instead; the lookup API answers with the signed link.
  if (!isValidOrderStatusToken(orderNumber, token)) {
    return (
      <PageFrame>
        <OrderLookupForm
          initialOrderNumber={orderNumber}
          heading="Enter the email you ordered with"
          intro={`To open order ${orderNumber}, confirm the email address it was placed with. The link in your confirmation email opens it directly.`}
        />
      </PageFrame>
    );
  }

  let order: StoredOrder | null;
  try {
    order = await getOrderByNumber(orderNumber);
  } catch (error) {
    // Supabase unset or unreachable: a friendly state, never a crash.
    console.error("[order-status] order lookup failed", error);
    return (
      <PageFrame>
        <div className="space-y-4 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-6 text-center shadow-soft">
          <h1 className="font-display text-2xl font-semibold text-[color:var(--color-ink)]">
            Order tracking is unavailable right now
          </h1>
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            We couldn&apos;t load order {orderNumber} just now. Please try again in a few
            minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <LinkButton href={`/order-status/${orderNumber}?t=${encodeURIComponent(token ?? "")}`}>
              Try again
            </LinkButton>
            <LinkButton href="/contact" variant="secondary">
              Contact us
            </LinkButton>
          </div>
        </div>
      </PageFrame>
    );
  }

  if (!order) notFound();

  return <OrderStatusView order={order} now={Date.now()} />;
}
