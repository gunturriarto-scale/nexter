const BASE_URL = "https://business-api.tiktok.com/open_api/v1.3";

interface TikTokEnvelope<T> {
  code: number;
  message: string;
  request_id: string;
  data: T;
}

async function tiktokGet<T>(
  path: string,
  accessToken: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(BASE_URL + path);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), {
    headers: { "Access-Token": accessToken },
    cache: "no-store",
  });
  const json = (await res.json()) as TikTokEnvelope<T>;
  if (json.code !== 0) {
    throw new Error(
      `TikTok API ${path} failed: [${json.code}] ${json.message} (request_id=${json.request_id})`
    );
  }
  return json.data;
}

export interface RawGmvMaxCampaign {
  advertiser_id: string;
  campaign_id: string;
  campaign_name: string;
  operation_status: string;
  create_time: string;
  modify_time: string;
  objective_type: string;
  secondary_status: string;
  roi_protection_compensation_status?: string;
}

interface CampaignListResponse {
  list: RawGmvMaxCampaign[];
  page_info: { page: number; page_size: number; total_page: number; total_number: number };
}

/** Campaign metadata endpoint has no performance numbers — see Run a GMV Max Campaign report for those. */
export async function fetchGmvMaxCampaigns(
  advertiserId: string,
  accessToken: string,
  promotionType: "PRODUCT_GMV_MAX" | "LIVE_GMV_MAX"
): Promise<RawGmvMaxCampaign[]> {
  const campaigns: RawGmvMaxCampaign[] = [];
  let page = 1;
  const pageSize = 100;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await tiktokGet<CampaignListResponse>(
      "/gmv_max/campaign/get/",
      accessToken,
      {
        advertiser_id: advertiserId,
        filtering: JSON.stringify({ gmv_max_promotion_types: [promotionType] }),
        page: String(page),
        page_size: String(pageSize),
      }
    );
    campaigns.push(...(data.list ?? []));
    const totalPage = data.page_info?.total_page ?? 1;
    if (page >= totalPage) break;
    page += 1;
  }
  return campaigns;
}

export const PRODUCT_REPORT_METRICS = [
  "creative_delivery_status",
  "cost",
  "net_cost",
  "orders",
  "cost_per_order",
  "gross_revenue",
  "roi",
  "product_impressions",
  "product_clicks",
  "product_click_rate",
  "ad_click_rate",
  "ad_conversion_rate",
  "ad_video_view_rate_2s",
  "ad_video_view_rate_6s",
  "ad_video_view_rate_p25",
  "ad_video_view_rate_p50",
  "ad_video_view_rate_p75",
  "ad_video_view_rate_p100",
];

export const LIVE_REPORT_METRICS = [
  "cost",
  "net_cost",
  "orders",
  "cost_per_order",
  "gross_revenue",
  "roi",
  "live_views",
  "cost_per_live_view",
  "10_second_live_views",
  "live_follows",
];

export interface RawGmvMaxReportRow {
  dimensions: Record<string, string>;
  metrics: Record<string, string>;
}

interface ReportResponse {
  list: RawGmvMaxReportRow[];
  page_info: { page: number; page_size: number; total_page: number; total_number: number };
}

/**
 * `store_ids` is capped at 1 by the API, and metric sets differ between
 * PRODUCT and LIVE GMV Max (e.g. live_views vs product_impressions), so
 * callers run this once per store x promotion type.
 */
export async function fetchGmvMaxReport(params: {
  advertiserId: string;
  accessToken: string;
  storeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD, range must be <= 30 days when using stat_time_day
  promotionType: "PRODUCT" | "LIVE";
}): Promise<RawGmvMaxReportRow[]> {
  const { advertiserId, accessToken, storeId, startDate, endDate, promotionType } = params;
  const isProduct = promotionType === "PRODUCT";
  const metrics = isProduct ? PRODUCT_REPORT_METRICS : LIVE_REPORT_METRICS;
  const dimensions = isProduct
    ? ["campaign_id", "stat_time_day", "item_group_id", "item_id"]
    : ["campaign_id", "stat_time_day", "room_id"];

  const rows: RawGmvMaxReportRow[] = [];
  let page = 1;
  const pageSize = 1000;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await tiktokGet<ReportResponse>("/gmv_max/report/get/", accessToken, {
      advertiser_id: advertiserId,
      store_ids: JSON.stringify([storeId]),
      start_date: startDate,
      end_date: endDate,
      metrics: JSON.stringify(metrics),
      dimensions: JSON.stringify(dimensions),
      filtering: JSON.stringify({ gmv_max_promotion_types: [promotionType] }),
      page: String(page),
      page_size: String(pageSize),
    });
    rows.push(...(data.list ?? []));
    const totalPage = data.page_info?.total_page ?? 1;
    if (page >= totalPage) break;
    page += 1;
  }
  return rows;
}
