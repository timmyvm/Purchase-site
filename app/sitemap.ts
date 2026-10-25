import type { MetadataRoute } from "next";
import { getStorefrontProducts } from "@/app/lib/data";
import { getBaseUrl } from "@/app/lib/metadata";
import { COLLECTIONS } from "@/app/lib/collections";
import { productPath } from "@/app/lib/product-slugs";

// Membership follows the catalogue (hidden products drop out), so the sitemap
// refreshes with it. No lastModified: nothing records when a page last
// changed, and a guessed date is worse than none.
export const revalidate = 3600;

type Entry = {
  path: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
};

const STATIC_PAGES: Entry[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/shipping-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const products = await getStorefrontProducts();

  const collectionPages: Entry[] = COLLECTIONS.filter((collection) =>
    products.some(collection.match)
  ).map((collection) => ({
    path: `/collections/${collection.slug}`,
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const productPages: Entry[] = products.map((product) => ({
    path: productPath(product),
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  return [...STATIC_PAGES, ...collectionPages, ...productPages].map((entry) => ({
    url: `${baseUrl}${entry.path === "/" ? "" : entry.path}`,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
