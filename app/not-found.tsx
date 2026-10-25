import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { BUSINESS, BUSINESS_ENTITY_LINE } from "@/app/lib/business-identity";
import { COLLECTIONS } from "@/app/lib/collections";

/**
 * The site-wide 404 (catches notFound() and any URL that matches no route;
 * Next.js adds noindex). Port of APL's: name where the visitor was probably
 * headed instead of a bare "page not found". Neutral copy, no promotion.
 */
export const dynamic = "force-static";

const DESTINATIONS = [
  {
    href: "/shop",
    label: "Browse every sticker",
    body: "Every design we have listed, with live stock and prices.",
  },
  {
    href: "/order-status",
    label: "Track an order",
    body: "Look up an existing order with your order number and email.",
  },
  {
    href: "/cart",
    label: "Your cart",
    body: "Anything you added is still there on this device.",
  },
  {
    href: "/faq",
    label: "FAQ",
    body: "Sizes, shipping, payment and what a limited run means.",
  },
  {
    href: "/shipping-policy",
    label: "Shipping",
    body: "Fees, the free-shipping threshold and delivery times.",
  },
  {
    href: "/contact",
    label: "Contact us",
    body: BUSINESS.email ? `Email ${BUSINESS.email}.` : "How to reach us about an order.",
  },
] as const;

export default function NotFound() {
  return (
    <section className="bg-transparent py-16 sm:py-24">
      <Container className="space-y-12">
        <div className="space-y-5">
          <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink-subtle)]">
            Error 404
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-[1.1] tracking-[-0.025em] text-[color:var(--color-ink)] sm:text-5xl">
            That page isn&apos;t here.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-[color:var(--color-ink-muted)]">
            The link may be out of date, or the address may have picked up a
            stray character on its way here. Nothing is wrong with your order —
            everything below is one tap away.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <LinkButton href="/shop" variant="cta">
              Shop all stickers <span aria-hidden="true">→</span>
            </LinkButton>
            <LinkButton href="/" variant="secondary">
              Back to home
            </LinkButton>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)]">
            Looking for one of these?
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((destination) => (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="flex h-full flex-col gap-1.5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-5 transition hover:border-[color:var(--color-primary-soft)] hover:bg-[color:var(--color-surface)]"
                >
                  <span className="font-display text-base font-bold text-[color:var(--color-ink)]">
                    {destination.label}
                  </span>
                  <span className="text-[13px] leading-relaxed text-[color:var(--color-ink-muted)]">
                    {destination.body}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 border-t border-[color:var(--color-border)] pt-8">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-[color:var(--color-ink)]">
            Shop by collection
          </h2>
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.map((collection) => (
              <Link
                key={collection.slug}
                href={`/collections/${collection.slug}`}
                className="whitespace-nowrap rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-medium text-[color:var(--color-ink-muted)] transition hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-primary-soft)]"
              >
                {collection.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[color:var(--color-ink-subtle)]">
          {BUSINESS_ENTITY_LINE} · Limited-run die-cut stickers, posted from{" "}
          {BUSINESS.dispatchFrom.city}.
        </p>
      </Container>
    </section>
  );
}
