import type { Metadata } from "next";
import {
  PolicyContact,
  PolicyFactsTable,
  PolicyLink,
  PolicyPage,
  PolicySection,
  type PolicyFactRow,
} from "@/app/components/sections/PolicyPage";
import { POLICY_ENTITY, formatAudShort } from "@/app/components/sections/PolicyFacts";
import { BUSINESS } from "@/app/lib/business-identity";
import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";
import { SHIPPING_FACTS } from "@/app/lib/shipping";

// Every figure on this page comes from SHIPPING_FACTS (and UNPAID_ORDER_HOURS),
// the same numbers the promo bar, cart, checkout and place_sticker_order() use.
const {
  carrier,
  service,
  feeAud,
  freeThresholdAud,
  handlingBusinessDays: handling,
  transitBusinessDays: transit,
  dispatchFrom,
} = SHIPPING_FACTS;

const fee = formatAudShort(feeAud);
const threshold = formatAudShort(freeThresholdAud);
const range = (min: number, max: number) => `${min}–${max} business days`;
const latestDeliveryDays = handling.max + transit.max;

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `${BUSINESS.tradingName} posts Australia-wide by ${carrier} for ${fee}, free on orders of ${threshold} or more. Posted from ${dispatchFrom} within ${range(handling.min, handling.max)} of payment.`,
  alternates: { canonical: "/shipping-policy" },
};

const shippingRows: PolicyFactRow[] = [
  { label: "Carrier", value: `${carrier}.` },
  {
    label: "Shipping method",
    value: `${service}, so your stickers arrive flat. Every order is sent this way.`,
  },
  { label: "Shipping cost", value: `${fee} flat rate per order, Australia-wide.` },
  {
    label: "Free shipping",
    value: `Orders with a sticker subtotal of ${threshold} or more ship free.`,
  },
  {
    label: "Handling time",
    value: `${range(handling.min, handling.max)} from when your payment arrives.`,
  },
  {
    label: "Transit time",
    value: `Usually ${range(transit.min, transit.max)} after posting (${carrier} letter estimate).`,
  },
  {
    label: "Total estimated delivery",
    value: `${range(handling.min + transit.min, latestDeliveryDays)} from when your payment arrives.`,
  },
  { label: "Ships from", value: `${dispatchFrom}, ${BUSINESS.dispatchFrom.country}.` },
  { label: "Delivery area", value: "Australian addresses only." },
];

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy" lastUpdated="2026-10-25">
      <p>
        This Shipping Policy sets out what shipping costs, where we deliver and how long delivery
        takes for orders placed with {POLICY_ENTITY}. Every order is packed and posted from{" "}
        {dispatchFrom}.
      </p>

      <PolicySection heading="Shipping Costs and Delivery Times">
        <p>
          The same shipping terms apply on every product page, in the cart and at checkout.
          Shipping is charged once per order, not per sticker.
        </p>
        <PolicyFactsTable rows={shippingRows} />
        <p>
          Shipping is shown as its own line in the cart and at checkout before you place your
          order, and the total you&apos;re asked to pay already includes it.
        </p>
      </PolicySection>

      <PolicySection heading="Where We Ship">
        <p>
          {BUSINESS.tradingName} ships within Australia only. International shipping isn&apos;t
          available yet, so checkout only accepts Australian addresses.
        </p>
      </PolicySection>

      <PolicySection heading="Payment and Dispatch">
        <p>
          Orders are paid by bank transfer, using your order number as the payment reference.
          We post your order within {range(handling.min, handling.max)} of your payment arriving
          and being matched to that order number. Business days are Monday to Friday, excluding
          public holidays.
        </p>
        <p>
          You can check where your order is up to at any time on the{" "}
          <PolicyLink href="/order-status">Track Order</PolicyLink> page.
        </p>
      </PolicySection>

      <PolicySection heading="Unpaid Orders">
        <p>
          Placing an order holds your stickers for {UNPAID_ORDER_HOURS} hours. If the payment
          hasn&apos;t arrived by then, the order is cancelled automatically and the stickers go
          back on sale, so a limited run isn&apos;t tied up by orders that never complete. Nothing
          is posted for a cancelled order. If you still want the stickers, you&apos;re welcome to
          place a new order while they&apos;re available.
        </p>
      </PolicySection>

      <PolicySection heading="Delivery Timeframes">
        <p>
          Delivery times are <strong>estimates</strong> based on {carrier}&apos;s standard letter
          delivery. Once your order is handed to {carrier}, we can&apos;t control exactly when it
          arrives: regional and remote addresses, peak periods, weather and network delays can
          all add time.
        </p>
      </PolicySection>

      <PolicySection heading="Your Delivery Address">
        <p>
          We post to the address on your order, so please check it carefully at checkout. If you
          spot a mistake after ordering, <PolicyContact /> with your order number as soon as you
          can, so it can be corrected before the order is posted.
        </p>
      </PolicySection>

      <PolicySection heading="Lost or Late Orders">
        <p>
          If your order hasn&apos;t arrived within {latestDeliveryDays} business days of your
          payment, <PolicyContact /> with your order number and we&apos;ll look into it with{" "}
          {carrier}.
        </p>
        <p>
          If your stickers arrive damaged, see our{" "}
          <PolicyLink href="/refund-policy">Refund &amp; Replacement Policy</PolicyLink>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
