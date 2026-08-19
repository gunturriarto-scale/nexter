/**
 * App-level Shopee Open Platform credentials (one App, shared across shops).
 * Per-shop access_token/refresh_token live in Supabase `shopee_shops`, not
 * here — they rotate (4h/30d) so env vars would go stale immediately.
 */
export interface ShopeeAppConfig {
  partnerId: string;
  partnerKey: string;
  redirectUri: string;
  apiBase: string;
}

export function getShopeeAppConfig(): ShopeeAppConfig {
  const partnerId = process.env.SHOPEE_PARTNER_ID;
  const partnerKey = process.env.SHOPEE_PARTNER_KEY;
  const redirectUri = process.env.SHOPEE_REDIRECT_URI;
  const apiBase = process.env.SHOPEE_API_BASE || "https://partner.shopeemobile.com";

  if (!partnerId || !partnerKey || !redirectUri) {
    throw new Error(
      "Missing SHOPEE_PARTNER_ID / SHOPEE_PARTNER_KEY / SHOPEE_REDIRECT_URI in env"
    );
  }
  return { partnerId, partnerKey, redirectUri, apiBase };
}
