import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getShopeeAppConfig } from "@/lib/shopee/accounts";
import { shopeeTimestamp, signShopeeRequest } from "@/lib/shopee/sign";

const TOKEN_PATH = "/api/v2/auth/token/get";

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  expire_in?: number;
  shop_id?: number;
  merchant_id?: number | null;
  error?: string;
  message?: string;
  request_id?: string;
}

/**
 * Lands here after the seller authorizes in app/api/shopee/auth/route.ts.
 * Exchanges the one-time `code` for access_token/refresh_token and upserts
 * them into Supabase `shopee_shops` — tokens are never surfaced to the
 * browser beyond this exchange. See docs/shopee-open-api.md.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const shopId = req.nextUrl.searchParams.get("shop_id");

  if (!code || !shopId) {
    return NextResponse.json(
      { error: "Missing code or shop_id in callback — authorize flow may have failed or expired." },
      { status: 400 }
    );
  }

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
    path: TOKEN_PATH,
    timestamp,
  });

  const url = new URL(config.apiBase + TOKEN_PATH);
  url.searchParams.set("partner_id", config.partnerId);
  url.searchParams.set("timestamp", String(timestamp));
  url.searchParams.set("sign", sign);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      shop_id: Number(shopId),
      partner_id: Number(config.partnerId),
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as TokenResponse;

  if (data.error || !data.access_token) {
    return NextResponse.json(
      { error: data.error || "Token exchange failed", message: data.message, request_id: data.request_id },
      { status: 502 }
    );
  }

  const tokenExpireAt = new Date(Date.now() + (data.expire_in ?? 14400) * 1000).toISOString();

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const { error: dbError } = await supabase.from("shopee_shops").upsert(
    {
      shop_id: shopId,
      merchant_id: data.merchant_id ? String(data.merchant_id) : null,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_expire_at: tokenExpireAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id" }
  );

  if (dbError) {
    return NextResponse.json({ error: `Token exchange succeeded but Supabase upsert failed: ${dbError.message}` }, { status: 500 });
  }

  const redirectTo = new URL("/shopee", req.nextUrl.origin);
  redirectTo.searchParams.set("shopee_connected", shopId);
  return NextResponse.redirect(redirectTo);
}
