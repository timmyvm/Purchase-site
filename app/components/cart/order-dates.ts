import { UNPAID_ORDER_HOURS } from "@/app/lib/order-policy";

// Pinned, never the viewer's browser: the store posts from Melbourne, the
// unpaid-order cron runs on the server clock, and a pinned zone is what keeps
// a server render and any later client render agreeing.
export const STORE_TIME_ZONE = "Australia/Melbourne";

const dateTimeFormat = new Intl.DateTimeFormat("en-AU", {
  timeZone: STORE_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("en-AU", {
  timeZone: STORE_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const parse = (value: string | null | undefined) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** "Sat 25 Oct 2026, 2:15 pm" in Melbourne time, or null. */
export const formatOrderDateTime = (value: string | null | undefined) => {
  const date = parse(value);
  return date ? dateTimeFormat.format(date) : null;
};

/** "25 Oct 2026" in Melbourne time, or null. */
export const formatOrderDate = (value: string | null | undefined) => {
  const date = parse(value);
  return date ? dateFormat.format(date) : null;
};

/**
 * When an unpaid order becomes eligible for cancellation: placed time plus
 * UNPAID_ORDER_HOURS, the same window /api/cron/cancel-stale-orders uses.
 */
export const getPaymentDeadline = (createdAt: string) => {
  const placed = parse(createdAt);
  return placed ? new Date(placed.getTime() + UNPAID_ORDER_HOURS * 3_600_000) : null;
};
