import type { Product } from "@/app/lib/types";

/**
 * The ONE comparison a full set may make against buying its designs singly
 * (same rule APL learned the hard way with bundles: a "% below" badge that
 * compares against a basket nobody would pay is a misleading price claim).
 *
 * A set contains every single design of its drop at one size (FAQ: "Full
 * sets contain every design from the drop at 7.5 cm"). The comparison sums
 * those designs' prices AT THAT SIZE from the live variants and states the
 * gap only when it is at least SET_COMPARISON_MIN_PERCENT. Shipping is left
 * out on purpose: both baskets clear the free-shipping threshold, so it adds
 * nothing to either side. Any doubt (a design missing that size, a pack
 * count that disagrees with the drop) returns null: no badge, no
 * strike-through. Client-safe.
 */

export const SET_COMPARISON_MIN_PERCENT = 5;

// Used only when the set's size label doesn't name the size ("Set of 10").
const FALLBACK_SET_SIZE = "7.5 cm";

export type SetComparison = {
  /** AUD the same designs cost bought one at a time at the set's size. */
  singlesPrice: number;
  setPrice: number;
  /** Whole percent under singlesPrice, rounded down. */
  percent: number;
  size: string;
};

/** The single designs a set contains: every single from its drop. */
export const getSetContents = (set: Product, products: Product[]) =>
  products
    .filter((product) => product.kind === "single" && product.dropName === set.dropName)
    .sort((a, b) => a.sortOrder - b.sortOrder);

/** "Set of 10 · 7.5 cm" → "7.5 cm". */
export const getSetSize = (set: Product) => {
  const label = set.variants[0]?.sizeLabel ?? "";
  const parts = label.split("·");
  return parts.length > 1 ? parts[parts.length - 1].trim() : FALLBACK_SET_SIZE;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

export const getSetComparison = (set: Product, products: Product[]): SetComparison | null => {
  if (set.kind !== "set") return null;
  const setVariant = set.variants[0];
  if (!setVariant || !(setVariant.price > 0)) return null;

  const contents = getSetContents(set, products);
  if (contents.length === 0) return null;

  // "Set of 10" must match the number of designs in the drop, or the sum
  // below is not the price of what's in the pack.
  const packCount = /Set of (\d+)/i.exec(setVariant.sizeLabel)?.[1];
  if (packCount && Number(packCount) !== contents.length) return null;

  const size = getSetSize(set);
  const prices = contents.map(
    (product) => product.variants.find((variant) => variant.sizeLabel.trim() === size)?.price
  );
  if (prices.some((price) => typeof price !== "number" || !(price > 0))) return null;

  const singlesPrice = round2(prices.reduce<number>((sum, price) => sum + (price ?? 0), 0));
  const setPrice = setVariant.price;
  if (setPrice >= singlesPrice) return null;

  const percent = Math.floor(((singlesPrice - setPrice) / singlesPrice) * 100);
  if (percent < SET_COMPARISON_MIN_PERCENT) return null;
  return { singlesPrice, setPrice, percent, size };
};
