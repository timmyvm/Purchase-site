import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { ShopPageClient } from "@/app/components/products/ShopPageClient";
import { CATALOGUE_DEFAULT_SORT, sortCatalogue } from "@/app/components/products/catalogue-sort";
import { getStorefrontProducts } from "@/app/lib/data";
import { getBaseUrl } from "@/app/lib/metadata";
import { getCollection } from "@/app/lib/collections";
import { isProductSoldOut } from "@/app/lib/currency";
import { productPath } from "@/app/lib/product-slugs";
import { DISPATCH_CLAIM_WITH_ORIGIN, FREE_SHIPPING_CLAIM } from "@/app/lib/shipping";
import { SITE } from "@/app/lib/site";

// Stock moves with every order; checkout re-checks it in place_sticker_order().
export const revalidate = 60;

const SHOP_HEADING = "Shop All Stickers";
const SHOP_DESCRIPTION = `Every ${SITE.brand.name} sticker in one place: limited-run die-cut vinyl designs in gloss and holographic, plus full sets. Once a design sells out it isn't reprinted.`;

export const metadata: Metadata = {
  title: SHOP_HEADING,
  description: SHOP_DESCRIPTION,
  alternates: { canonical: "/shop" },
  openGraph: {
    siteName: SITE.brand.name,
    type: "website",
    url: "/shop",
    title: `${SHOP_HEADING} | ${SITE.brand.name}`,
    description: SHOP_DESCRIPTION,
  },
};

const linkClass =
  "font-semibold text-[color:var(--color-primary)] transition hover:text-[color:var(--color-primary-soft)]";

export default async function ShopPage() {
  const products = await getStorefrontProducts();
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/shop`;
  // The order the default (Featured) view renders in, so the ItemList lists
  // products exactly as the page shows them.
  const listed = sortCatalogue(products, CATALOGUE_DEFAULT_SORT);
  const inStockCount = products.filter((product) => !isProductSoldOut(product)).length;
  const drop = getCollection("drop-01");
  const sets = products.filter((product) => product.kind === "set");

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: pageUrl },
    ],
  };
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: SHOP_HEADING,
    url: pageUrl,
    inLanguage: "en-AU",
    isPartOf: { "@type": "WebSite", name: SITE.brand.name, url: baseUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listed.length,
      itemListElement: listed.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}${productPath(product)}`,
        name: product.name,
      })),
    },
  };

  const header = (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-[color:var(--color-ink-subtle)]"
      >
        <Link href="/" className="transition hover:text-[color:var(--color-ink)]">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-[color:var(--color-ink-muted)]">
          Shop
        </span>
      </nav>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-[color:var(--color-ink)] sm:text-4xl">
        {SHOP_HEADING}
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-base">
        Die-cut vinyl stickers, each design printed in a single limited run
        {drop ? (
          <>
            , starting with{" "}
            <Link href={`/collections/${drop.slug}`} className={linkClass}>
              {drop.label}
            </Link>
          </>
        ) : null}
        . Every card shows the size of its run; when a run sells out, the design
        is retired rather than reprinted.
      </p>
      <p className="text-xs text-[color:var(--color-ink-subtle)]">
        {products.length} sticker{products.length === 1 ? "" : "s"} · {inStockCount} in stock ·{" "}
        {FREE_SHIPPING_CLAIM} · {DISPATCH_CLAIM_WITH_ORIGIN}
      </p>
    </div>
  );

  const footer = (
    <div className="space-y-3 border-t border-[color:var(--color-border)] pt-6">
      {sets.length > 0 ? (
        <p className="text-sm text-[color:var(--color-ink-muted)]">
          Every design from a drop is also sold together as a{" "}
          <Link href="/collections/sets" className={linkClass}>
            full set
          </Link>
          .
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-[color:var(--color-ink-subtle)]">
        Sizes, shipping and payment are covered in the{" "}
        <Link href="/faq" className={linkClass}>
          FAQ
        </Link>
        .
      </p>
    </div>
  );

  return (
    <>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />
      <ShopPageClient products={products} header={header} footer={footer} />
    </>
  );
}
