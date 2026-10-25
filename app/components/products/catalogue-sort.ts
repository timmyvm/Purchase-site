import type { Product } from "@/app/lib/types";
import { getCheapestVariant } from "@/app/lib/currency";

/**
 * The /shop and /collections sort control. Shared by the server pages (the
 * ItemList JSON-LD order) and the client grids, so the schema lists products
 * in the order the page shows them. Client-safe.
 */
export type CatalogueSort = "featured" | "priceAsc" | "priceDesc" | "name";

export const CATALOGUE_DEFAULT_SORT: CatalogueSort = "featured";

export const CATALOGUE_SORT_OPTIONS: Array<{ value: CatalogueSort; label: string }> = [
  { value: "featured", label: "Featured" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "name", label: "Name" },
];

export const toCatalogueSort = (value: string | null): CatalogueSort =>
  CATALOGUE_SORT_OPTIONS.find((option) => option.value === value)?.value ??
  CATALOGUE_DEFAULT_SORT;

const fromPrice = (product: Product) => getCheapestVariant(product.variants)?.price ?? 0;

export const sortCatalogue = (products: Product[], sort: CatalogueSort): Product[] => {
  const sorted = [...products];
  sorted.sort((a, b) => {
    if (sort === "priceAsc" || sort === "priceDesc") {
      const delta = sort === "priceAsc" ? fromPrice(a) - fromPrice(b) : fromPrice(b) - fromPrice(a);
      if (delta !== 0) return delta;
    }
    if (sort === "name") {
      const delta = a.name.localeCompare(b.name, "en-AU");
      if (delta !== 0) return delta;
    }
    // Featured is the catalogue's own sort_order; it also breaks every tie.
    return a.sortOrder - b.sortOrder;
  });
  return sorted;
};
