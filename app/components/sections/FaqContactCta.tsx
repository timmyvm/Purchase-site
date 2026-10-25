import Link from "next/link";
import { LinkButton } from "@/app/components/ui/LinkButton";

const policyLinks = [
  { label: "Shipping Policy", href: "/shipping-policy" },
  { label: "Refund & Replacement Policy", href: "/refund-policy" },
  { label: "Track Order", href: "/order-status" },
];

/** Closing card on /faq: the route to a human when the answers run out. */
export const FaqContactCta = () => (
  <section
    aria-labelledby="faq-contact-heading"
    className="space-y-5 rounded-[2rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-6 py-8 shadow-card sm:px-8 sm:py-10"
  >
    <div className="space-y-2">
      <h2
        id="faq-contact-heading"
        className="font-display text-2xl font-semibold tracking-[-0.02em] text-[color:var(--color-ink)]"
      >
        Still have a question?
      </h2>
      <p className="text-base leading-relaxed text-[color:var(--color-ink-muted)]">
        Send us a message and we&apos;ll reply by email. If it&apos;s about an order, include
        your order number.
      </p>
    </div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <LinkButton href="/contact" className="w-full sm:w-auto">
        Contact us
      </LinkButton>
      <nav aria-label="Policies" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {policyLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  </section>
);
