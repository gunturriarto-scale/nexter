// Types for the LIVE GMV Max dashboard. Every field maps 1:1 to a field
// available in the TikTok Business API LIVE GMV Max endpoints:
// - GET /gmv_max/report/get/ (filtering gmv_max_promotion_types=["LIVE"])
//     dimensions: campaign_id, room_id, stat_time_day
//     metrics: cost, net_cost, orders, cost_per_order, gross_revenue, roi,
//              live_views, cost_per_live_view, 10_second_live_views, live_follows
// - GET /gmv_max/campaign/get/ (filtering LIVE_GMV_MAX) → campaign list + status
// - GET /campaign/gmv_max/info/ → roas_bid, budget, auto_budget, promotion_days
//
// Attribute metrics (non-performance, from report "attribute metrics" table):
//   campaign-level: campaign_name, tt_account_name, tt_account_profile_image_url,
//                   identity_id, bid_type, schedule_type, schedule_start_time,
//                   schedule_end_time, target_roi_budget, max_delivery_budget
//   livestream-level: live_name, live_status, live_launched_time, live_duration

export type LiveStatus = "ONGOING" | "END";
export type OperationStatus = "ENABLE" | "DISABLE";
export type BidType = "CUSTOM" | "NO_BID"; // CUSTOM = target ROI, NO_BID = max delivery
export type RoiProtectionStatus = "IN_EFFECT" | "NOT_ELIGIBLE";

/** Campaign-level data (from /gmv_max/campaign/get/ + /campaign/gmv_max/info/). */
export interface LiveCampaign {
  brand: string;
  campaignId: string;
  campaignName: string;
  operationStatus: OperationStatus;
  bidType: BidType;
  roasBid: number; // target ROI (deep_bid_type VO_MIN_ROAS)
  dailyBudget: number; // "budget" from /campaign/gmv_max/info/
  maxDeliveryBudget: number; // attribute metric max_delivery_budget
  roiProtectionStatus: RoiProtectionStatus;
  createTime: string;
  modifyTime: string;
  ttAccountName: string; // campaign-level attribute metric
  ttAccountProfileImageUrl: string | null; // attribute metric (valid ~48h)
  scheduleType: string; // SCHEDULE_FROM_NOW | SCHEDULE_START_END
  scheduleStartTime: string;
  scheduleEndTime: string | null;
}

/** One livestream session (room), with aggregated delivery metrics. */
export interface LiveSession {
  brand: string;
  campaignId: string;
  campaignName: string;
  roomId: string; // dimensions.room_id
  liveName: string; // attribute metric live_name
  liveStatus: LiveStatus; // attribute metric live_status
  launchedTime: string; // attribute metric live_launched_time
  durationMin: number; // attribute metric live_duration (minutes)
  ttAccountName: string;
  ttAccountProfileImageUrl: string | null;
  // delivery metrics (summed over the session's days)
  cost: number;
  netCost: number;
  orders: number;
  costPerOrder: number;
  grossRevenue: number;
  roi: number; // computed gross_revenue / cost
  liveViews: number;
  costPerLiveView: number;
  views10s: number;
  liveFollows: number;
}

/** Daily breakdown per room, from dimensions=["campaign_id","room_id","stat_time_day"]. */
export interface DailyLiveMetric {
  brand: string;
  campaignId: string;
  roomId: string;
  day: string; // stat_time_day YYYY-MM-DD
  cost: number;
  netCost: number;
  orders: number;
  costPerOrder: number;
  grossRevenue: number;
  roi: number;
  liveViews: number;
  costPerLiveView: number;
  views10s: number;
  liveFollows: number;
}
