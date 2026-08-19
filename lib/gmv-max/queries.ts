import { getSupabaseAdmin } from "@/lib/supabase";
import { getGmvMaxAccounts } from "@/lib/gmv-max/accounts";

export interface ReportRow {
  brand: string;
  campaign_id: string;
  promotion_type: "PRODUCT_GMV_MAX" | "LIVE_GMV_MAX";
  day: string;
  item_group_id: string | null;
  item_id: string | null;
  room_id: string | null;
  cost: number;
  gross_revenue: number;
  orders: number;
  cost_per_order: number;
  roi: number;
  product_impressions: number;
  product_clicks: number;
  ad_video_view_rate_2s: number;
  ad_video_view_rate_6s: number;
}

export interface CampaignRow {
  brand: string;
  campaign_id: string;
  campaign_name: string | null;
  promotion_type: "PRODUCT_GMV_MAX" | "LIVE_GMV_MAX";
  operation_status: string | null;
  roi_protection_status: string | null;
}

export interface GmvMaxFilter {
  brand?: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  promotionType?: "PRODUCT_GMV_MAX" | "LIVE_GMV_MAX";
}

/** Distinct brands, combining what's already synced with what's configured (so the filter isn't empty pre-sync). */
export async function getBrands(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("gmv_max_campaigns").select("brand");
  const fromDb = new Set((data ?? []).map((r) => r.brand as string));
  for (const acc of getGmvMaxAccounts()) fromDb.add(acc.brand);
  return Array.from(fromDb).sort();
}

export async function getReportRows(filter: GmvMaxFilter): Promise<ReportRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("gmv_max_report_daily")
    .select(
      "brand,campaign_id,promotion_type,day,item_group_id,item_id,room_id,cost,gross_revenue,orders,cost_per_order,roi,product_impressions,product_clicks,ad_video_view_rate_2s,ad_video_view_rate_6s"
    )
    .gte("day", filter.from)
    .lte("day", filter.to)
    .limit(20000);

  if (filter.brand) query = query.eq("brand", filter.brand);
  if (filter.promotionType) query = query.eq("promotion_type", filter.promotionType);

  const { data, error } = await query;
  if (error) throw new Error(`getReportRows failed: ${error.message}`);
  return (data ?? []) as ReportRow[];
}

export async function getCampaigns(brand?: string): Promise<CampaignRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("gmv_max_campaigns")
    .select("brand,campaign_id,campaign_name,promotion_type,operation_status,roi_protection_status");
  if (brand) query = query.eq("brand", brand);
  const { data, error } = await query;
  if (error) throw new Error(`getCampaigns failed: ${error.message}`);
  return (data ?? []) as CampaignRow[];
}
