import Link from "next/link";
import { BUSINESS_ENTITY_WITH_ABN } from "@/app/lib/business-identity";

const POLICY_LINK_CLASS = "underline transition hover:text-[color:var(--color-ink)]";

/**
 * Policy links + who the buyer is paying. ONE component, rendered in BOTH the
 * desktop summary (`hidden lg:block`) and the phone column — a block that
 * lives only in the summary renders nowhere on mobile. Links open a new tab
 * so reading a policy mid-checkout doesn't throw away the typed address.
 */
export const CheckoutPolicyBlock = () => (
  <div className="space-y-2">
    <p className="text-center text-[11px] leading-relaxed text-[color:var(--color-ink-muted)]">
      By placing your order you agree to our{" "}
      <Link href="/terms-of-service" target="_blank" rel="noopener" className={POLICY_LINK_CLASS}>
        Terms of Service
      </Link>
      ,{" "}
      <Link href="/privacy-policy" target="_blank" rel="noopener" className={POLICY_LINK_CLASS}>
        Privacy Policy
      </Link>
      ,{" "}
      <Link href="/shipping-policy" target="_blank" rel="noopener" className={POLICY_LINK_CLASS}>
        Shipping Policy
      </Link>{" "}
      and{" "}
      <Link href="/refund-policy" target="_blank" rel="noopener" className={POLICY_LINK_CLASS}>
        Refund &amp; Replacement Policy
      </Link>
      .
    </p>
    <p className="text-center text-[10px] leading-relaxed text-[color:var(--color-ink-subtle)]">
      Sold by {BUSINESS_ENTITY_WITH_ABN}.
    </p>
  </div>
);
