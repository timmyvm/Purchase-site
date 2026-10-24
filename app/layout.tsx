import "./globals.css";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { RootShell } from "@/app/components/layout/RootShell";
import { Footer } from "@/app/components/layout/Footer";
import { Providers } from "@/app/providers/Providers";
import { getStorefrontProducts } from "@/app/lib/data";
import { toNavProducts } from "@/app/lib/nav-products";
import { getBaseUrl } from "@/app/lib/metadata";
import { SITE } from "@/app/lib/site";
import { DISPATCH_CLAIM_WITH_ORIGIN } from "@/app/lib/shipping";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  applicationName: SITE.brand.name,
  title: {
    default: `${SITE.brand.name} | Limited-Run Stickers Australia`,
    template: `%s | ${SITE.brand.name}`,
  },
  description: `Limited-run die-cut vinyl stickers designed in Melbourne. Once a design sells out it isn't reprinted. ${DISPATCH_CLAIM_WITH_ORIGIN}.`,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    siteName: SITE.brand.name,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const products = await getStorefrontProducts();

  return (
    <html lang="en-AU" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Analytics />
        <SpeedInsights />
        <Providers>
          <RootShell
            products={toNavProducts(products)}
            promoMessages={SITE.promoMessages}
            footer={<Footer />}
          >
            {children}
          </RootShell>
        </Providers>
      </body>
    </html>
  );
}
