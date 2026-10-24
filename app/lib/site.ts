import { BUSINESS } from "@/app/lib/business-identity";
import { DISPATCH_CLAIM_WITH_ORIGIN, FREE_SHIPPING_CLAIM } from "@/app/lib/shipping";

export type NavLink = {
  label: string;
  /** Absent on group headers that only open a dropdown (e.g. Learn). */
  href?: string;
  children?: Array<{ label: string; href: string }>;
};

export const SITE = {
  brand: {
    name: BUSINESS.tradingName,
    tagline: "Limited-run die-cut stickers, designed and posted from Melbourne.",
  },
  navigation: {
    ariaLabel: "Primary",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Drop 01", href: "/collections/drop-01" },
      {
        label: "Learn",
        children: [
          { label: "About Us", href: "/about" },
          { label: "FAQ", href: "/faq" },
          { label: "Shipping", href: "/shipping-policy" },
        ],
      },
      { label: "Track Order", href: "/order-status" },
      { label: "Contact", href: "/contact" },
    ] satisfies NavLink[],
  },
  storage: {
    cartKey: "peel-cart-v1",
  },
  // Promo bar messages, two at a time. Facts only: every line here must be
  // true for every order.
  promoMessages: [
    FREE_SHIPPING_CLAIM,
    "Limited runs: once a design sells out, it isn't reprinted",
    DISPATCH_CLAIM_WITH_ORIGIN,
  ],
  copyright: `© ${new Date().getFullYear()} ${BUSINESS.tradingName}. All rights reserved.`,
} as const;
