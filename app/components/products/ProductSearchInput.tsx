"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/app/lib/types";
import { matchesProductSearch } from "@/app/lib/product-search";
import { productPath } from "@/app/lib/product-slugs";

type ProductSearchInputProps = {
  products: Product[];
  query: string;
  onQueryChange: (value: string) => void;
};

const MAX_SUGGESTIONS = 8;

/**
 * The /shop search box (port of APL's ProductAutocompleteSearch). Typing
 * filters the grid through `onQueryChange`; the suggestion list jumps straight
 * to a design's page.
 */
export const ProductSearchInput = ({ products, query, onQueryChange }: ProductSearchInputProps) => {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-results`;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => {
    const value = query.trim();
    if (!value) return [];
    return products
      .filter((product) => matchesProductSearch(product, value))
      .slice(0, MAX_SUGGESTIONS);
  }, [products, query]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const navigateToProduct = (product: Product) => {
    setOpen(false);
    setActiveIndex(-1);
    router.push(productPath(product));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }
    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      navigateToProduct(suggestions[activeIndex]);
    }
  };

  const showSuggestions = open && query.trim() !== "" && suggestions.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full sm:max-w-md">
      <label htmlFor={`${id}-input`} className="sr-only">
        Search stickers
      </label>
      <input
        id={`${id}-input`}
        type="search"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search by design name or finish"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={showSuggestions}
        className="h-12 w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-base text-[color:var(--color-ink)] shadow-none transition focus:border-[color:var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]"
      />
      {showSuggestions ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-80 overflow-auto rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-2 shadow-card"
        >
          {suggestions.map((product, index) => {
            const active = index === activeIndex;
            return (
              <li key={product.id} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                    active
                      ? "bg-[color:var(--color-surface)] text-[color:var(--color-ink)]"
                      : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-ink)]"
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateToProduct(product)}
                >
                  <span>{product.name}</span>
                  <span className="shrink-0 text-xs uppercase tracking-[0.16em]">
                    {product.finish}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
