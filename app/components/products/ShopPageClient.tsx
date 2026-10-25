"use client";

import { Suspense, useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/app/lib/types";
import { COLLECTIONS, getCollection } from "@/app/lib/collections";
import { matchesProductSearch } from "@/app/lib/product-search";
import { Container } from "@/app/components/ui/Container";
import { ProductGrid } from "@/app/components/products/ProductGrid";
import { ProductSearchInput } from "@/app/components/products/ProductSearchInput";
import { ShopUrlSync } from "@/app/components/products/ShopUrlSync";
import {
  CATALOGUE_DEFAULT_SORT,
  CATALOGUE_SORT_OPTIONS,
  sortCatalogue,
  toCatalogueSort,
  type CatalogueSort,
} from "@/app/components/products/catalogue-sort";

type ShopPageClientProps = {
  products: Product[];
  /** Server-rendered page header (breadcrumb, h1, intro). */
  header: ReactNode;
  /** Server-rendered content under the grid. */
  footer?: ReactNode;
};

const pillClass = (active: boolean) =>
  `whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
    active
      ? "border-[color:var(--color-primary)] bg-[rgba(59,130,246,0.1)] text-[color:var(--color-primary-soft)]"
      : "border-[color:var(--color-border)] text-[color:var(--color-ink-muted)] hover:border-[color:var(--color-primary-soft)] hover:text-[color:var(--color-ink)]"
  }`;

/**
 * /shop grid (port of APL's InventoryPageClient). Everything renders on the
 * server in its DEFAULT state (all stickers, Featured, no search) and the
 * client starts in that same state, so hydration matches and every product
 * link is in the HTML. ?q= / ?sort= / ?collection= are applied after
 * hydration by ShopUrlSync in its own Suspense; calling useSearchParams()
 * here instead would client-render this whole tree on the prerendered route.
 */
export const ShopPageClient = ({ products, header, footer }: ShopPageClientProps) => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<CatalogueSort>(CATALOGUE_DEFAULT_SORT);
  const [searchQuery, setSearchQuery] = useState("");
  const [collectionSlug, setCollectionSlug] = useState<string | null>(null);

  const applyUrlSort = useCallback((value: string | null) => setSortBy(toCatalogueSort(value)), []);
  const applyUrlCollection = useCallback(
    (value: string | null) => setCollectionSlug(value && getCollection(value) ? value : null),
    []
  );

  // Read the live URL at click time (not a hook) so this component never
  // depends on useSearchParams. The typed search rides along so the URL and
  // the grid agree, and a sort or filter change can't clear the search box.
  const writeUrl = (next: { sort: CatalogueSort; collection: string | null }) => {
    const params = new URLSearchParams(window.location.search);
    if (next.sort === CATALOGUE_DEFAULT_SORT) params.delete("sort");
    else params.set("sort", next.sort);
    if (next.collection) params.set("collection", next.collection);
    else params.delete("collection");
    const query = searchQuery.trim();
    if (query) params.set("q", query);
    else params.delete("q");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    const next = toCatalogueSort(value);
    setSortBy(next);
    writeUrl({ sort: next, collection: collectionSlug });
  };

  const handleCollectionChange = (slug: string | null) => {
    setCollectionSlug(slug);
    writeUrl({ sort: sortBy, collection: slug });
  };

  const collectionCounts = useMemo(
    () =>
      new Map(
        COLLECTIONS.map((collection) => [
          collection.slug,
          products.filter(collection.match).length,
        ])
      ),
    [products]
  );

  const query = searchQuery.trim();
  const visibleProducts = useMemo(() => {
    const collection = collectionSlug ? getCollection(collectionSlug) : null;
    return sortCatalogue(products, sortBy).filter(
      (product) =>
        (!collection || collection.match(product)) &&
        (!query || matchesProductSearch(product, query))
    );
  }, [products, sortBy, collectionSlug, query]);

  return (
    <section className="py-16 sm:py-20">
      <Container className="space-y-10">
        <div className="space-y-5">
          {header}
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <ProductSearchInput
              products={products}
              query={searchQuery}
              onQueryChange={setSearchQuery}
            />
            <label className="flex items-center gap-3 text-sm font-semibold text-[color:var(--color-ink-muted)]">
              <span>Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => handleSortChange(event.target.value)}
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
          <div role="group" aria-label="Filter by collection" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={collectionSlug === null}
              onClick={() => handleCollectionChange(null)}
              className={pillClass(collectionSlug === null)}
            >
              All stickers ({products.length})
            </button>
            {COLLECTIONS.map((collection) => {
              const count = collectionCounts.get(collection.slug) ?? 0;
              if (count === 0) return null;
              const active = collectionSlug === collection.slug;
              return (
                <button
                  key={collection.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleCollectionChange(active ? null : collection.slug)}
                  className={pillClass(active)}
                >
                  {collection.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-muted)]">
            {query ? (
              <>
                No stickers match &ldquo;{query}&rdquo;
                {collectionSlug ? " in this collection" : ""}.{" "}
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="font-semibold text-[color:var(--color-primary)] hover:underline"
                >
                  Clear search
                </button>
              </>
            ) : (
              "No stickers to show here right now."
            )}
          </p>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}

        {footer}
      </Container>
      <Suspense fallback={null}>
        <ShopUrlSync
          onQueryChange={setSearchQuery}
          onSortChange={applyUrlSort}
          onCollectionChange={applyUrlCollection}
        />
      </Suspense>
    </section>
  );
};
