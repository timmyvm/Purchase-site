import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { CollectionIcon } from "@/app/components/products/CollectionIcon";
import { CollectionProductsClient } from "@/app/components/products/CollectionProductsClient";
import { CATALOGUE_DEFAULT_SORT, sortCatalogue } from "@/app/components/products/catalogue-sort";
import { COLLECTIONS, getCollection } from "@/app/lib/collections";
import { getStorefrontProducts } from "@/app/lib/data";
import { getBaseUrl } from "@/app/lib/metadata";
import { isProductSoldOut } from "@/app/lib/currency";
import { productPath } from "@/app/lib/product-slugs";
import { DISPATCH_CLAIM_WITH_ORIGIN } from "@/app/lib/shipping";
import { SITE } from "@/app/lib/site";

// Stock moves with every order; checkout re-checks it in place_sticker_order().
export const revalidate = 60;

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export const generateStaticParams = async () =>
  COLLECTIONS.map((collection) => ({ slug: collection.slug }));

export const generateMetadata = async ({ params }: CollectionPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return {};
  const title = collection.slug === "sets" ? collection.label : `${collection.label} Stickers`;
  const path = `/collections/${collection.slug}`;
  return {
    title,
    description: collection.description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE.brand.name,
      type: "website",
      url: path,
      title: `${title} | ${SITE.brand.name}`,
      description: collection.description,
    },
  };
};

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) notFound();

  const products = await getStorefrontProducts();
  const collectionProducts = sortCatalogue(products.filter(collection.match), CATALOGUE_DEFAULT_SORT);
  const inStockCount = collectionProducts.filter((product) => !isProductSoldOut(product)).length;
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}/collections/${collection.slug}`;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.label,
    description: collection.description,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: collectionProducts.length,
      itemListElement: collectionProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${baseUrl}${productPath(product)}`,
        name: product.name,
      })),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${baseUrl}/shop` },
      { "@type": "ListItem", position: 3, name: collection.label, item: pageUrl },
    ],
  };

  return (
    <div>
      <JsonLd data={collectionSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-10 sm:py-12">
        <Container className="space-y-5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs text-[color:var(--color-ink-subtle)]"
          >
            <Link href="/" className="transition hover:text-[color:var(--color-ink)]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/shop" className="transition hover:text-[color:var(--color-ink)]">
              Shop
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-[color:var(--color-ink-muted)]">
              {collection.label}
            </span>
          </nav>

          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] text-[color:var(--color-primary)]">
              <CollectionIcon icon={collection.icon} className="h-6 w-6" />
            </span>
            <div className="space-y-2">
              <h1 className="text-[color:var(--color-ink)]">
                <span className="block font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
                  {collection.label}
                </span>{" "}
                <span className="mt-1 block text-base font-semibold text-[color:var(--color-ink-muted)] sm:text-lg">
                  {collection.blurb}
                </span>
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-base">
                {collection.description}
              </p>
              <p className="text-xs text-[color:var(--color-ink-subtle)]">
                {collectionProducts.length} sticker{collectionProducts.length === 1 ? "" : "s"} ·{" "}
                {inStockCount} in stock · {DISPATCH_CLAIM_WITH_ORIGIN}
              </p>
            </div>
          </div>

          {/* Sibling collections — keep the whole catalogue one tap away. */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/shop"
              className="rounded-full border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[color:var(--color-ink-muted)] transition hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-ink)]"
            >
              All stickers
            </Link>
            {COLLECTIONS.map((other) => (
              <Link
                key={other.slug}
                href={`/collections/${other.slug}`}
                aria-current={other.slug === collection.slug ? "page" : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  other.slug === collection.slug
                    ? "border-[color:var(--color-primary)] bg-[rgba(59,130,246,0.1)] text-[color:var(--color-primary-soft)]"
                    : "border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-ink)]"
                }`}
              >
                {other.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-12">
        <Container className="space-y-8">
          {collectionProducts.length > 0 ? (
            <CollectionProductsClient products={collectionProducts} />
          ) : (
            <p className="text-sm text-[color:var(--color-ink-muted)]">
              Nothing is listed in this collection right now.{" "}
              <Link
                href="/shop"
                className="font-semibold text-[color:var(--color-primary)] hover:underline"
              >
                Browse every sticker →
              </Link>
            </p>
          )}
          <p className="border-t border-[color:var(--color-border)] pt-6 text-xs leading-relaxed text-[color:var(--color-ink-subtle)]">
            Each design is printed once, in the quantity shown on its page. When a
            run sells out the design is retired and isn&apos;t reprinted. Questions
            about sizes or shipping are answered in the{" "}
            <Link
              href="/faq"
              className="font-semibold text-[color:var(--color-primary)] underline-offset-2 hover:underline"
            >
              FAQ
            </Link>
            .
          </p>
        </Container>
      </section>
    </div>
  );
}
