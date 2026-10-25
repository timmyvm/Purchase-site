import type { ReactNode } from "react";
import { Container } from "@/app/components/ui/Container";
import {
  DISPATCH_CLAIM_WITH_ORIGIN,
  FREE_SHIPPING_CLAIM,
  SHIPPING_FACTS,
} from "@/app/lib/shipping";

/**
 * Four facts directly under the hero, in the slot (and layout) of APL's
 * TrustpilotBanner: icon on top, label, sub-label. Facts only — every line
 * holds for every order, and the shipping lines read app/lib/shipping.ts.
 */
const FACTS: Array<{ title: string; detail: string; icon: ReactNode }> = [
  {
    title: FREE_SHIPPING_CLAIM,
    detail: `A$${SHIPPING_FACTS.feeAud.toFixed(2)} Australia-wide under that`,
    icon: (
      <>
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="1.6" />
        <circle cx="17.5" cy="17" r="1.6" />
      </>
    ),
  },
  {
    title: DISPATCH_CLAIM_WITH_ORIGIN,
    detail: `${SHIPPING_FACTS.carrier}, ${SHIPPING_FACTS.service.toLowerCase()}`,
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  {
    title: "Limited runs, never reprinted",
    detail: "Each design is printed once, in the quantity on its page",
    icon: (
      <>
        <path d="M5 4h10l4 4v12H5z" />
        <path d="M15 4v4h4" />
        <path d="M9 13h6" />
        <path d="M9 16h4" />
      </>
    ),
  },
  {
    title: "Die-cut vinyl, gloss & holographic",
    detail: "Cut to the shape of the artwork",
    icon: (
      <>
        <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z" />
        <path d="M18 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />
      </>
    ),
  },
];

const IconTile = ({ children }: { children: ReactNode }) => (
  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(59,130,246,0.09)] text-[color:var(--color-primary)]">
    <svg
      viewBox="0 0 24 24"
      className="h-[22px] w-[22px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  </span>
);

export const FactsStrip = () => (
  <section className="border-b border-[color:var(--color-border)]">
    <Container className="py-8 sm:py-10">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {FACTS.map((fact) => (
          <li key={fact.title} className="flex flex-col items-center gap-2.5 text-center">
            <IconTile>{fact.icon}</IconTile>
            <span className="font-display text-[15px] font-bold text-[color:var(--color-ink)]">
              {fact.title}
            </span>
            <span className="text-[12px] leading-snug text-[color:var(--color-ink-muted)]">
              {fact.detail}
            </span>
          </li>
        ))}
      </ul>
    </Container>
  </section>
);
