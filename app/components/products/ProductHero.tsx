"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Product } from "@/app/lib/types";
import { MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import {
  formatMoney,
  getDefaultVariant,
  getRemaining,
  isProductSoldOut,
  isVariantAvailable,
} from "@/app/lib/currency";
import { DISPATCH_CLAIM_SHORT, FREE_SHIPPING_CLAIM } from "@/app/lib/shipping";
import { useCart } from "@/app/providers/CartProvider";
import { Button } from "@/app/components/ui/Button";
import { CartQuantityInput } from "@/app/components/cart/CartQuantityInput";
import { SizePicker } from "@/app/components/products/SizePicker";
import { DropAlertForm } from "@/app/components/products/DropAlertForm";
import {
  formatSizeList,
  getEditionLine,
  getProductHeadingQualifier,
} from "@/app/components/products/product-facts";
import type { SetComparison } from "@/app/components/products/set-pricing";

type ProductHeroProps = {
  product: Product;
  /** Full sets only: the honest singles comparison, or null (no claim). */
  setComparison?: SetComparison | null;
};

const CheckIcon = () => (
  <svg
    viewBox="0 0 16 16"
    className="h-4 w-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="2.5 8.5 6.5 12.5 13.5 4.5" />
  </svg>
);

/**
 * Two-column product hero (port of APL's ProductHero): sticker on a light
 * tile on the left, the buy box on the right, and the sticky add-to-cart bar
 * once the buy box scrolls away. The bar is a fixed overlay that slides in
 * with a transform, so it never moves the page; its breakpoint position is
 * CSS-only.
 */
export const ProductHero = ({ product, setComparison = null }: ProductHeroProps) => {
  const { addItem, items } = useCart();
  const isSoldOut = isProductSoldOut(product);
  const defaultVariant = getDefaultVariant(product.variants);
  const [selectedId, setSelectedId] = useState<string>(defaultVariant.id);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const atcRef = useRef<HTMLDivElement | null>(null);
  const addedTimerRef = useRef<number | null>(null);

  const activeVariant =
    product.variants.find((variant) => variant.id === selectedId) ?? defaultVariant;
  const variantAvailable = isVariantAvailable(activeVariant);

  // The per-line cap is MAX_QUANTITY_PER_ITEM or the copies left, whichever is
  // lower, less what this cart already holds of the size (addItem clamps to
  // the same cap, and place_sticker_order() enforces it again).
  const inCart = items
    .filter((item) => item.productId === product.id && item.variantId === activeVariant.id)
    .reduce((sum, item) => sum + item.quantity, 0);
  const lineCap = Math.min(MAX_QUANTITY_PER_ITEM, Math.max(0, activeVariant.inventory));
  const maxAddable = Math.max(0, lineCap - inCart);
  const addQuantity = Math.min(Math.max(1, quantity), Math.max(1, maxAddable));
  const canAdd = !isSoldOut && variantAvailable && maxAddable > 0;
  const capMessage =
    !isSoldOut && variantAvailable && maxAddable === 0
      ? inCart >= MAX_QUANTITY_PER_ITEM
        ? `Your cart already has the limit of ${MAX_QUANTITY_PER_ITEM} for this size.`
        : `All ${activeVariant.inventory} left in this size are in your cart.`
      : null;
  const priceLabel = formatMoney(activeVariant.price);
  const hasSizeChoice = product.variants.length > 1;

  useEffect(() => {
    const el = atcRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    },
    []
  );

  const handleSelect = useCallback((variantId: string) => {
    setSelectedId(variantId);
    setQuantity(1);
  }, []);

  const handleAddToCart = () => {
    if (!canAdd || isAdded) return;
    setIsAdded(true);
    addItem(product.id, activeVariant.id, addQuantity);
    setQuantity(1);
    if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => setIsAdded(false), 750);
  };

  const facts = [
    { label: "Finish", value: product.finish },
    { label: "Material", value: product.material },
    { label: product.kind === "set" ? "Pack" : "Sizes", value: formatSizeList(product) },
    { label: "Shipping", value: FREE_SHIPPING_CLAIM },
    { label: "Dispatch", value: DISPATCH_CLAIM_SHORT },
  ];

  return (
    <section className="bg-transparent py-8 sm:py-10 lg:py-12">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] xl:gap-10">
        <div className="relative h-[360px] overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-[linear-gradient(155deg,#eef2ff,#f1f5f9)] shadow-card sm:h-[440px] lg:h-[520px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(59,130,246,0.10),transparent_23%),radial-gradient(circle_at_18%_18%,rgba(45,212,191,0.07),transparent_25%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.15),transparent)]" />
          <div className="absolute inset-y-0 right-0 w-px bg-[linear-gradient(180deg,transparent,rgba(59,130,246,0.10),transparent)]" />
          <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5 sm:left-5 sm:top-5">
            <span className="rounded-full border border-[rgba(59,130,246,0.2)] bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-primary-soft)] sm:text-[10px]">
              {product.finish}
            </span>
          </div>
          <div className="relative flex h-full w-full items-center justify-center px-5 pb-[4.75rem] pt-14 sm:px-8 sm:pb-[5.25rem] sm:pt-16 lg:px-10 lg:pb-[5.5rem]">
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              // The product image is the LCP element on every viewport.
              preload
              sizes="(min-width: 1280px) 32rem, (min-width: 1024px) 30rem, 100vw"
              className="object-contain object-center p-4 drop-shadow-[0_22px_42px_rgba(0,0,0,0.18)] sm:p-6 lg:p-8"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 sm:bottom-5 sm:left-5 sm:right-5">
            <div className="rounded-xl border border-[color:var(--color-border)] bg-white/80 px-3 py-2.5 backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-primary-soft)]">
                Material
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-ink)] sm:text-sm">
                {product.material}
              </p>
            </div>
            <div className="rounded-xl border border-[color:var(--color-border)] bg-white/80 px-3 py-2.5 backdrop-blur">
              <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[color:var(--color-primary-soft)]">
                Edition
              </p>
              <p className="mt-1 text-xs text-[color:var(--color-ink)] sm:text-sm">
                {getEditionLine(product)}
              </p>
            </div>
          </div>
          {isSoldOut ? (
            <span className="absolute right-4 top-4 rounded-full border border-[color:var(--color-danger)]/40 bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink)] sm:right-5 sm:top-5 sm:text-[10px]">
              SOLD OUT
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--color-primary-soft)]">
              {product.dropName} · {product.kind === "set" ? "Full set" : "Single design"}
            </p>
            {/* The name stays the visual headline; the qualifier is a smaller
                line in the same <h1>. The sticky bar keeps the bare name. */}
            <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-[2.55rem]">
              <span className="block">{product.name}</span>{" "}
              <span className="mt-1.5 block font-sans text-sm font-medium leading-snug tracking-normal text-[color:var(--color-ink-muted)] sm:text-base">
                {getProductHeadingQualifier(product)}
              </span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[color:var(--color-ink-muted)] sm:text-[15px]">
              {product.shortDescription}
            </p>
          </div>

          <div className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-4 py-4 sm:px-5">
            <p className="font-display text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-ink)] sm:text-[2.8rem]">
              {priceLabel}
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-muted)]">
              {activeVariant.sizeLabel}
            </p>
            <p className="mt-2 text-[13px] text-[color:var(--color-ink-muted)]">
              {getEditionLine(product)} · {getRemaining(product)} left
            </p>
            {setComparison ? (
              <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[color:var(--color-ink-muted)]">
                <span>
                  <span className="line-through">{formatMoney(setComparison.singlesPrice)}</span>{" "}
                  for the same designs bought singly at {setComparison.size}
                </span>
                <span className="rounded-full bg-[color:var(--color-success)]/15 px-2.5 py-0.5 text-xs font-semibold text-[color:var(--color-success)]">
                  {setComparison.percent}% below singles
                </span>
              </p>
            ) : null}
          </div>

          {hasSizeChoice ? (
            <SizePicker
              variants={product.variants}
              selectedId={activeVariant.id}
              onSelect={handleSelect}
            />
          ) : null}

          <div className="space-y-2" ref={atcRef}>
            {isSoldOut ? (
              <DropAlertForm productSlug={product.slug} />
            ) : (
              <>
                <div className="flex items-stretch gap-2">
                  <div className="w-20 shrink-0">
                    <CartQuantityInput
                      value={addQuantity}
                      max={Math.max(1, maxAddable)}
                      ariaLabel={`Quantity of ${product.name} ${activeVariant.sizeLabel}`}
                      onCommit={setQuantity}
                      className="h-[52px] text-center"
                    />
                  </div>
                  <Button
                    variant="cta"
                    onClick={handleAddToCart}
                    disabled={!canAdd || isAdded}
                    className="min-h-[52px] flex-1 rounded-[1.25rem] px-5 py-0 text-sm sm:text-base"
                  >
                    {isAdded ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckIcon />
                        Added
                      </span>
                    ) : (
                      "Add to cart"
                    )}
                  </Button>
                </div>
                <p className="text-[11px] leading-relaxed text-[color:var(--color-ink-muted)]">
                  Up to {MAX_QUANTITY_PER_ITEM} per size per order · {FREE_SHIPPING_CLAIM}
                </p>
                {capMessage ? (
                  <p className="text-xs font-semibold text-[color:var(--color-ink)] sm:text-sm">
                    {capMessage}
                  </p>
                ) : null}
              </>
            )}
          </div>

          <section className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] p-4 shadow-card">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-ink-subtle)]">
              The details
            </p>
            <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {facts.map((fact) => (
                <li key={fact.label} className="flex items-start gap-2.5 text-[13px] leading-snug">
                  <span className="mt-px text-[color:var(--color-primary)]">
                    <CheckIcon />
                  </span>
                  <span>
                    <span className="font-semibold text-[color:var(--color-ink)]">{fact.label}:</span>{" "}
                    <span className="text-[color:var(--color-ink-muted)]">{fact.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* Sticky add-to-cart — appears once the buy box scrolls off so price +
          add are always reachable. Phones: above the BottomNav; md+: the
          bottom edge. Both positions are CSS breakpoints, never JS. */}
      {!isSoldOut ? (
        <div
          className={`fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-40 border-t border-[color:var(--color-border)] bg-[color:var(--color-charcoal)]/95 backdrop-blur transition-transform duration-300 md:bottom-0 ${
            stickyVisible ? "translate-y-0" : "pointer-events-none translate-y-[calc(100%+56px)] md:translate-y-full"
          }`}
          aria-hidden={stickyVisible ? undefined : "true"}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
            {/* Decorative duplicate of the hero image next to the name. */}
            <div className="relative hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] sm:block">
              <Image src={product.image.src} alt="" fill sizes="40px" className="object-contain p-1" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[color:var(--color-ink)]">
                {product.name}
                <span className="text-[color:var(--color-ink-muted)]"> · {activeVariant.sizeLabel}</span>
              </p>
              <p className="truncate text-[11px] text-[color:var(--color-ink-muted)]">
                {capMessage ?? `${getEditionLine(product)} · ${product.finish}`}
              </p>
            </div>
            <span className="hidden shrink-0 text-sm font-bold text-[color:var(--color-ink)] sm:block">
              {priceLabel}
            </span>
            <Button
              variant="cta"
              onClick={handleAddToCart}
              disabled={!canAdd || isAdded}
              tabIndex={stickyVisible ? undefined : -1}
              className="min-h-[44px] shrink-0 rounded-xl px-5 text-sm"
            >
              {isAdded ? "Added ✓" : "Add to cart"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
};
