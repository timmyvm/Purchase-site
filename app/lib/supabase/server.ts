import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const options = { auth: { autoRefreshToken: false, persistSession: false } };

let adminClient: SupabaseClient | null = null;
let readClient: SupabaseClient | null = null;

/**
 * Service-role client: orders, stock changes, order lookups. Throws when the
 * secret key is missing so a misconfigured deploy fails loudly at checkout
 * instead of silently dropping orders.
 */
export const getSupabaseAdmin = (): SupabaseClient => {
  if (!url || !secretKey) {
    throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }
  adminClient ??= createClient(url, secretKey, options);
  return adminClient;
};

/**
 * Catalogue reads. The sticker catalogue is readable with the publishable key
 * (RLS: visible products only), so the storefront still renders where only
 * the public key is set, e.g. local development.
 */
export const getSupabaseRead = (): SupabaseClient | null => {
  if (!url) return null;
  if (secretKey) return getSupabaseAdmin();
  if (!publishableKey) return null;
  readClient ??= createClient(url, publishableKey, options);
  return readClient;
};
