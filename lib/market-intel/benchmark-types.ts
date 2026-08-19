import { Product, Shop, MarketCategory } from "@/lib/market-intel/types";

// ============================================================================
// CREATOR BENCHMARK — from POST /openapi/v1/tiktok/creator/rank + creator/detail
// ============================================================================

export type CreatorStatus = "INDEPENDENT" | "BELONGED_TO_SELLER";
export type EngagementLevel = "LOW" | "MEDIUM" | "HIGH";

export interface Creator {
  creatorId: string;
  creatorNickname: string;
  creatorHandle: string;
  creatorRegion: string;
  creatorStatus: CreatorStatus;
  /** brand affiliation for benchmark coloring — which brand this creator drives most for */
  affiliatedBrand: string;
  revenue: number; // GMV driven
  revenueGrowthRate: number;
  contentViews: number;
  creatorFollowers: number;
  salesColumn: number;
  videoRevenue: number;
  liveRevenue: number;
  engagementRate: number; // percent
}

// ============================================================================
// VIDEO BENCHMARK — from POST /openapi/v1/tiktok/video/rank
// ============================================================================

export interface Video {
  videoId: string;
  videoTitle: string;
  belongedCreatorId: string;
  belongedCreatorHandle: string;
  affiliatedBrand: string;
  revenue: number;
  salesVolumn: number;
  views: number;
  videoGpm: number; // revenue per 1000 views
  adsViews: number;
  adsRoas: number;
  diggCount: number;
  shareCount: number;
  commentCount: number;
  isAd: boolean; // ad (1) vs organic (0)
  duration: number; // seconds
}

// ============================================================================
// LIVESTREAM BENCHMARK — from POST /openapi/v1/tiktok/livestream/rank
// ============================================================================

export interface Livestream {
  livestreamId: string;
  livestreamTitle: string;
  creatorHandle: string;
  creatorId: string;
  affiliatedBrand: string;
  livestreamStartTime: number; // ms
  livestreamEndTime: number; // ms
  livestreamDuration: number; // seconds
  productNumber: number;
  viewers: number;
  revenue: number;
  gpm: number; // revenue per 1000 viewers
  top3ProductIds: string[];
  unitPrice: number;
  views: number;
}

// Re-export for convenience in page imports
export type { Product, Shop, MarketCategory };
