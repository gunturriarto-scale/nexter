import { createHmac } from "crypto";

/**
 * Shopee Open Platform v2 request signing.
 * base_string = partner_id + api_path + timestamp [+ access_token + shop_id]
 * sign = HMAC_SHA256(partner_key, base_string).hexdigest() — lowercase hex.
 * Shop API calls (order/product/etc.) append access_token+shop_id; Public API
 * calls (authorize link, token exchange) don't — see docs/shopee-open-api.md.
 */
export function signShopeeRequest(params: {
  partnerId: string;
  partnerKey: string;
  path: string;
  timestamp: number;
  accessToken?: string;
  shopId?: string;
}): string {
  const { partnerId, partnerKey, path, timestamp, accessToken, shopId } = params;
  let base = `${partnerId}${path}${timestamp}`;
  if (accessToken) base += accessToken;
  if (shopId) base += shopId;
  return createHmac("sha256", partnerKey).update(base).digest("hex");
}

export function shopeeTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}
