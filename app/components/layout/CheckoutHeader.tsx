import Link from "next/link";
import { Container } from "@/app/components/ui/Container";
import { LogoMark } from "@/app/components/ui/LogoMark";
import { BUSINESS } from "@/app/lib/business-identity";

/**
 * Distraction-free checkout header: logo and a secure badge only. No nav,
 * search or cart at the highest-stakes step; the logo stays clickable as the
 * single escape hatch.
 */
export const CheckoutHeader = () => (
  <header className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)]">
    <Container className="flex h-16 items-center justify-between">
      <Link
        href="/"
        aria-label={`${BUSINESS.tradingName} — back to store`}
        className="flex items-center text-[color:var(--color-ink)]"
      >
        <LogoMark className="h-10 max-w-[10rem] sm:h-[46px] sm:max-w-none" />
      </Link>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)]">
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5 text-[color:var(--color-success)]"
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
        Secure Checkout
      </p>
    </Container>
  </header>
);
