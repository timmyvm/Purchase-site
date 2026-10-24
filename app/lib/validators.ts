// The final label must be a real TLD shape — letters, or punycode (xn--…).
// A looser tail accepts typos like "name@gmail.com1", which the mail provider
// then rejects on every send.
export const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.(?:[a-z]{2,24}|xn--[a-z0-9-]{2,})$/;

export const isValidEmail = (value?: string | null) =>
  EMAIL_PATTERN.test((value ?? "").trim().toLowerCase());

export const AU_STATES = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"] as const;
export type AuState = (typeof AU_STATES)[number];

// First digit(s) of a valid postcode for each state (Australia Post ranges,
// including PO box ranges). Catches the common swapped-state typo.
const POSTCODE_RANGES: Record<AuState, Array<[number, number]>> = {
  ACT: [[200, 299], [2600, 2618], [2900, 2920]],
  NSW: [[1000, 2599], [2619, 2899], [2921, 2999]],
  NT: [[800, 999]],
  QLD: [[4000, 4999], [9000, 9999]],
  SA: [[5000, 5999]],
  TAS: [[7000, 7999]],
  VIC: [[3000, 3999], [8000, 8999]],
  WA: [[6000, 6999]],
};

export const isAuState = (value: string): value is AuState =>
  (AU_STATES as readonly string[]).includes(value);

export const isValidPostcodeForState = (postcode: string, state: string) => {
  if (!/^\d{4}$/.test(postcode) || !isAuState(state)) return false;
  const value = Number.parseInt(postcode, 10);
  return POSTCODE_RANGES[state].some(([min, max]) => value >= min && value <= max);
};
