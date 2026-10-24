import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSupabaseRead } from "@/app/lib/supabase/server";
import type { Product } from "@/app/lib/types";

export const PRODUCTS_CACHE_TAG = "sticker-products";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  long_description: string;
  image_src: string;
  image_alt: string;
  finish: string;
  material: string;
  drop_name: string;
  kind: "single" | "set";
  edition_size: number;
  sort_order: number;
  sticker_variants: Array<{
    id: string;
    name: string;
    size_label: string;
    price_aud: number | string;
    stock: number;
    sort_order: number;
  }>;
};

const PRODUCT_COLUMNS =
  "id, slug, name, short_description, long_description, image_src, image_alt, finish, material, drop_name, kind, edition_size, sort_order, sticker_variants (id, name, size_label, price_aud, stock, sort_order)";

const toProduct = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  shortDescription: row.short_description,
  longDescription: row.long_description,
  image: { src: row.image_src, alt: row.image_alt || row.name },
  finish: row.finish,
  material: row.material,
  dropName: row.drop_name,
  kind: row.kind,
  editionSize: row.edition_size,
  sortOrder: row.sort_order,
  variants: [...row.sticker_variants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((variant) => ({
      id: variant.id,
      name: variant.name,
      sizeLabel: variant.size_label,
      // numeric comes back from PostgREST as a string
      price: Number(variant.price_aud),
      inventory: variant.stock,
    })),
});

const fetchProducts = async (): Promise<Product[]> => {
  const supabase = getSupabaseRead();
  if (!supabase) {
    console.error("[data] Supabase env missing; the catalogue is empty.");
    return [];
  }
  const { data, error } = await supabase
    .from("sticker_products")
    .select(PRODUCT_COLUMNS)
    .eq("hidden", false)
    .order("sort_order", { ascending: true });
  if (error) {
    // Throwing keeps the last good cache entry instead of caching an empty
    // shop for the whole revalidate window.
    throw new Error(`[data] sticker_products read failed: ${error.message}`);
  }
  return ((data ?? []) as unknown as ProductRow[])
    .map(toProduct)
    .filter((product) => product.variants.length > 0);
};

// Stock moves with every order, so the window is short; checkout re-checks
// stock inside place_sticker_order() regardless of what a page showed.
const getCachedProducts = unstable_cache(fetchProducts, [PRODUCTS_CACHE_TAG], {
  tags: [PRODUCTS_CACHE_TAG],
  revalidate: 60,
});

export const getStorefrontProducts = cache(async (): Promise<Product[]> => {
  try {
    return await getCachedProducts();
  } catch (error) {
    console.error(error);
    return [];
  }
});

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getStorefrontProducts();
  return products.find((product) => product.slug === slug) ?? null;
});

/** Live (uncached) stock, for the cart and checkout. */
export const getLiveProducts = async () => fetchProducts();
