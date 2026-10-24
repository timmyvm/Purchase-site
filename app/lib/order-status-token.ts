import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

const secret = () => process.env.ORDER_STATUS_LINK_SECRET?.trim() || null;

/**
 * Signed order-page links: /order-status/S123456?t=<token>. Anyone with the
 * link can see that order (it goes to the buyer's inbox and their own
 * browser), nobody can guess another order's. Without a secret configured no
 * token is minted and the order page asks for the email instead.
 */
export const getOrderStatusToken = (orderNumber: string): string | null => {
  const key = secret();
  if (!key) return null;
  return createHmac("sha256", key).update(`order:${orderNumber}`).digest("base64url").slice(0, 32);
};

export const isValidOrderStatusToken = (orderNumber: string, token: string | null | undefined) => {
  const expected = getOrderStatusToken(orderNumber);
  if (!expected || !token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};

export const getOrderStatusPath = (orderNumber: string) => {
  const token = getOrderStatusToken(orderNumber);
  return token
    ? `/order-status/${encodeURIComponent(orderNumber)}?t=${token}`
    : `/order-status/${encodeURIComponent(orderNumber)}`;
};
