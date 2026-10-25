import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/app/components/ui/Container";
import { JsonLd } from "@/app/components/sections/JsonLd";
import { ProductHero } from "@/app/components/products/ProductHero";
import { ProductDetails } from "@/app/components/products/ProductDetails";
import { ProductFaqSection } from "@/app/components/products/ProductFaqSection";
import { RelatedProducts, getRelatedProducts } from "@/app/components/products/RelatedProducts";
import {
  getSetComparison,
  getSetContents,
  getSetSize,
} from "@/app/components/products/set-pricing";
import { formatSizeList, getEditionLine } from "@/app/components/products/product-facts";
import { getProductBySlug, getStorefrontProducts } from "@/app/lib/data";
import { getBaseUrl } from "@/app/lib/metadata";
import { BUSINESS } from "@/app/lib/business-identity";
import { COLLECTIONS } from "@/app/lib/collections";
import { formatAud, getCheapestVariant, isVariantAvailable } from "@/app/lib/currency";
import { ALL_FAQS } from "@/app/lib/faqs";
import { productPath } from "@/app/lib/product-slugs";
import { SITE } from "@/app/lib/site";
import type { Product } from "@/app/lib/types";

// Stock moves with every order; checkout re-checks it in place_sticker_order().
export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// Reused verbatim from app/lib/faqs.ts (same indexing as HOME_FAQS): what
// "limited run" means, the sizes, the shipping fee and delivery time.
const PRODUCT_FAQS = [ALL_FAQS[0], ALL_FAQS[2], ALL_FAQS[6], ALL_FAQS[7]].filter(
  (faq): faq is (typeof ALL_FAQS)[number] => Boolean(faq)
);

export const generateStaticParams = async () => {
  const products = await getStorefrontProducts();
  return products.map((product) => ({ slug: product.slug }));
};

const getProductDescription = (product: Product) => {
  const cheapest = getCheapestVariant(product.variants);
  const kindLabel = product.kind === "set" ? "sticker set" : "sticker";
  const price =
    product.variants.length > 1 ? `from ${formatAud(cheapest.price)}` : formatAud(cheapest.price);
  return `${product.shortDescription} ${product.finish} ${product.material.toLowerCase()} ${kindLabel}, ${formatSizeList(product)}. ${getEditionLine(product)}, ${price}.`;
};

export const generateMetadata = async ({ params }: ProductPageProps): Promise<Metadata> => {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const title = product.kind === "set" ? product.name : `${product.name} Sticker`;
  const description = getProductDescription(product);
  const path = productPath(product);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE.brand.name,
      type: "website",
      url: path,
      title: `${title} | ${SITE.brand.name}`,
      description,
      images: [{ url: product.image.src, width: 1024, height: 1024, alt: product.image.alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.brand.name}`,
      description,
      images: [product.image.src],
    },
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([getProductBySlug(slug), getStorefrontProducts()]);
  if (!product) notFound();

  const baseUrl = getBaseUrl();
  const productUrl = `${baseUrl}${productPath(product)}`;
  const collection = COLLECTIONS.find((entry) => entry.match(product)) ?? null;
  const setContents = product.kind === "set" ? getSetContents(product, products) : [];
  const setComparison = product.kind === "set" ? getSetComparison(product, products) : null;
  // A set already lists (and links) every design it holds, so the "More from"
  // strip would only repeat four of them.
  const related = product.kind === "set" ? [] : getRelatedProducts(products, product);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.longDescription.trim() || product.shortDescription,
    image: [`${baseUrl}${product.image.src}`],
    url: productUrl,
    brand: { "@type": "Brand", name: BUSINESS.tradingName },
    category: product.kind === "set" ? "Sticker sets" : "Stickers",
    material: product.material,
    ...(product.variants.length === 1 ? { sku: product.variants[0].id } : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.id,
      name: variant.sizeLabel,
      price: variant.price.toFixed(2),
      priceCurrency: "AUD",
      itemCondition: "https://schema.org/NewCondition",
      availability: isVariantAvailable(variant)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      collection
        ? {
            "@type": "ListItem",
            position: 2,
            name: collection.label,
            item: `${baseUrl}/collections/${collection.slug}`,
          }
        : { "@type": "ListItem", position: 2, name: "Shop", item: `${baseUrl}/shop` },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PRODUCT_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      {PRODUCT_FAQS.length > 0 ? <JsonLd data={faqSchema} /> : null}

      <Container className="pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-xs text-[color:var(--color-ink-subtle)]"
        >
          <Link href="/" className="transition hover:text-[color:var(--color-ink)]">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          {collection ? (
            <Link
              href={`/collections/${collection.slug}`}
              className="transition hover:text-[color:var(--color-ink)]"
            >
              {collection.label}
            </Link>
          ) : (
            <Link href="/shop" className="transition hover:text-[color:var(--color-ink)]">
              Shop
            </Link>
          )}
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[color:var(--color-ink-muted)]">
            {product.name}
          </span>
        </nav>
      </Container>

      <ProductHero product={product} setComparison={setComparison} />

      <section className="py-14 sm:py-20">
        <Container className="space-y-14">
          <ProductDetails
            product={product}
            setContents={setContents}
            setSize={product.kind === "set" ? getSetSize(product) : undefined}
          />
          <ProductFaqSection faqs={PRODUCT_FAQS} />
          <RelatedProducts dropName={product.dropName} products={related} />
        </Container>
      </section>
    </div>
  );
}
