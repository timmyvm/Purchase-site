import { BUSINESS, BUSINESS_ENTITY_LINE } from "@/app/lib/business-identity";
import { formatAud } from "@/app/lib/currency";

export { DAMAGE_CLAIM_WINDOW_DAYS } from "@/app/lib/order-policy";

/**
 * The seller, for prose: "Example Pty Ltd trading as Peel Supply (ABN …)",
 * or just the trading name while the legal entity and ABN are unset.
 */
export const POLICY_ENTITY = `${BUSINESS_ENTITY_LINE}${BUSINESS.abn ? ` (ABN ${BUSINESS.abn})` : ""}`;

/** Who owns the designs: the registered entity when configured. */
export const POLICY_OWNER = BUSINESS.legalName ?? BUSINESS.tradingName;

/** "A$40" for whole dollars (as the promo bar says it), "A$4.50" otherwise. */
export const formatAudShort = (amount: number) =>
  Number.isInteger(amount) ? `A$${amount}` : formatAud(amount);
