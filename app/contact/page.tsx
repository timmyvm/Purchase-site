import type { Metadata } from "next";
import { ContactPageClient } from "@/app/components/sections/ContactPageClient";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { BUSINESS, BUSINESS_DISPATCH_LOCATION } from "@/app/lib/business-identity";
import { getBaseUrl } from "@/app/lib/metadata";
import { buildOrganizationSchema } from "@/app/lib/organization-schema";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${BUSINESS.tradingName} in ${BUSINESS_DISPATCH_LOCATION} about an order, shipping, a damaged sticker or a design. Support is by email.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  // ContactPage whose mainEntity is the shared Organization. Not
  // LocalBusiness: there is no shopfront or published street address.
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${BUSINESS.tradingName}`,
    url: `${getBaseUrl()}/contact`,
    inLanguage: "en-AU",
    mainEntity: buildOrganizationSchema(),
  };

  return (
    <>
      <JsonLd data={contactSchema} />
      <ContactPageClient />
    </>
  );
}
