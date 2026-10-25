import { BUSINESS } from "@/app/lib/business-identity";
import { getBaseUrl } from "@/app/lib/metadata";

/**
 * The one Organization entity, shared by the homepage, /about and /contact so
 * every page states the same operator. Fields that aren't configured (legal
 * name, ABN, email) are left out rather than guessed. No street address.
 */
export const buildOrganizationSchema = () => {
  const baseUrl = getBaseUrl();
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: BUSINESS.tradingName,
    ...(BUSINESS.legalName ? { legalName: BUSINESS.legalName } : {}),
    url: baseUrl,
    logo: `${baseUrl}/images/logo.svg`,
    ...(BUSINESS.email ? { email: BUSINESS.email } : {}),
    ...(BUSINESS.abn
      ? { identifier: { "@type": "PropertyValue", propertyID: "ABN", value: BUSINESS.abn } }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.dispatchFrom.city,
      addressRegion: BUSINESS.dispatchFrom.state,
      addressCountry: BUSINESS.dispatchFrom.countryCode,
    },
    ...(instagram ? { sameAs: [instagram] } : {}),
  };
};
