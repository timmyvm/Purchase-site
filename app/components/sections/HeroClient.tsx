"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/app/lib/types";
import { formatMoney, getCheapestVariant } from "@/app/lib/currency";
import { BUSINESS_DISPATCH_LOCATION } from "@/app/lib/business-identity";
import { DISPATCH_CLAIM_WITH_ORIGIN, SHIPPING_FACTS } from "@/app/lib/shipping";
import { CollectionIcon } from "@/app/components/products/CollectionIcon";
import { productPath } from "@/app/lib/product-slugs";

type HeroClientProps = {
  pickerProducts: Product[];
  /** The current drop, from the catalogue ("Drop 01"). */
  dropName: string;
  /** Single designs in that drop. */
  designCount: number;
  /** Distinct finishes of those designs, e.g. ["Gloss", "Holographic"]. */
  finishes: string[];
};

const SESSION_KEY = "peel_hero_selected_product";
const ROTATE_MS = 10_000;
const FADE_MS = 150;

// The H1 carries the search term as a smaller lead-in line INSIDE the
// heading, so the short display line stays the visual headline at every
// width. Both layouts render the same pair; only the mobile one is the <h1>
// (one per page), as on APL.
const HEADLINE_KICKER = "Limited-run die-cut stickers, Australia";
const HEADLINE = "Printed once. Never reprinted.";

// The size eyebrow and the price chip describe the SAME variant (the
// cheapest), never variants[0] beside another variant's price.
const getHeroVariant = (product: Product) =>
  product.variants.length ? getCheapestVariant(product.variants) : null;

const readSaved = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
};

const writeSaved = (slug: string) => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, slug);
  } catch {
    // Private mode / blocked storage: the picker still works for this view.
  }
};

const pickerButtonClass = (selected: boolean) =>
  `cursor-pointer text-left transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--color-primary)] ${
    selected
      ? "border-[1.5px] border-[color:var(--color-ink)] bg-[color:var(--color-surface)]"
      : "border border-[color:var(--color-border)] bg-transparent"
  }`;

/**
 * Homepage hero (port of APL's HeroClient): copy and CTAs on the left, a
 * three-design picker on the right. Every figure in it (design count, free
 * shipping threshold, dispatch city and window) is read from data, and the
 * picker shows each design's own cheapest size and price.
 */
