import type { CartItem, CartLine, Product } from "@/app/lib/types";
import { getShippingCost } from "@/app/lib/shipping";

// Per-line cap, enforced by the UI steppers AND inside place_sticker_order().
// A limited run shouldn't vanish into one basket.
export const MAX_QUANTITY_PER_ITEM = 10;

export const buildCartLines = (items: CartItem[], products: Product[]): CartLine[] =>
  items
    .map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return null;
      const variant = product.variants.find((entry) => entry.id === item.variantId);
      if (!variant) return null;
      return {
        product,
        variant,
        quantity: item.quantity,
        unitPrice: variant.price,
        lineTotal: variant.price * item.quantity,
      } satisfies CartLine;
    })
    .filter((line): line is CartLine => line !== null);

export const getCartSubtotal = (lines: CartLine[]) =>
  Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;

/**
 * Display totals. The stored order is priced again inside
 * place_sticker_order() from the same variant prices and the same
 * SHIPPING_FACTS, so these can only differ if the catalogue changed mid-cart.
 */
export const getCartTotals = (lines: CartLine[]) => {
  const subtotal = getCartSubtotal(lines);
  const shipping = getShippingCost(subtotal);
  return { subtotal, shipping, total: Math.round((subtotal + shipping) * 100) / 100 };
};

export const lineHasStockIssue = (line: CartLine) => line.quantity > line.variant.inventory;
