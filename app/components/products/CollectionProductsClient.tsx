"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/app/lib/types";
import { ProductGrid } from "@/app/components/products/ProductGrid";
import {
  CATALOGUE_DEFAULT_SORT,
  CATALOGUE_SORT_OPTIONS,
  sortCatalogue,
  toCatalogueSort,
  type CatalogueSort,
} from "@/app/components/products/catalogue-sort";

/**
 * Collection grid with a sort control (port of APL's AreaProductsClient).
 * Client-side only so the page itself stays ISR-cached; the server renders
 * the default Featured order, which is also the order its ItemList states.
 */
export const CollectionProductsClient = ({ products }: { products: Product[] }) => {
  const [sort, setSort] = useState<CatalogueSort>(CATALOGUE_DEFAULT_SORT);
  const sorted = useMemo(() => sortCatalogue(products, sort), [products, sort]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--color-ink-muted)]">
          <span>Sort:</span>
          <select
            value={sort}
            onChange={(event) => setSort(toCatalogueSort(event.target.value))}
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--color-ink)] shadow-none"
          >
            {CATALOGUE_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <ProductGrid products={sorted} />
    </div>
  );
};
