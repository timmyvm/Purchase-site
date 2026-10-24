"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { NavProduct } from "@/app/lib/nav-products";
import {
  findProductSearchExactMatch,
  matchesProductSearch,
} from "@/app/lib/product-search";

type HeaderProductSearchProps = {
  products: NavProduct[];
  mobile?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  expandedWidthClassName?: string;
};

const MAX_SUGGESTIONS = 8;

export const HeaderProductSearch = ({
  products,
  mobile = false,
  open,
  onOpenChange,
  className = "",
  expandedWidthClassName,
}: HeaderProductSearchProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const id = useId();
  const listId = `${id}-results`;
  const wrapperRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const isControlled = typeof open === "boolean";
  const isOpen = isControlled ? Boolean(open) : internalOpen;
  const suggestions = useMemo(() => {
    const value = query.trim();
    if (!value) {
      return [];
    }

    return products.filter((product) => matchesProductSearch(product, value)).slice(0, MAX_SUGGESTIONS);
  }, [products, query]);

  const setSearchOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  useEffect(() => {
    setSearchOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, [isControlled, onOpenChange, pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target)) {
        setSearchOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isControlled, isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    return () => window.clearTimeout(focusTimer);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [isOpen, query]);

  const navigateToProduct = (slug: string) => {
    setSearchOpen(false);
    setQuery("");
    setActiveIndex(-1);
    router.push(`/product/${slug}`);
  };

  const submitSearch = () => {
    const normalizedQuery = query.trim();
    if (!isOpen) {
      setSearchOpen(true);
      return;
    }

    if (!normalizedQuery) {
      inputRef.current?.focus();
      return;
    }

    const exactProduct = findProductSearchExactMatch(products, normalizedQuery);

    if (exactProduct) {
      navigateToProduct(exactProduct.slug);
      return;
    }

    setSearchOpen(false);
    setQuery("");
    setActiveIndex(-1);
    router.push(`/shop?q=${encodeURIComponent(normalizedQuery)}`);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setSearchOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setSearchOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      navigateToProduct(suggestions[activeIndex].slug);
      return;
    }

    if (event.key === "Escape") {
      setSearchOpen(false);
      setQuery("");
      setActiveIndex(-1);
    }
  };

  const expandedWidth = expandedWidthClassName ?? (mobile ? "w-[11.5rem]" : "w-[17rem]");
  const showSuggestions = isOpen && query.trim() && suggestions.length > 0;

  return (
    <form
      ref={wrapperRef}
      onMouseDownCapture={(event) => {
        event.stopPropagation();
      }}
      onPointerDownCapture={(event) => {
        event.stopPropagation();
      }}
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      className={`relative flex items-center justify-end ${mobile ? "w-full" : "hidden md:flex"} ${className}`}
    >
      <div
        className={`flex h-10 items-center overflow-hidden rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] transition-[width,padding,box-shadow,border-color] duration-300 ease-out ${
          isOpen ? `${expandedWidth} pr-0 shadow-soft` : "w-10 px-0"
        } hover:border-[color:var(--color-primary-soft)]`}
      >
        {isOpen ? <span aria-hidden="true" className="h-10 w-10 shrink-0" /> : null}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onFocus={() => setSearchOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder=""
          autoComplete="off"
          aria-label="Search stickers"
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={Boolean(showSuggestions)}
          className={`min-w-0 flex-1 bg-transparent text-sm text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-muted)] transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          } ${isOpen ? "text-center placeholder:text-center" : ""}`}
        />
        <button
          type="button"
          aria-label={isOpen ? "Search products" : "Open product search"}
          aria-expanded={isOpen}
          onClick={() => {
            if (!isOpen) {
              setSearchOpen(true);
              return;
            }
            submitSearch();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--color-ink)] transition hover:text-[color:var(--color-primary)]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </div>
      {showSuggestions ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[60] max-h-80 overflow-auto rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-2 shadow-card"
        >
          {suggestions.map((product, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={product.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => navigateToProduct(product.slug)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-[color:var(--color-surface)] text-[color:var(--color-ink)]"
                      : "text-[color:var(--color-ink-muted)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-ink)]"
                  }`}
                >
                  <span>{product.name}</span>
                  <span className="text-xs uppercase tracking-[0.16em]">
                    {product.inStock ? product.finish : "Sold out"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </form>
  );
};
