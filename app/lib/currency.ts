import type { Product, ProductVariant } from "@/app/lib/types";

// AUD only: the store sells and ships within Australia.
export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

/** "A$6.00" — the explicit form for totals and anything that leaves the site. */
export const formatAud = (amount: number) => `A${formatMoney(amount)}`;

export const isVariantAvailable = (variant: ProductVariant) => variant.inventory > 0;

export const isProductSoldOut = (product: Product) =>
  !product.variants.some(isVariantAvailable);

export const getDefaultVariant = (variants: ProductVariant[]) =>
  variants.find(isVariantAvailable) ?? variants[0];

export const getCheapestVariant = (variants: ProductVariant[]) =>
  variants.reduce((cheapest, v) => (v.price < cheapest.price ? v : cheapest), variants[0]);

/** Copies left across every size of a design. */
export const getRemaining = (product: Product) =>
  product.variants.reduce((sum, v) => sum + Math.max(0, v.inventory), 0);
