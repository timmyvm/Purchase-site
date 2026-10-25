import type { Metadata } from "next";
import {
  PolicyContact,
  PolicyLink,
  PolicyList,
  PolicyPage,
  PolicySection,
} from "@/app/components/sections/PolicyPage";
import { DAMAGE_CLAIM_WINDOW_DAYS, POLICY_ENTITY } from "@/app/components/sections/PolicyFacts";
import { BUSINESS } from "@/app/lib/business-identity";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";

export const metadata: Metadata = {
  title: "Refund & Replacement Policy",
  description: `Damaged, faulty or not as described? Email ${BUSINESS.tradingName} a photo within ${DAMAGE_CLAIM_WINDOW_DAYS} days of delivery for a replacement, or a refund if the design has sold out. Your Australian Consumer Law rights always apply.`,
  alternates: { canonical: "/refund-policy" },
};

// The damage promise here is the one app/lib/faqs.ts makes ("Email us a photo
// within 14 days of delivery and we'll replace them, or refund you if that
// design has sold out"). Change both together.
export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund & Replacement Policy" lastUpdated="2026-10-25">
      <p>
        This policy covers replacements and refunds for stickers bought from {POLICY_ENTITY}.
        Nothing in it limits or replaces your rights under the Australian Consumer Law.
      </p>

      <PolicySection heading="Your Rights Under the Australian Consumer Law">
        <p>
          Our goods come with guarantees that cannot be excluded under the Australian Consumer
          Law. You are entitled to a replacement or refund for a major failure and compensation
          for any other reasonably foreseeable loss or damage. You are also entitled to have the
          goods repaired or replaced if the goods fail to be of acceptable quality and the
          failure does not amount to a major failure.
        </p>
        <p>
          For stickers, that means if what arrives is damaged, faulty (for example misprinted or
          cut badly) or not what you ordered, we&apos;ll put it right.
        </p>
      </PolicySection>

      <PolicySection heading="Damaged on Arrival">
        <p>
          If your stickers arrive damaged, email us a photo within {DAMAGE_CLAIM_WINDOW_DAYS} days
          of delivery and we&apos;ll replace them, or refund you if that design has sold out. A
          photo is all we need: you don&apos;t have to post anything back.
        </p>
        <p>Please include:</p>
        <PolicyList
          items={[
            "Your order number",
            "A photo of the damaged stickers",
            "Which designs and sizes are affected",
          ]}
        />
        <p>
          The {DAMAGE_CLAIM_WINDOW_DAYS}-day window is how our replacement promise works. It
          doesn&apos;t shorten your rights under the Australian Consumer Law, which can still apply
          to a problem you find later.
        </p>
      </PolicySection>

      <PolicySection heading="Faulty or Not as Described">
        <p>
          The same applies if a sticker is faulty, or if your order arrives with the wrong design
          or size, or with something missing: tell us with your order number and a photo, and
          we&apos;ll send what you ordered or refund it if that design has sold out.
        </p>
      </PolicySection>

      <PolicySection heading="Replacement or Refund">
        <p>
          Replacements come from the same print run. Because each design is printed only once,
          a design that has sold out can&apos;t be replaced, so we refund those stickers instead.
        </p>
        <p>
          Where the problem is a major failure under the Australian Consumer Law, you can choose a
          refund instead of a replacement. Orders are paid by bank transfer, so refunds are paid
          the same way: we&apos;ll ask which account to send it to.
        </p>
      </PolicySection>

      <PolicySection heading="Change of Mind">
        <p>
          We don&apos;t offer refunds or exchanges for a change of mind, such as choosing a
          different size or deciding you no longer want a design. Each design is a limited run
          that isn&apos;t restocked, so stickers that have been sent out aren&apos;t taken back
          into stock.
        </p>
        <p>
          This doesn&apos;t affect your rights if a sticker is damaged, faulty or not as
          described.
        </p>
      </PolicySection>

      <PolicySection heading="Unpaid and Cancelled Orders">
        <p>
          An order that isn&apos;t paid within {UNPAID_ORDER_HOURS} hours is cancelled
          automatically, so there is nothing to refund. If a payment reaches us after its order
          was cancelled, <PolicyContact /> and we&apos;ll refund it in full.
        </p>
      </PolicySection>

      <PolicySection heading="How to Make a Claim">
        <p>
          To make a claim, <PolicyContact /> with your order number and a short description of
          the problem.
          {BUSINESS.email
            ? " Attach your photo to the email."
            : " We'll reply by email, and you can send your photo in reply."}{" "}
          Shipping questions are covered in our{" "}
          <PolicyLink href="/shipping-policy">Shipping Policy</PolicyLink>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
