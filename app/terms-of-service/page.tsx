import type { Metadata } from "next";
import {
  PolicyContact,
  PolicyLink,
  PolicyList,
  PolicyPage,
  PolicySection,
} from "@/app/components/sections/PolicyPage";
import { POLICY_ENTITY, POLICY_OWNER } from "@/app/components/sections/PolicyFacts";
import {
  BUSINESS,
  BUSINESS_DISPATCH_LOCATION,
  BUSINESS_ENTITY_WITH_ABN,
} from "@/app/lib/business-identity";
import { MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for buying limited-run stickers from ${BUSINESS.tradingName}: orders, bank transfer payment, limited runs, quantity limits, intellectual property and governing law.`,
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <PolicyPage title="Terms of Service" lastUpdated="2026-10-25">
      <p>
        These Terms of Service apply when you use this website or buy stickers from{" "}
        {POLICY_ENTITY} (&ldquo;{BUSINESS.tradingName}&rdquo;, &ldquo;we&rdquo;,
        &ldquo;us&rdquo;). By placing an order, you agree to them.
      </p>
      <p>
        Nothing in these terms excludes, restricts or modifies any right or remedy you have under
        the Australian Consumer Law.
      </p>

      <PolicySection heading="Who You Are Buying From">
        <p className="font-semibold text-[color:var(--color-ink)]">{BUSINESS_ENTITY_WITH_ABN}</p>
        <p>
          Based in {BUSINESS_DISPATCH_LOCATION}, {BUSINESS.dispatchFrom.country}. Support is by
          email only: to get in touch, <PolicyContact />.
        </p>
      </PolicySection>

      <PolicySection heading="The Stickers">
        <p>
          We sell die-cut vinyl stickers. Each product page describes the design, finish, sizes
          and the size of its print run. Product images show the design; colours and holographic
          effects can look slightly different on different screens.
        </p>
      </PolicySection>

      <PolicySection heading="Limited Runs">
        <p>
          Each design is printed once, in the quantity shown on its page. When that run sells
          out, the design is retired and isn&apos;t reprinted. A design selling out isn&apos;t a
          fault, and we can&apos;t take orders for a design once its run is gone.
        </p>
      </PolicySection>

      <PolicySection heading="Prices">
        <p>
          Prices are in Australian dollars. Shipping is charged per order as set out in our{" "}
          <PolicyLink href="/shipping-policy">Shipping Policy</PolicyLink>, and is shown before
          you place your order. The price that applies is the one shown at checkout when you
          place your order.
        </p>
      </PolicySection>

      <PolicySection heading="Orders and Acceptance">
        <p>
          When you place an order, we hold the stickers for you and give you an order number.
          Your order is accepted once your payment arrives and is matched to that order number.
        </p>
        <p>We may cancel an order before it is accepted, for example where:</p>
        <PolicyList
          items={[
            "the payment doesn't arrive in time (see Payment below)",
            "a price or stock figure on the site was clearly wrong",
            "we reasonably suspect the order is fraudulent",
          ]}
        />
        <p>If we cancel an order you have already paid for, we refund what you paid in full.</p>
      </PolicySection>

      <PolicySection heading="Payment">
        <p>
          Orders are paid by bank transfer, using your order number as the payment reference.
          Payment is due within {UNPAID_ORDER_HOURS} hours of placing the order. If it
          hasn&apos;t arrived by then, the order is cancelled automatically and the stickers go
          back on sale.
        </p>
      </PolicySection>

      <PolicySection heading="Quantity Limits">
        <p>
          You can order up to {MAX_QUANTITY_PER_ITEM} of each design and size per order, so one
          basket can&apos;t take a whole run.
        </p>
      </PolicySection>

      <PolicySection heading="Shipping">
        <p>
          We ship to Australian addresses only. Costs, handling and delivery times are in our{" "}
          <PolicyLink href="/shipping-policy">Shipping Policy</PolicyLink>. Delivery times are
          estimates.
        </p>
      </PolicySection>

      <PolicySection heading="Refunds and Replacements">
        <p>
          Damaged, faulty or incorrect stickers are replaced or refunded as set out in our{" "}
          <PolicyLink href="/refund-policy">Refund &amp; Replacement Policy</PolicyLink>. We
          don&apos;t offer refunds for a change of mind. This doesn&apos;t affect your rights
          under the Australian Consumer Law.
        </p>
      </PolicySection>

      <PolicySection heading="Intellectual Property">
        <p>
          The sticker designs and artwork, and the text, images and branding on this website,
          belong to {POLICY_OWNER}. Buying a sticker lets you use and display that sticker. It
          doesn&apos;t give you the right to copy, reprint, or sell the designs or make products
          from them.
        </p>
      </PolicySection>

      <PolicySection heading="Using This Website">
        <p>
          Please don&apos;t use the website to place fraudulent orders, to get around the quantity
          limits, or in a way that interferes with how it works for other people.
        </p>
      </PolicySection>

      <PolicySection heading="Liability">
        <p>
          Your rights under the Australian Consumer Law always apply. Beyond those rights, and to
          the extent the law allows, our liability for any order is limited to the amount you paid
          for it.
        </p>
      </PolicySection>

      <PolicySection heading="Privacy">
        <p>
          How we handle your personal information is set out in our{" "}
          <PolicyLink href="/privacy-policy">Privacy Policy</PolicyLink>.
        </p>
      </PolicySection>

      <PolicySection heading="Governing Law">
        <p>
          These terms are governed by the laws of Victoria, Australia. Any dispute is subject to
          the jurisdiction of the courts of Victoria.
        </p>
      </PolicySection>

      <PolicySection heading="Changes to These Terms">
        <p>
          We may update these terms from time to time. The version published here when you place
          an order is the one that applies to that order.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
