export type AffiliateTimeGrain = "daily" | "weekly" | "monthly";

export type AffiliateChannel = "VIDEO" | "LIVE" | "PRODUCT_CARD";

export type CompetitionType =
  | "MONTHLY_COMPETITION"
  | "QUARTERLY_REWARD"
  | "DOUBLE_DATE"
  | "PAYDAY";

/**
 * Affiliate manager ("PIC" / AM) who onboarded and owns a set of affiliate creators.
 * Not a TikTok API concept — an internal ownership attribute.
 */
export interface AffiliatePic {
  picId: string;
  name: string;
  avatarSeed: string;
}

export interface AffiliateCreatorProfile {
  creatorId: string;
  creatorOpenId: string;
  username: string;
  usernameAliases: string[];
  displayName: string;
  avatarSeed: string;
  followerCount: number;
  tags: string[];
  pic: string; // AffiliatePic.picId of the AM who owns this creator
}

export interface CreatorLevelSnapshot {
  creatorId: string;
  effectiveMonth: string;
  level: string;
  source: "TIKTOK_MARKETPLACE_FILTER";
}

export interface AffiliateCampaign {
  campaignId: string;
  name: string;
  status: "ACTIVE" | "ENDED";
  requiredHashtags: string[];
  minimumHashtagMatches: number;
}

export interface AffiliateVideo {
  videoId: string;
  creatorUsername: string;
  campaignId: string;
  title: string;
  videoPostTime: string;
  hashtags: string[];
}

/**
 * API-ready daily attribution fact. TikTok video analytics and affiliate order
 * responses identify creators by username, so joins deliberately go through
 * the creator identity map instead of assuming a stable display handle.
 */
export interface AffiliateDailyFact {
  date: string;
  creatorUsername: string;
  campaignId: string;
  videoId: string; // empty string for LIVE facts
  channel: AffiliateChannel;
  gmv: number;
  cancelledValue: number;
  returnedValue: number;
  refundedValue: number;
  orders: number;
  commission: number;
}

export interface CompetitionPeriod {
  competitionId: string;
  name: string;
  type: CompetitionType;
  campaignId: string;
  startDate: string;
  endDate: string;
  participantCreatorIds: string[];
  requiredHashtags: string[];
  minimumHashtagMatches: number;
}

export interface AffiliateFilters {
  startDate: string;
  endDate: string;
  grain: AffiliateTimeGrain;
  campaignId?: string;
  creatorLevel?: string;
  creatorTag?: string;
  query?: string;
}

export interface MetricValue {
  current: number;
  previous: number;
  growthPct: number | null;
}

export interface AffiliateOverviewMetrics {
  gmv: MetricValue;
  nmv: MetricValue;
  activeAffiliates: MetricValue;
  videoQuantity: MetricValue;
  validVideoQuantity: MetricValue;
  orders: MetricValue;
  commission: MetricValue;
}

export interface AffiliateTrendPoint {
  bucket: string;
  label: string;
  gmv: number;
  nmv: number;
  orders: number;
  validVideos: number;
}

export interface AffiliateCreatorRow {
  creator: AffiliateCreatorProfile;
  level: string | null;
  videoQuantity: number;
  validVideoQuantity: number;
  gmv: number;
  nmv: number;
  commission: number;
  growthPct: number | null;
}

/**
 * Per-PIC scoreboard. Every headline number carries its own current/previous/
 * growth so the card can show a "% vs previous" next to each metric.
 */
export interface AffiliatePicRow {
  pic: AffiliatePic;
  creatorCount: MetricValue; // creators under this PIC with activity in scope
  videoQuantity: MetricValue;
  gmv: MetricValue; // video + live + product card
  nmv: MetricValue; // video + live + product card
  gmvVideo: MetricValue;
  gmvLive: MetricValue;
  gmvProductCard: MetricValue;
}

export interface AffiliatePicCreatorRow {
  creator: AffiliateCreatorProfile;
  level: string | null;
  videoQuantity: number;
  validVideoQuantity: number;
  gmv: number; // video + live + product card
  nmv: number;
  gmvVideo: number;
  gmvLive: number;
  gmvProductCard: number;
  nmvVideo: number;
  nmvLive: number;
  nmvProductCard: number;
  commission: number;
  growthPct: number | null; // total GMV vs previous equal-length period
}

export interface AffiliateVideoRow {
  video: AffiliateVideo;
  creator: AffiliateCreatorProfile;
  campaign: AffiliateCampaign;
  gmv: number;
  nmv: number;
  matchedHashtags: string[];
  isValid: boolean;
}

export interface CompetitionCreatorRow {
  rank: number;
  creator: AffiliateCreatorProfile;
  gmv: number;
  nmv: number;
  validVideoQuantity: number;
  growthPct: number | null;
}

