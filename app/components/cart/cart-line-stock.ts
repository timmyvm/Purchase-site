import { lineHasStockIssue, MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import type { CartItem, CartLine } from "@/app/lib/types";

export type CartLineStock =
  /** Nothing left of this size. Blocks checkout. */
  | { kind: "sold-out" }
  /** Fewer left than the line asks for. Blocks checkout. */
  | { kind: "short"; available: number }
  /** Fine, but fewer left than the per-line cap: real stock, stated plainly. */
  | { kind: "low"; available: number }
  | { kind: "ok" };

export const getCartLineStock = (line: CartLine): CartLineStock => {
  const available = Math.max(0, line.variant.inventory);
  if (available === 0) return { kind: "sold-out" };
  if (lineHasStockIssue(line)) return { kind: "short", available };
  if (available < MAX_QUANTITY_PER_ITEM) return { kind: "low", available };
  return { kind: "ok" };
};

/** The stepper/input cap: the per-line limit or what's left, whichever is lower. */
export const getLineMaxQuantity = (line: CartLine) =>
  Math.min(MAX_QUANTITY_PER_ITEM, Math.max(0, line.variant.inventory));

export const stockIssueMessage = (stock: CartLineStock) => {
  if (stock.kind === "sold-out") return "Sold out. Remove it to check out.";
  if (stock.kind === "short") {
    return `Only ${stock.available} left. Lower the quantity to ${stock.available} to check out.`;
  }
  return null;
};

/**
 * Cart items the live catalogue no longer has (design hidden or size
 * removed). buildCartLines drops them silently, so the cart and checkout name
 * them instead of letting them vanish from the order. Only meaningful once
 * the catalogue has loaded without error.
 */
export const findUnavailableItems = (items: CartItem[], lines: CartLine[]) =>
  items.filter(
    (item) =>
      !lines.some(
        (line) => line.product.id === item.productId && line.variant.id === item.variantId
      )
  );
