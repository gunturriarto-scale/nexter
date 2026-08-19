import { getSupabaseAdmin } from "@/lib/supabase";
import { getShopeeAppConfig } from "@/lib/shopee/accounts";
import { shopeeTimestamp, signShopeeRequest } from "@/lib/shopee/sign";

const REFRESH_PATH = "/api/v2/auth/refresh_token/get";

interface RefreshResponse {
  access_token?: string;
  refresh_token?: string;
  expire_in?: number;
  error?: string;
  message?: string;
}

/**
 * Reads the shop's current token from Supabase `shopee_shops`, refreshing
 * first (and writing the new token back) if it's within 30 minutes of
 * expiry. Every Wave 2+ sync route should go through this rather than
 * reading access_token directly, so callers never hold a stale token.
 */
export async function getValidShopeeToken(shopId: string): Promise<{ accessToken: string }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("shopee_shops")
    .select("shop_id, access_token, refresh_token, token_expire_at")
    .eq("shop_id", shopId)
    .single();
  if (error || !data) {
    throw new Error(`No stored Shopee token for shop_id=${shopId}: ${error?.message ?? "not found"}`);
  }

  const expiresInMs = new Date(data.token_expire_at).getTime() - Date.now();
  if (expiresInMs > 30 * 60 * 1000) return { accessToken: data.access_token };

  const config = getShopeeAppConfig();
  const timestamp = shopeeTimestamp();
  const sign = signShopeeRequest({
    partnerId: config.partnerId,
    partnerKey: config.partnerKey,
    path: REFRESH_PATH,
    timestamp,
  });

  const url = new URL(config.apiBase + REFRESH_PATH);
  url.searchParams.set("partner_id", config.partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", sign);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token: data.refresh_token,
      shop_id: Number(shopId),
      partner_id: Number(config.partnerId),
    }),
    cache: "no-store",
  });
  const refreshed = (await res.json()) as RefreshResponse;
  if (refreshed.error || !refreshed.access_token || !refreshed.refresh_token) {
    throw new Error(
      `Shopee token refresh failed for shop_id=${shopId}: ${refreshed.error ?? ""} ${refreshed.message ?? ""}`
    );
  }

  const tokenExpireAt = new Date(Date.now() + (refreshed.expire_in ?? 14400) * 1000).toISOString();
  await supabase
    .from("shopee_shops")
    .update({
      access_token: refreshed.access_token,
      refresh_token: refreshed.refresh_token,
      token_expire_at: tokenExpireAt,
      updated_at: new Date().toISOString(),
    })
    .eq("shop_id", shopId);

  return { accessToken: refreshed.access_token };
}

/** Signed GET against a Shop API endpoint (order, product, returns, ...). */
export async function shopeeShopGet<T>(
  path: string,
  shopId: string,
  params: Record<string, string> = {}
): Promise<T> {
  const config = getShopeeAppConfig();
  const { accessToken } = await getValidShopeeToken(shopId);
  const timestamp = shopeeTimestamp();
  const sign = signShopeeRequest({
    partnerId: config.partnerId,
    partnerKey: config.partnerKey,
    path,
    timestamp,
    accessToken,
    shopId,
  });

  const url = new URL(config.apiBase + path);
  url.searchParams.set("partner_id", config.partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", sign);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("shop_id", shopId);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  if (json.error) {
    throw new Error(`Shopee API ${path} failed: [${json.error}] ${json.message ?? ""}`);
  }
  return json as T;
}
