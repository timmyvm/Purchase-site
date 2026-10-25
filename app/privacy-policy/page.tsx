import type { Metadata } from "next";
import {
  PolicyContact,
  PolicyLink,
  PolicyList,
  PolicyPage,
  PolicySection,
} from "@/app/components/sections/PolicyPage";
import { POLICY_ENTITY } from "@/app/components/sections/PolicyFacts";
import { BUSINESS } from "@/app/lib/business-identity";
import { SHIPPING_FACTS } from "@/app/lib/shipping";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${BUSINESS.tradingName} collects, uses and stores the personal information you give us when you order, sign up for drop alerts or contact us. We don't sell your information.`,
  alternates: { canonical: "/privacy-policy" },
};

// Keep this page in step with what the code actually collects:
// PlaceOrderInput (app/lib/orders.ts), /api/subscribe, /api/contact, the
// cart in localStorage and Vercel Analytics / Speed Insights in the layout.
export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" lastUpdated="2026-10-25">
      <p>
        This Privacy Policy explains how {POLICY_ENTITY} collects, uses, stores and discloses
        personal information when you use this website, place an order, sign up for drop alerts
        or contact us. We handle personal information in line with the Australian Privacy
        Principles in the Privacy Act 1988 (Cth).
      </p>

      <PolicySection heading="Information We Collect">
        <p>When you place an order, we collect:</p>
        <PolicyList
          items={[
            "Your name",
            "Your email address",
            "Your shipping address",
            "Your phone number, if you choose to give one",
            "Your order details: the stickers, sizes and quantities you ordered, the totals and the order's payment and shipping status",
            "Whether you've opted in to emails about new drops",
          ]}
        />
        <p>
          When you sign up for drop alerts, we collect your email address and which sign-up form
          you used. When you use our contact form, we collect your name, email address, order
          number (if you give one) and your message.
        </p>
        <p>
          We don&apos;t take card payments, so we never see card details. When you pay by bank
          transfer, our bank shows us the amount, the reference and the name on the account the
          payment came from.
        </p>
      </PolicySection>

      <PolicySection heading="How We Use It">
        <p>We use personal information to:</p>
        <PolicyList
          items={[
            "Process, pack and post your order",
            "Send you emails about your order, such as your order confirmation and payment details",
            "Match your bank transfer to your order",
            "Reply to messages you send us",
            "Send drop alerts and news about new designs, only if you've signed up or opted in",
            "Prevent fraud and misuse of the website",
            "Keep the records we're required to keep by law",
          ]}
        />
        <p>
          You can stop drop alerts and marketing emails at any time: <PolicyContact /> and
          we&apos;ll take you off the list.
        </p>
      </PolicySection>

      <PolicySection heading="Who We Share It With">
        <p>
          We don&apos;t sell or rent personal information, and we don&apos;t share it with
          advertisers. We use these service providers to run the store, and each only receives
          what it needs to do its job:
        </p>
        <PolicyList
          items={[
            <>
              <strong>Supabase</strong> stores our orders, drop-alert sign-ups and product
              catalogue.
            </>,
            <>
              <strong>Resend</strong> sends our emails, including order confirmations and
              messages from the contact form.
            </>,
            <>
              <strong>Vercel</strong> hosts the website and provides our website analytics.
            </>,
            <>
              <strong>{SHIPPING_FACTS.carrier}</strong> receives your name and address on the
              mailer so it can deliver your order.
            </>,
            <>
              <strong>Our bank</strong> processes the bank transfer you send us.
            </>,
          ]}
        />
        <p>
          Some of these providers store or process information outside Australia, including in
          the United States.
        </p>
      </PolicySection>

      <PolicySection heading="Analytics, Cookies and Browser Storage">
        <p>
          We use Vercel Web Analytics and Speed Insights to understand how the site is used and
          how quickly pages load. Web Analytics is cookieless: it counts page views and records
          general information such as the page visited, the referring site, browser, device type
          and country, without identifying you. Speed Insights measures page performance. We
          don&apos;t use advertising or tracking cookies.
        </p>
        <p>
          Your cart is saved in your browser&apos;s local storage on your own device, so it&apos;s
          still there if you refresh or come back later. It isn&apos;t sent to us until you place
          an order, and you can remove it by emptying your cart or clearing your browser&apos;s
          site data. If you close the promo bar, your browser remembers that until you close the
          tab.
        </p>
        <p>
          Like any website host, our hosting provider processes your IP address to deliver pages
          to you and to protect the site from abuse.
        </p>
      </PolicySection>

      <PolicySection heading="Storage and Security">
        <p>
          Order, sign-up and contact records are held by our service providers and can only be
          read by our own server, not from the public website. We take reasonable steps to
          protect personal information from misuse, loss and unauthorised access, but no online
          system can be guaranteed completely secure.
        </p>
      </PolicySection>

      <PolicySection heading="How Long We Keep It">
        <p>
          We keep order records for as long as we need them to fulfil the order and to meet our
          tax and consumer law obligations. Drop-alert sign-ups are kept until you ask to be
          removed.
        </p>
      </PolicySection>

      <PolicySection heading="Access, Correction and Deletion">
        <p>
          You can ask to see the personal information we hold about you, to correct it, or to
          delete it. To make a request, <PolicyContact />. We&apos;ll delete what we can, except
          records we&apos;re required by law to keep.
        </p>
      </PolicySection>

      <PolicySection heading="Questions and Complaints">
        <p>
          If you have a question or a complaint about how we&apos;ve handled your personal
          information, <PolicyContact /> and we&apos;ll respond. If you&apos;re not satisfied with
          our response, you can contact the Office of the Australian Information Commissioner at{" "}
          <a
            href="https://www.oaic.gov.au"
            target="_blank"
            rel="noreferrer"
            className="text-[color:var(--color-primary)] underline"
          >
            oaic.gov.au
          </a>
          .
        </p>
      </PolicySection>

      <PolicySection heading="Changes to This Policy">
        <p>
          We may update this policy from time to time. The current version is always published
          on this page, with the date it was last updated. Questions about ordering are covered
          in our <PolicyLink href="/terms-of-service">Terms of Service</PolicyLink>.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
