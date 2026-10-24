import "server-only";

import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/app/lib/supabase/server";
import { PRODUCTS_CACHE_TAG } from "@/app/lib/data";
import { MAX_QUANTITY_PER_ITEM } from "@/app/lib/cart";
import { SHIPPING_FACTS } from "@/app/lib/shipping";
import { isValidEmail, isValidPostcodeForState, isAuState } from "@/app/lib/validators";
import type { OrderLine, OrderStatus, ShippingAddress } from "@/app/lib/types";

export type PlaceOrderInput = {
  email: string;
  name: string;
  phone?: string;
  address: ShippingAddress;
  items: Array<{ variantId: string; quantity: number }>;
  marketingOptIn?: boolean;
  notes?: string;
};

export type StoredOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  email: string;
  customerName: string;
  shippingAddress: ShippingAddress;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  trackingNumber: string | null;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  cancelledAt: string | null;
};

export type PlaceOrderResult =
  | { ok: true; order: StoredOrder }
  | { ok: false; status: number; error: string; field?: string; variantId?: string };

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

/** Field-level validation. Returns the first problem, or null. */
export const validateOrderInput = (
  input: PlaceOrderInput
): { field: string; error: string } | null => {
  if (!isValidEmail(input.email)) return { field: "email", error: "Enter a valid email address." };
  if (clean(input.name, 80).length < 2) return { field: "name", error: "Enter your full name." };
  const a = input.address;
  if (!a || clean(a.line1, 80).length < 3) return { field: "line1", error: "Enter your street address." };
  if (clean(a.suburb, 40).length < 2) return { field: "suburb", error: "Enter your suburb." };
  if (!isAuState(a.state)) return { field: "state", error: "Choose your state." };
  if (!isValidPostcodeForState(a.postcode, a.state)) {
    return { field: "postcode", error: `That postcode isn't in ${a.state}.` };
  }
  if (input.phone && !/^[0-9 +()-]{8,20}$/.test(input.phone)) {
    return { field: "phone", error: "Enter a valid phone number, or leave it blank." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { field: "items", error: "Your cart is empty." };
  }
  return null;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  items: OrderLine[];
  subtotal: number | string;
  shipping: number | string;
  total: number | string;
  tracking_number: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  cancelled_at: string | null;
};

const ORDER_COLUMNS =
  "id, order_number, status, email, customer_name, shipping_address, items, subtotal, shipping, total, tracking_number, created_at, paid_at, shipped_at, cancelled_at";

const toStoredOrder = (row: OrderRow): StoredOrder => ({
  id: row.id,
  orderNumber: row.order_number,
  status: row.status,
  email: row.email,
  customerName: row.customer_name,
  shippingAddress: row.shipping_address,
  items: row.items.map((line) => ({
    ...line,
    unitPrice: Number(line.unitPrice),
    lineTotal: Number(line.lineTotal),
  })),
  subtotal: Number(row.subtotal),
  shipping: Number(row.shipping),
  total: Number(row.total),
  trackingNumber: row.tracking_number,
  createdAt: row.created_at,
  paidAt: row.paid_at,
  shippedAt: row.shipped_at,
  cancelledAt: row.cancelled_at,
});

/**
 * Places an order through place_sticker_order(): prices come from the
 * catalogue, stock is decremented under a row lock, and shipping uses
 * SHIPPING_FACTS — the same numbers the cart displayed.
 */
export const placeOrder = async (input: PlaceOrderInput): Promise<PlaceOrderResult> => {
  const invalid = validateOrderInput(input);
  if (invalid) return { ok: false, status: 400, ...invalid };

  // Merge duplicate lines and clamp to the per-line cap before the database
  // sees them (the function enforces the same cap).
  const merged = new Map<string, number>();
  for (const item of input.items) {
    const quantity = Math.floor(Number(item?.quantity));
    if (typeof item?.variantId !== "string" || !Number.isFinite(quantity) || quantity < 1) {
      return { ok: false, status: 400, field: "items", error: "Your cart has an invalid item." };
    }
    merged.set(item.variantId, (merged.get(item.variantId) ?? 0) + quantity);
  }
  for (const [variantId, quantity] of merged) {
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      return {
        ok: false,
        status: 400,
        field: "items",
        variantId,
        error: `You can order up to ${MAX_QUANTITY_PER_ITEM} of each sticker.`,
      };
    }
  }

  const supabase = getSupabaseAdmin();
  const address: ShippingAddress = {
    line1: clean(input.address.line1, 80),
    line2: clean(input.address.line2, 80) || undefined,
    suburb: clean(input.address.suburb, 40),
    state: input.address.state,
    postcode: input.address.postcode,
    country: "AU",
  };

  const { data, error } = await supabase.rpc("place_sticker_order", {
    p_email: clean(input.email, 254),
    p_customer_name: clean(input.name, 80),
    p_phone: clean(input.phone, 20),
    p_shipping_address: address,
    p_items: [...merged].map(([variantId, quantity]) => ({ variantId, quantity })),
    p_shipping_fee: SHIPPING_FACTS.feeAud,
    p_free_shipping_threshold: SHIPPING_FACTS.freeThresholdAud,
    p_marketing_opt_in: Boolean(input.marketingOptIn),
    p_notes: clean(input.notes, 500),
  });

  if (error) {
    const [code, variantId] = (error.message ?? "").split(":");
    if (code === "OUT_OF_STOCK") {
      // Stock just changed under this buyer; make every page re-read it.
      revalidateTag(PRODUCTS_CACHE_TAG, "max");
      return {
        ok: false,
        status: 409,
        variantId,
        error: "One of your stickers has sold out or has fewer left than you selected.",
      };
    }
    if (code === "UNKNOWN_ITEM") {
      return { ok: false, status: 409, variantId, error: "One of your stickers is no longer available." };
    }
    if (code === "BAD_QUANTITY" || code === "EMPTY_CART" || code === "TOO_MANY_LINES") {
      return { ok: false, status: 400, field: "items", error: "Please check the quantities in your cart." };
    }
    console.error("[orders] place_sticker_order failed", error);
    return { ok: false, status: 500, error: "We couldn't place your order. Please try again." };
  }

  const placed = (Array.isArray(data) ? data[0] : data) as { order_id: string } | null;
  if (!placed?.order_id) {
    console.error("[orders] place_sticker_order returned no row", data);
    return { ok: false, status: 500, error: "We couldn't place your order. Please try again." };
  }

  revalidateTag(PRODUCTS_CACHE_TAG, "max");

  const { data: row, error: readError } = await supabase
    .from("sticker_orders")
    .select(ORDER_COLUMNS)
    .eq("id", placed.order_id)
    .single();
  if (readError || !row) {
    // The order exists; failing here would invite a duplicate retry.
    console.error("[orders] order placed but re-read failed", readError);
    throw new Error(`Order ${placed.order_id} placed but could not be read back.`);
  }
  return { ok: true, order: toStoredOrder(row as unknown as OrderRow) };
};

export const getOrderByNumber = async (orderNumber: string): Promise<StoredOrder | null> => {
  const normalized = orderNumber.trim().toUpperCase();
  if (!/^S\d{6}$/.test(normalized)) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("sticker_orders")
    .select(ORDER_COLUMNS)
    .eq("order_number", normalized)
    .maybeSingle();
  if (error) throw new Error(`[orders] lookup failed: ${error.message}`);
  return data ? toStoredOrder(data as unknown as OrderRow) : null;
};

/** Lookup by order number + the email it was placed with (case-insensitive). */
export const findOrderForCustomer = async (orderNumber: string, email: string) => {
  const order = await getOrderByNumber(orderNumber);
  if (!order) return null;
  return order.email === email.trim().toLowerCase() ? order : null;
};
