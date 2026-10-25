"use client";

import { useLayoutEffect } from "react";
import { useSearchParams } from "next/navigation";

type ShopUrlSyncProps = {
  onQueryChange: (query: string) => void;
  onSortChange: (sort: string | null) => void;
  onCollectionChange: (collection: string | null) => void;
};

/**
 * Feeds /shop's ?q=, ?sort= and ?collection= into ShopPageClient. Renders
 * nothing, and must stay inside its own <Suspense fallback={null}>.
 *
 * /shop is prerendered (ISR), and on a prerendered route useSearchParams()
 * client-renders everything up to the nearest Suspense boundary. Called from
 * ShopPageClient itself, that would ship the page without its <h1> and
 * product links in the server HTML (the APL /inventory bug). Isolated here,
 * the bail-out covers this null component only: the page renders its default
 * view on the server and applies the URL after hydration.
 *
 * Each param has its own effect keyed on its string value, so changing the
 * sort (which rewrites the URL) never resets a search the visitor has typed.
 */
export const ShopUrlSync = ({ onQueryChange, onSortChange, onCollectionChange }: ShopUrlSyncProps) => {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const sort = searchParams.get("sort");
  const collection = searchParams.get("collection");

  useLayoutEffect(() => {
    onQueryChange(query);
  }, [query, onQueryChange]);

  useLayoutEffect(() => {
    onSortChange(sort);
  }, [sort, onSortChange]);

  useLayoutEffect(() => {
    onCollectionChange(collection);
  }, [collection, onCollectionChange]);

  return null;
};