const joinWithAnd = (items: string[]) =>
  items.length <= 1
    ? items.join("")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const HeroClient = ({ pickerProducts, dropName, designCount, finishes }: HeroClientProps) => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [displaySlug, setDisplaySlug] = useState<string | null>(null);
  const [imgVisible, setImgVisible] = useState(true);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pickerProducts.length) return;
    const saved = readSaved();
    if (saved && pickerProducts.some((p) => p.slug === saved)) {
      setSelectedSlug(saved);
      setDisplaySlug(saved);
    } else {
      setDisplaySlug(pickerProducts[0].slug);
    }
  }, [pickerProducts]);

  useEffect(
    () => () => {
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
    },
    []
  );

  const handleSelect = useCallback(
    (slug: string) => {
      if (slug === selectedSlug) return;
      setImgVisible(false);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = window.setTimeout(() => {
        setSelectedSlug(slug);
        setDisplaySlug(slug);
        setImgVisible(true);
        writeSaved(slug);
      }, FADE_MS);
    },
    [selectedSlug]
  );

  useEffect(() => {
    if (pickerProducts.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const current = selectedSlug ?? pickerProducts[0]?.slug;
      const idx = pickerProducts.findIndex((p) => p.slug === current);
      const next = pickerProducts[(idx + 1) % pickerProducts.length];
      handleSelect(next.slug);
    }, ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [selectedSlug, pickerProducts, handleSelect]);

  const displayProduct =
    pickerProducts.find((p) => p.slug === displaySlug) ?? pickerProducts[0];
  const activeSlug = selectedSlug ?? pickerProducts[0]?.slug ?? null;
  const fadeClass = imgVisible ? "opacity-100" : "opacity-0";
  const freeOver = `A$${SHIPPING_FACTS.freeThresholdAud}`;

  const finishLine = joinWithAnd(finishes.map((finish) => finish.toLowerCase()));
  const intro = (
    <>
      {dropName} is {designCount} designs from the Australian everyday
      {finishLine ? `, on ${finishLine} vinyl` : ""}.{" "}
      <span className="font-semibold text-[color:var(--color-ink)]">
        Each design is printed in one run
      </span>{" "}
      and retired when it sells out. {DISPATCH_CLAIM_WITH_ORIGIN}.
    </>
  );

  if (!pickerProducts.length) {
    return (
      <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-[color:var(--color-ink)]">
            <span className="block text-[15px] font-semibold text-[color:var(--color-ink-muted)]">
              {HEADLINE_KICKER}
            </span>{" "}
            <span className="mt-2 block font-display text-5xl font-extrabold tracking-tight">
              {HEADLINE}
            </span>
          </h1>
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] lg:flex lg:min-h-[640px] lg:flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:flex lg:flex-1 lg:flex-col lg:px-8">
        {/* ── DESKTOP LAYOUT (lg+) ─────────────────────────────────────── */}
        <div className="hidden lg:grid lg:flex-1 lg:grid-cols-2 lg:gap-5 lg:py-6">
          {/* Left: text panel */}
          <div className="flex flex-col justify-center py-4 pr-4">
            <span className="inline-flex items-center gap-2 self-start border border-[color:var(--color-ink)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-ink)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
              Die-cut vinyl stickers · {dropName}: {designCount} designs
            </span>

            <p className="mt-5 text-[color:var(--color-ink)]">
              <span className="block text-[17px] font-semibold text-[color:var(--color-ink-muted)]">
                {HEADLINE_KICKER}
              </span>{" "}
              <span className="mt-2 block font-display text-[clamp(46px,5.2vw,72px)] font-extrabold leading-[0.98] tracking-[-0.035em]">
                {HEADLINE}
              </span>
            </p>

            <p className="mt-4 max-w-[500px] text-[17px] leading-[1.55] text-[color:var(--color-ink-muted)]">
              {intro}
            </p>

            {/* Orange on the primary (buy-path) CTA, blue on the secondary. */}
            <div className="mt-[26px] flex flex-wrap items-center gap-3.5">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 rounded-[6px] bg-[color:var(--color-highlight)] px-[18px] py-[13px] text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.65)] transition duration-150 hover:bg-[color:var(--color-highlight-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-highlight-strong)] active:translate-y-px"
              >
                Shop all stickers <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/collections/drop-01"
                className="inline-flex items-center gap-1.5 rounded-[6px] border border-[color:var(--color-primary)]/50 bg-[color:var(--color-primary)]/10 px-[18px] py-[13px] text-sm font-bold text-[color:var(--color-primary-soft)] transition duration-150 hover:bg-[color:var(--color-primary)]/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-primary)] active:translate-y-px"
              >
                <CollectionIcon icon="drop" className="size-3.5 shrink-0" />
                See {dropName}
              </Link>
            </div>

            {/* Trust row — facts only. */}
            <div className="mt-9 flex flex-wrap gap-8 border-t border-[color:var(--color-border)] pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
                  POSTED FROM
                </span>
                <span className="text-[15px] font-semibold text-[color:var(--color-ink)]">
                  {BUSINESS_DISPATCH_LOCATION}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
                  FREE SHIPPING
                </span>
                <span className="text-[15px] font-semibold text-[color:var(--color-ink)]">
                  Orders {freeOver}+
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
                  {dropName}
                </span>
                <span className="text-[15px] font-semibold text-[color:var(--color-ink)]">
                  {designCount} designs
                  {finishes.length > 1 ? `, ${finishes.length} finishes` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Right: design picker */}
          <div className="flex flex-col gap-3.5 rounded-xl bg-[color:var(--color-surface-muted)] p-5">
            <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
              <span>FEATURED DESIGNS</span>
              <Link href="/shop" className="transition hover:text-[color:var(--color-ink)]">
                ↳ all stickers
              </Link>
            </div>

            {/* Featured sticker */}
            <div
              className={`flex min-h-0 flex-1 items-center justify-center border-[1.5px] border-[color:var(--color-ink-muted)] p-3 transition-opacity duration-150 ease-out ${fadeClass}`}
            >
              {displayProduct ? (
                <Link
                  href={productPath(displayProduct)}
                  aria-label={`View ${displayProduct.name}`}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Image
                    src={displayProduct.image.src}
                    alt={displayProduct.image.alt}
                    width={400}
                    height={400}
                    sizes="(min-width: 1024px) 400px, 0px"
                    className="h-full max-h-[400px] w-full object-contain p-2 drop-shadow-[0_18px_32px_rgba(0,0,0,0.16)]"
                    loading="eager"
                    fetchPriority="high"
                  />
                </Link>
              ) : null}
            </div>

            {/* Picker */}
            <div className="grid grid-cols-3 gap-2.5">
              {pickerProducts.map((product) => {
                const isSelected = activeSlug === product.slug;
                const variant = getHeroVariant(product);
                return (
                  <button
                    key={product.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(product.slug)}
                    className={`${pickerButtonClass(isSelected)} px-3 py-2.5`}
                  >
                    <div className="text-[13px] font-bold leading-tight text-[color:var(--color-ink)]">
                      {product.name}
                    </div>
                    {variant ? (
                      <div className="mt-0.5 font-mono text-[10px] uppercase text-[color:var(--color-ink-subtle)]">
                        {variant.sizeLabel} · {product.finish}
                      </div>
                    ) : null}
                    {variant ? (
                      <div className="mt-1.5 text-[13px] font-semibold text-[color:var(--color-ink)]">
                        {formatMoney(variant.price)}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── MOBILE / TABLET LAYOUT (below lg) ───────────────────────── */}
        <div className="flex flex-col lg:hidden">
          <div className="flex flex-col gap-3 px-6 pb-[14px] pt-5">
            <span className="inline-flex items-center gap-2 self-start border border-[color:var(--color-ink)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-ink)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)]" />
              Die-cut vinyl · {dropName}: {designCount} designs
            </span>

            <h1 className="text-[color:var(--color-ink)]">
              <span className="block text-[13px] font-semibold leading-snug text-[color:var(--color-ink-muted)] md:text-[15px]">
                {HEADLINE_KICKER}
              </span>{" "}
              <span className="mt-1.5 block font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] md:text-[44px]">
                {HEADLINE}
              </span>
            </h1>

            <p className="text-[13px] leading-[1.5] text-[color:var(--color-ink-muted)] md:text-[15px]">
              {intro}
            </p>

            <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
              <Link
                href="/shop"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-[6px] bg-[color:var(--color-highlight)] px-[18px] py-[13px] text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.65)] transition duration-150 hover:bg-[color:var(--color-highlight-strong)] active:translate-y-px md:w-auto"
              >
                Shop all stickers <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/collections/drop-01"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-[6px] border border-[color:var(--color-primary)]/50 bg-[color:var(--color-primary)]/10 px-[18px] py-[13px] text-sm font-bold text-[color:var(--color-primary-soft)] transition duration-150 hover:bg-[color:var(--color-primary)]/20 active:translate-y-px md:w-auto"
              >
                <CollectionIcon icon="drop" className="size-3.5 shrink-0" />
                See {dropName}
              </Link>
            </div>
          </div>

          {/* Featured sticker tile */}
          <div className="px-6 pb-[14px]">
            <div
              className={`flex h-[220px] items-center justify-center border-[1.5px] border-[color:var(--color-ink-muted)] bg-[color:var(--color-surface-muted)] p-2 transition-opacity duration-150 ease-out sm:h-[260px] ${fadeClass}`}
            >
              {displayProduct ? (
                <Link
                  href={productPath(displayProduct)}
                  aria-label={`View ${displayProduct.name}`}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Image
                    src={displayProduct.image.src}
                    alt={displayProduct.image.alt}
                    width={240}
                    height={240}
                    sizes="(max-width: 1023px) 240px, 0px"
                    className="h-full w-full object-contain"
                    // The mobile LCP element.
                    loading="eager"
                    fetchPriority="high"
                  />
                </Link>
              ) : null}
            </div>
          </div>

          {/* Picker */}
          <div className="px-6 pb-3">
            <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-[color:var(--color-ink-subtle)]">
              <span>FEATURED · TAP TO SWITCH</span>
              <Link href="/shop" className="transition hover:text-[color:var(--color-ink)]">
                ↳ all stickers
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {pickerProducts.map((product) => {
                const isSelected = activeSlug === product.slug;
                const variant = getHeroVariant(product);
                return (
                  <button
                    key={product.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handleSelect(product.slug)}
                    className={`${pickerButtonClass(isSelected)} px-2 py-2`}
                  >
                    <div className="text-[11px] font-bold leading-tight text-[color:var(--color-ink)]">
                      {product.name}
                    </div>
                    {/* No size eyebrow on mobile, so a multi-size design's
                        cheapest price reads as "from". */}
                    {variant ? (
                      <div className="mt-1 text-[12px] font-semibold text-[color:var(--color-ink)]">
                        {product.variants.length > 1
                          ? `from ${formatMoney(variant.price)}`
                          : formatMoney(variant.price)}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fact strip */}
          <div className="mt-auto border-t border-[color:var(--color-border)]">
            <div className="grid grid-cols-3 divide-x divide-[color:var(--color-border)]">
              <div className="flex flex-col items-center px-1 py-[10px]">
                <span className="text-[16px] font-bold leading-none text-[color:var(--color-ink)]">
                  {freeOver}+
                </span>
                <span className="mt-[3px] font-mono text-[8px] uppercase tracking-[0.14em] text-[color:var(--color-ink-subtle)]">
                  free shipping
                </span>
              </div>
              <div className="flex flex-col items-center px-1 py-[10px]">
                <span className="text-[16px] font-bold leading-none text-[color:var(--color-ink)]">
                  {designCount}
                </span>
                <span className="mt-[3px] font-mono text-[8px] uppercase tracking-[0.14em] text-[color:var(--color-ink-subtle)]">
                  {dropName} designs
                </span>
              </div>
              <div className="flex flex-col items-center px-1 py-[10px]">
                <span className="text-[16px] font-bold leading-none text-[color:var(--color-ink)]">
                  {SHIPPING_FACTS.dispatchFrom.split(",")[0]}
                </span>
                <span className="mt-[3px] font-mono text-[8px] uppercase tracking-[0.14em] text-[color:var(--color-ink-subtle)]">
                  posted from
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
