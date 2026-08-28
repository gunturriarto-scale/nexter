// Types for the KOL dashboard. Every field maps to a field that CAN be pulled
// from the APIs we actually have (audited 2026-08-13):
//
//   Roster (KolCreator):
//     - ScrapeCreators  GET /v1/tiktok/profile      → displayName, username, avatar, followerCount
//     - KaloData        POST creator/detail           → revenue, growth, engagement, video/live split
//     - KaloData        POST creator/rank             → discovery & benchmark
//     - GMV Max identity_list                         → authorizationType (how this creator is wired)
//
//   Tracked posts (KolTrackedPost):
//     - ScrapeCreators  GET /v2/tiktok/video (url)    → views, likes, comments, shares, caption
//     - GMV Max report  dimensions=[item_id]          → paid overlay (cost/roi/orders)
//
//   Discovery (KolDiscoveryCandidate):
//     - ScrapeCreators  GET /v1/tiktok/search/users   → search by keyword
//     - ScrapeCreators  GET /v1/tiktok/creators/popular → popular creators
//     - KaloData        POST creator/rank (filter)    → ranked by GMV/growth/engagement
//
//   Trends (TrendingHashtag / TrendingSound):
//     - ScrapeCreators  GET /v1/tiktok/search/hashtag → videoCount snapshot
//     - ScrapeCreators  GET /v1/tiktok/song           → usageCount snapshot
//     - (growth WoW = derived from stored snapshots over time)
//
// REMOVED from the dashboard (audit): KolCollaboration (pipeline), KolSampleRequest,
// KolConversation, KolAffiliateOrder — these belong to TikTok Shop Partner's
// Affiliate Seller domain (Target Collaboration / Sample Applications / IM / Seller
// Affiliate Orders). Their response field names are NOT documented in any API we
// have, and the commission/GMV field mapping was explicitly marked unconfirmed.
// They are dropped rather than shown as fake-real.

export type CreatorSource = "gmv_max" | "shop_affiliate" | "manual" | "scrapecreators" | "kalodata";
export type AuthorizationType = "TTS_TT" | "AFFILIATE" | "TT_USER" | "BC_AUTH_TT" | "AUTH_CODE";
export type PostSyncStatus = "ok" | "not_found" | "private" | "error";

export interface KolCreator {
  brand: string;
  creatorId: string;
  username: string; // @handle
  displayName: string;
  avatarSeed: string;
  category: string;
  authorizationType: AuthorizationType;
  followerCount: number;
  source: CreatorSource;
  /** Primary SKU/product this KOL is known for — "Multi-produk" for brand-owned accounts. */
  productFocus: string;
}

export interface KolTrackedPost {
  brand: string;
  postId: string;
  creatorId: string;
  postUrl: string;
  caption: string;
  addedBy: string;
  postedAt: string;
  lastSyncedAt: string;
  syncStatus: PostSyncStatus;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  // paid overlay — set only when this post URL also matches a GMV Max ad creative
  linkedGmvMax: { cost: number; roi: number; orders: number } | null;
  viewsTrend: { day: string; views: number }[];
}

export interface KolDiscoveryCandidate {
  brand: string;
  username: string;
  displayName: string;
  avatarSeed: string;
  category: string;
  followerCount: number;
  engagementRate: number;
  reason: string; // why surfaced, e.g. matched hashtag
  /** SKU/product this candidate would be pitched for. */
  productFocus: string;
  /** Which trending hashtag/sound surfaced this candidate, if any — ties Trend Discovery to the candidate list. */
  sourceTrend: string | null;
}

// --- Trend discovery (ScrapeCreators: Search by Hashtag, Get Song Details) ---

export interface TrendingHashtag {
  brand: string;
  hashtag: string;
  videoCount: number;
  growthPct: number; // week-over-week (derived from snapshots)
  relevance: string;
}

export interface TrendingSound {
  brand: string;
  soundName: string;
  artistName: string;
  usageCount: number;
  growthPct: number;
}

// --- TikTok Shop Affiliate Seller OpenAPI mock layer ---
//
// Field names below are intentionally limited to fields confirmed in the
// bundled Affiliate Seller / Analytics OAS. The newest online creator
// performance document is 202608, while the bundled schema currently covers
// 202508; verify the live 202608 schema before wiring production responses.

export interface AffiliateCreatorPerformance {
  creatorOpenId: string;
  username: string;
  nickname: string;
  avatarSeed: string;
  followerCount: number;
  gmv: number;
  videoGmv: number;
  liveGmv: number;
  unitsSold: number;
  gpm: number;
  avgCommissionRate: number;
  videoEngagementRate: number;
  liveEngagementRate: number;
  postRate: number;
  pps: number;
  rating: number;
  brandCollaborationCount: number;
  promotedProductNum: number;
}

export interface AffiliateVideoPerformance {
  videoId: string;
  username: string;
  title: string;
  views: number;
  gmv: number;
  gpm: number;
  skuOrders: number;
  itemsSold: number;
  clickThroughRate: number;
  products: string[];
}

export interface AffiliateOrderSummary {
  orderId: string;
  creatorUsername: string;
  productName: string;
  contentType: "VIDEO" | "LIVE" | "SHOWCASE";
  status: "PROCESSING" | "COMPLETED" | "CANCELLED" | "FROZEN" | "DEDUCTED";
  quantity: number;
  returnedQuantity: number;
  refundedQuantity: number;
  commissionBase: number;
  paidCommission: number;
  commissionRate: number;
}

export interface AffiliateSampleApplication {
  applicationId: string;
  creatorUsername: string;
  creatorNickname: string;
  productName: string;
  status: "PENDING" | "AWAITING_SHIPMENT" | "SHIPPED" | "COMPLETED" | "REJECTED";
  fulfillmentStatus: "PENDING" | "FULFILLED" | "UNFULFILLED";
  followerCount: number;
  creatorGmv30d: number;
  medianShoppableVideoViews: number;
  fulfillmentPercentage: number;
  commissionRate: number;
  shipmentDeadline: string;
}

export interface AffiliateCollaborationSummary {
  collaborationId: string;
  name: string;
  type: "OPEN" | "TARGET";
  status: "NORMAL" | "ONGOING" | "TERMINATING" | "EXPIRED";
  productCount: number;
  invitedCreatorCount: number | null;
  showcaseCreatorCount: number;
  contentCreatorCount: number;
  hasFreeSample: boolean;
}
