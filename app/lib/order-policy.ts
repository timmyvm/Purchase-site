// Unpaid orders hold stock from a limited run. After this long without
// payment the order is cancelled and its stickers go back on sale
// (/api/cron/cancel-stale-orders). Checkout and the order page state the same
// window, so they read it from here.
export const UNPAID_ORDER_HOURS = 48;

// Days after delivery to report damaged stickers for a replacement (or a
// refund once the design has sold out). The FAQ, refund policy, /about and
// /contact all state it, so they read it from here.
export const DAMAGE_CLAIM_WINDOW_DAYS = 14;
