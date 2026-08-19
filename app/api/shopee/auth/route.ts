import { NextResponse } from "next/server";
import { getShopeeAppConfig } from "@/lib/shopee/accounts";
import { shopeeTimestamp, signShopeeRequest } from "@/lib/shopee/sign";

const AUTH_PATH = "/api/v2/shop/auth_partner";

/**
 * One-time-per-shop OAuth kickoff. Visiting this route redirects to Shopee's
 * authorize page; after the seller logs in and confirms, Shopee redirects
 * back to SHOPEE_REDIRECT_URI with ?code=...&shop_id=..., handled by
 * app/api/shopee/callback/route.ts. See docs/shopee-open-api.md.
 */
export async function GET() {
  let config;
  try {
    config = getShopeeAppConfig();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const timestamp = shopeeTimestamp();
  const sign = signShopeeRequest({
    partnerId: config.partnerId,
    partnerKey: config.partnerKey,
    path: AUTH_PATH,
    timestamp,
  });

  const url = new URL(config.apiBase + AUTH_PATH);
  url.searchParams.set("partner_id", config.partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", sign);
  url.searchParams.set("redirect", config.redirectUri);

  return NextResponse.redirect(url.toString());
}
