import type { Metadata } from "next";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { HeroSection } from "@/app/components/sections/HeroSection";
import { FactsStrip } from "@/app/components/sections/FactsStrip";
import { IntroSection } from "@/app/components/sections/IntroSection";
import { ProductShowcaseSection } from "@/app/components/sections/ProductShowcaseSection";
import { CollectionTiles } from "@/app/components/sections/CollectionTiles";
import { FullSetSection } from "@/app/components/sections/FullSetSection";
import { HomeFaqSection } from "@/app/components/sections/HomeFaqSection";
import { EmailCaptureSection } from "@/app/components/sections/EmailCaptureSection";
import { buildOrganizationSchema } from "@/app/lib/organization-schema";
import { getStorefrontProducts } from "@/app/lib/data";
import { getBaseUrl } from "@/app/lib/metadata";
import { getCollection } from "@/app/lib/collections";
import { isProductSoldOut } from "@/app/lib/currency";
import { productPath } from "@/app/lib/product-slugs";
import { DISPATCH_CLAIM_WITH_ORIGIN } from "@/app/lib/shipping";
import { SITE } from "@/app/lib/site";
import type { Product } from "@/app/lib/types";

// ISR: identical for every visitor. Stock moves with every order, so the
// window is short; checkout re-checks stock in place_sticker_order().
export const revalidate = 60;

const HOME_DESCRIPTION = `Limited-run die-cut vinyl stickers designed in Melbourne. Once a design sells out it isn't reprinted. ${DISPATCH_CLAIM_WITH_ORIGIN}.`;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    siteName: SITE.brand.name,
    type: "website",
    url: "/",
    title: `${SITE.brand.name} | Limited-Run Stickers Australia`,
    description: HOME_DESCRIPTION,
    images: [
      {
        url: "/images/stickers/drop-01-set.png",
        width: 1024,
        height: 1024,
        alt: "The Drop 01 stickers laid out together",
      },
    ],
  },
};

// Pinned so the hero never drifts as sort order or stock changes; falls back
// to the first showcased designs if any of these is no longer listed.
const HERO_PICKER_SLUGS = ["bin-chicken", "last-laugh", "quokka-grin"];
const SHOWCASE_COUNT = 8;
const DROP_SLUG = "drop-01";

export default async function HomePage() {
  const products = await getStorefrontProducts();
  const baseUrl = getBaseUrl();
  const drop = getCollection(DROP_SLUG);

  const dropSingles = products
    .filter((product) => product.kind === "single" && (drop ? drop.match(product) : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  // In-stock designs first (catalogue order within each group), then the
  // first eight: two rows of four on desktop, a scroll row on phones.
  const showcase = [
    ...dropSingles.filter((product) => !isProductSoldOut(product)),
    ...dropSingles.filter(isProductSoldOut),
  ].slice(0, SHOWCASE_COUNT);

  const heroPicks = HERO_PICKER_SLUGS.map((slug) =>
    products.find((product) => product.slug === slug)
  ).filter((product): product is Product => Boolean(product));
  const pickerProducts = heroPicks.length === HERO_PICKER_SLUGS.length ? heroPicks : showcase.slice(0, 3);

  const dropName = dropSingles[0]?.dropName ?? "Drop 01";
  const finishes = [...new Set(dropSingles.map((product) => product.finish))];
  const set =
    products.find(
      (product) => product.kind === "set" && (drop ? drop.match(product) : true)
    ) ?? null;

  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.brand.name,
    url: baseUrl,
    publisher: { "@id": organizationSchema["@id"] },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  // ItemList of exactly the cards the showcase renders, in its order.
  const showcaseSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: drop?.label ?? dropName,
    numberOfItems: showcase.length,
    itemListElement: showcase.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `${baseUrl}${productPath(product)}`,
    })),
  };

  return (
    <div>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      {showcase.length > 0 ? <JsonLd data={showcaseSchema} /> : null}

      <HeroSection
        pickerProducts={pickerProducts}
        dropName={dropName}
        designCount={dropSingles.length}
        finishes={finishes}
      />
      {/* Facts strip in the slot of APL's trust bridge: shipping, dispatch,
          the limited-run rule and the material. */}
      <FactsStrip />
      {/* Brand heading with the first body links (/shop, the drop), directly
          above the grid and kept to one short paragraph. */}
      <IntroSection products={products} exampleSlugs={HERO_PICKER_SLUGS} />
      {showcase.length > 0 ? (
        <ProductShowcaseSection
          title={drop?.label ?? dropName}
          subtitle={drop?.blurb ?? ""}
          products={showcase}
          viewAllLabel={`Shop all ${products.length} stickers`}
          viewAllHref="/shop"
        />
      ) : null}
      <CollectionTiles products={products} />
      {set ? <FullSetSection set={set} products={products} /> : null}
      <HomeFaqSection />
      <EmailCaptureSection source="home" />
    </div>
  );
}
