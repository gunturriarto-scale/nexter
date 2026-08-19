import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getGmvMaxAccounts } from "@/lib/gmv-max/accounts";
import {
  fetchGmvMaxCampaigns,
  fetchGmvMaxReport,
  RawGmvMaxCampaign,
  RawGmvMaxReportRow,
} from "@/lib/gmv-max/tiktok";

export const maxDuration = 300;

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toCampaignRow(brand: string, storeIdHint: string | null, c: RawGmvMaxCampaign, promotionType: string) {
  return {
    brand,
    advertiser_id: c.advertiser_id,
    store_id: storeIdHint,
    campaign_id: c.campaign_id,
    campaign_name: c.campaign_name,
    promotion_type: promotionType,
    operation_status: c.operation_status,
    secondary_status: c.secondary_status,
    objective_type: c.objective_type,
    roi_protection_status: c.roi_protection_compensation_status ?? null,
    create_time: c.create_time ? new Date(c.create_time.replace(" ", "T") + "Z") : null,
    modify_time: c.modify_time ? new Date(c.modify_time.replace(" ", "T") + "Z") : null,
    updated_at: new Date().toISOString(),
  };
}

function num(metrics: Record<string, string>, key: string): number {
  const v = Number(metrics[key]);
  return Number.isFinite(v) ? v : 0;
}

function nullableNum(metrics: Record<string, string>, key: string): number | null {
  if (!(key in metrics)) return null;
  const v = Number(metrics[key]);
  return Number.isFinite(v) ? v : null;
}

function toReportRow(
  brand: string,
  advertiserId: string,
  storeId: string,
  promotionType: "PRODUCT_GMV_MAX" | "LIVE_GMV_MAX",
  row: RawGmvMaxReportRow
) {
  const d = row.dimensions;
  const m = row.metrics;
  const day = (d.stat_time_day ?? "").slice(0, 10);
  return {
    brand,
    advertiser_id: advertiserId,
    store_id: storeId,
    campaign_id: d.campaign_id,
    promotion_type: promotionType,
    day,
    item_group_id: d.item_group_id ?? "",
    item_id: d.item_id ?? "",
    room_id: d.room_id ?? "",
    creative_delivery_status: m.creative_delivery_status ?? null,
    currency: m.currency ?? null,
    cost: num(m, "cost"),
    net_cost: num(m, "net_cost"),
    orders: num(m, "orders"),
    cost_per_order: num(m, "cost_per_order"),
    gross_revenue: num(m, "gross_revenue"),
    roi: num(m, "roi"),
    product_impressions: num(m, "product_impressions"),
    product_clicks: num(m, "product_clicks"),
    product_click_rate: num(m, "product_click_rate"),
    ad_click_rate: num(m, "ad_click_rate"),
    ad_conversion_rate: num(m, "ad_conversion_rate"),
    ad_video_view_rate_2s: num(m, "ad_video_view_rate_2s"),
    ad_video_view_rate_6s: num(m, "ad_video_view_rate_6s"),
    ad_video_view_rate_p25: num(m, "ad_video_view_rate_p25"),
    ad_video_view_rate_p50: num(m, "ad_video_view_rate_p50"),
    ad_video_view_rate_p75: num(m, "ad_video_view_rate_p75"),
    ad_video_view_rate_p100: num(m, "ad_video_view_rate_p100"),
    live_views: nullableNum(m, "live_views"),
    cost_per_live_view: nullableNum(m, "cost_per_live_view"),
    live_views_10s: nullableNum(m, "10_second_live_views"),
    live_follows: nullableNum(m, "live_follows"),
    updated_at: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  const configuredSecret = process.env.SYNC_TRIGGER_SECRET;
  if (configuredSecret) {
    const header = req.headers.get("authorization");
    if (header !== `Bearer ${configuredSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const lookbackDays = Math.min(
    Number(req.nextUrl.searchParams.get("days") ?? process.env.SYNC_LOOKBACK_DAYS ?? "7"),
    30
  );
  const end = new Date();
  const start = new Date(end.getTime() - (lookbackDays - 1) * 24 * 60 * 60 * 1000);
  const startDate = isoDate(start);
  const endDate = isoDate(end);

  const accounts = getGmvMaxAccounts();
  if (accounts.length === 0) {
    return NextResponse.json(
      { error: "No accounts configured in TIKTOK_GMV_MAX_ACCOUNTS" },
      { status: 400 }
    );
  }

  let supabase: ReturnType<typeof getSupabaseAdmin>;
  try {
    supabase = getSupabaseAdmin();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
  const summary: Record<string, unknown>[] = [];

  for (const account of accounts) {
    const accountSummary: Record<string, unknown> = { brand: account.brand, errors: [] as string[] };
    const errors = accountSummary.errors as string[];

    for (const promotionType of ["PRODUCT_GMV_MAX", "LIVE_GMV_MAX"] as const) {
      try {
        const campaigns = await fetchGmvMaxCampaigns(
          account.advertiserId,
          account.accessToken,
          promotionType
        );
        if (campaigns.length > 0) {
          const rows = campaigns.map((c) =>
            toCampaignRow(account.brand, account.storeIds[0] ?? null, c, promotionType)
          );
          const { error } = await supabase
            .from("gmv_max_campaigns")
            .upsert(rows, { onConflict: "advertiser_id,campaign_id" });
          if (error) errors.push(`campaigns/${promotionType}: ${error.message}`);
        }
        accountSummary[`campaigns_${promotionType}`] = campaigns.length;
      } catch (err) {
        errors.push(`campaigns/${promotionType}: ${(err as Error).message}`);
      }
    }

    let reportRowCount = 0;
    for (const storeId of account.storeIds) {
      for (const [promotionType, dbPromotionType] of [
        ["PRODUCT", "PRODUCT_GMV_MAX"],
        ["LIVE", "LIVE_GMV_MAX"],
      ] as const) {
        try {
          const rawRows = await fetchGmvMaxReport({
            advertiserId: account.advertiserId,
            accessToken: account.accessToken,
            storeId,
            startDate,
            endDate,
            promotionType,
          });
          if (rawRows.length > 0) {
            const rows = rawRows
              .map((r) => toReportRow(account.brand, account.advertiserId, storeId, dbPromotionType, r))
              .filter((r) => r.day.length === 10);
            const { error } = await supabase
              .from("gmv_max_report_daily")
              .upsert(rows, { onConflict: "campaign_id,day,item_group_id,item_id,room_id" });
            if (error) errors.push(`report/${storeId}/${promotionType}: ${error.message}`);
            reportRowCount += rows.length;
          }
        } catch (err) {
          errors.push(`report/${storeId}/${promotionType}: ${(err as Error).message}`);
        }
      }
    }
    accountSummary.report_rows_synced = reportRowCount;
    summary.push(accountSummary);
  }

  return NextResponse.json({ startDate, endDate, accounts: summary });
}
