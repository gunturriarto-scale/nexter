// Shared types for the GMV Max dashboard, modeled directly on fields available
// across the TikTok Business API GMV Max endpoints:
// - GET /gmv_max/campaign/get/ (campaign list)
// - GET /campaign/gmv_max/info/ (campaign detail: budget, roas_bid, promotion days, creative content)
// - GET /gmv_max/report/get/ (delivery metrics at account/campaign/product/creative/livestream level)
// - GET /gmv_max/bid/recommend/ (TikTok's recommended ROI target + budget)
// - GET /campaign/gmv_max/session/get/ (max delivery / creative boost sessions)

export type PromotionType = "PRODUCT_GMV_MAX" | "LIVE_GMV_MAX";
export type OperationStatus = "ENABLE" | "DISABLE";
export type BidType = "CUSTOM" | "NO_BID"; // CUSTOM = Target ROI mode, NO_BID = Maximum delivery mode
export type RoiProtectionStatus = "IN_EFFECT" | "NOT_ELIGIBLE";
export type CreativeStatus =
  | "IN_QUEUE"
  | "LEARNING"
  | "DELIVERING"
  | "NOT_DELIVERYING"
  | "AUTHORIZATION_NEEDED"
  | "EXCLUDED"
  | "UNAVAILABLE"
  | "REJECTED"
  | "NOT_ACTIVE";
export type AuthorizationType = "TTS_TT" | "AFFILIATE" | "TT_USER" | "BC_AUTH_TT" | "AUTH_CODE";
export type LiveStatus = "ONGOING" | "END";

export interface AutoBudgetState {
  enabled: boolean;
  currentBudget: number;
  budgetIncreasePercentage: number;
  nextIncrease: number;
  remainedTimes: number;
  maximumBudget: number;
}

export interface Campaign {
  brand: string;
  campaignId: string;
  campaignName: string;
  promotionType: PromotionType;
  operationStatus: OperationStatus;
  bidType: BidType;
  scheduleType: "Continuously" | "SCHEDULE_START_END";
  scheduleStartTime: string;
  scheduleEndTime: string | null;
  roasBid: number; // actual configured target ROI (deep_bid_type VO_MIN_ROAS)
  recommendedRoasBid: number; // from /gmv_max/bid/recommend/ — TikTok's suggestion, for comparison
  dailyBudget: number; // "budget" — daily budget for target-ROI mode
  maxDeliveryBudget: number; // separate budget pool used only while max delivery is active
  roiProtectionEnabled: boolean;
  roiProtectionStatus: RoiProtectionStatus;
  placements: ("PLACEMENT_TIKTOK" | "PLACEMENT_PANGLE")[];
  ageGroups: string[];
  affiliatePostsEnabled: boolean;
  promotionDays: {
    enabled: boolean;
    roasBidMultiplier: number; // e.g. 80 = -20% target ROI during promo days
    adjustedRoasBid: number;
    estimatedGrossRevenueIncrease: string; // e.g. "24%"
  } | null;
  autoBudget: AutoBudgetState;
  // LIVE-only
  ttAccountName?: string;
  ttAccountAvatarSeed?: string;
}

export interface Product {
  brand: string;
  campaignId: string;
  itemGroupId: string;
  productName: string;
  productImageSeed: string;
  cost: number;
  orders: number;
  grossRevenue: number;
  roi: number;
}

export interface Creative {
  brand: string;
  campaignId: string;
  itemGroupId: string;
  itemId: string;
  title: string;
  ttAccountName: string;
  ttAccountAvatarSeed: string;
  authorizationType: AuthorizationType;
  shopContentType: "VIDEO" | "PRODUCT_CARD";
  status: CreativeStatus;
  durationSec: number;
  videoCoverSeed: string;
  cost: number;
  orders: number;
  grossRevenue: number;
  roi: number;
  productImpressions: number;
  productClicks: number;
  productClickRate: number;
  adClickRate: number;
  adConversionRate: number;
  viewRate2s: number;
  viewRate6s: number;
  viewRateP25: number;
  viewRateP50: number;
  viewRateP75: number;
  viewRateP100: number;
}

export interface Livestream {
  brand: string;
  campaignId: string;
  roomId: string;
  liveName: string;
  liveStatus: LiveStatus;
  launchedTime: string;
  durationMin: number;
  cost: number;
  orders: number;
  grossRevenue: number;
  roi: number;
  allShopsOrders: number;
  allShopsGrossRevenue: number;
  allShopsRoi: number;
  liveViews: number;
  costPerLiveView: number;
  views10s: number;
  liveFollows: number;
}

export interface DailyMetric {
  brand: string;
  campaignId: string;
  promotionType: PromotionType;
  day: string;
  cost: number;
  netCost: number;
  grossRevenue: number;
  orders: number;
}
