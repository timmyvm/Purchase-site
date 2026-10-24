/**
 * The shipping facts the shipping policy, promo bar, product pages, cart and
 * checkout all state. Change them here and nowhere else — the same fee and
 * threshold are passed to place_sticker_order() so the stored order can
 * never disagree with what the cart showed.
 */
export const SHIPPING_FACTS = {
  carrier: "Australia Post",
  service: "Letter post in a rigid mailer",
  feeAud: 4.5,
  freeThresholdAud: 40,
  /** Handling time in business days, from order (paid) to hand-over. */
  handlingBusinessDays: { min: 1, max: 2 },
  /** Typical Australia Post letter transit, in business days. */
  transitBusinessDays: { min: 2, max: 6 },
  dispatchFrom: "Melbourne, VIC",
} as const;

const dispatchCity = SHIPPING_FACTS.dispatchFrom.split(",")[0];
const handling = SHIPPING_FACTS.handlingBusinessDays;
const handlingLabel = `${handling.min}–${handling.max} business days`;

/** "Dispatched within 1–2 business days of payment" */
export const DISPATCH_CLAIM_SHORT = `Dispatched within ${handlingLabel} of payment`;

/** "Posted from Melbourne within 1–2 business days" */
export const DISPATCH_CLAIM_WITH_ORIGIN = `Posted from ${dispatchCity} within ${handlingLabel}`;

export const FREE_SHIPPING_CLAIM = `Free shipping over A$${SHIPPING_FACTS.freeThresholdAud}`;

export const getShippingCost = (subtotal: number) =>
  subtotal <= 0 || subtotal >= SHIPPING_FACTS.freeThresholdAud ? 0 : SHIPPING_FACTS.feeAud;
