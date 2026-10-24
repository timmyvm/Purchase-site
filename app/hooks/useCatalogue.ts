"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/app/lib/types";

let cached: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

const load = () => {
  inflight ??= fetch("/api/products", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Unable to load products.");
      const payload = (await response.json()) as { products: Product[] };
      cached = payload.products;
      return payload.products;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

/**
 * Live catalogue for the cart drawer, cart page and checkout. The cart only
 * stores ids and quantities, so prices and stock always come from here.
 * `refresh` re-reads stock (e.g. after a failed checkout).
 */
export const useCatalogue = (enabled = true) => {
  const [products, setProducts] = useState<Product[]>(cached ?? []);
  const [loading, setLoading] = useState(enabled && !cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || cached) return;
    let active = true;
    setLoading(true);
    load()
      .then((next) => {
        if (active) setProducts(next);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  const refresh = async () => {
    cached = null;
    try {
      const next = await load();
      setProducts(next);
      setError(false);
    } catch {
      setError(true);
    }
  };

  return { products, loading, error, refresh };
};
