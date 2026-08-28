import {
  AffiliateCollaborationSummary,
  AffiliateCreatorPerformance,
  AffiliateOrderSummary,
  AffiliateSampleApplication,
  AffiliateVideoPerformance,
  KolCreator,
  KolDiscoveryCandidate,
  KolTrackedPost,
  TrendingHashtag,
  TrendingSound,
} from "@/lib/kol/types";

/**
 * Static mock data for the KOL dashboard — no Supabase/TikTok/ScrapeCreators
 * calls. Single brand: Glow FX Beauty, modeled on the real GLOW fx Beauty
 * TikTok Shop catalog. @glowfx.beauty's video also runs as a paid GMV Max
 * creative (same numbers as lib/gmv-max/mock-data.ts for continuity).
 *
 * Only entities that CAN be pulled from our APIs are present (see types.ts for
 * the audit). Collab pipeline / sample requests / conversations / affiliate
 * orders were removed — they're not in any API we have.
 */

function isoDaysFromNow(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

export const MOCK_BRANDS = ["Glow FX"];

export const MOCK_CREATORS: KolCreator[] = [
  { brand: "Glow FX", creatorId: "cr-glowfx-official", username: "@glowfx.beauty", displayName: "GLOW fx Beauty Official", avatarSeed: "glowfx.beauty", category: "Brand account", authorizationType: "TTS_TT", followerCount: 1200000, source: "gmv_max", productFocus: "Multi-produk" },
  { brand: "Glow FX", creatorId: "cr-kulitsehat", username: "@kulitsehat.id", displayName: "Kulit Sehat ID", avatarSeed: "kulitsehat.id", category: "Skincare", authorizationType: "AFFILIATE", followerCount: 620000, source: "kalodata", productFocus: "GLOW fx BEAUTY Acne Pure Serum 20mL" },
  { brand: "Glow FX", creatorId: "cr-dermaid-review", username: "@dermaid.review", displayName: "Dermaid Review", avatarSeed: "dermaid.review", category: "Dermatologist review", authorizationType: "AFFILIATE", followerCount: 340000, source: "gmv_max", productFocus: "GLOW fx BEAUTY Glow Bomb Serum 20ml" },
  { brand: "Glow FX", creatorId: "cr-glow-by-tia", username: "@glow.by.tia", displayName: "Glow by Tia", avatarSeed: "glow.by.tia", category: "Skincare", authorizationType: "AUTH_CODE", followerCount: 180000, source: "gmv_max", productFocus: "GLOW fx BEAUTY Brightening & Barrier Repair Moisturizer" },
  { brand: "Glow FX", creatorId: "cr-serumdiaries", username: "@serumdiaries", displayName: "Serum Diaries", avatarSeed: "serumdiaries", category: "Skincare", authorizationType: "AFFILIATE", followerCount: 32000, source: "scrapecreators", productFocus: "GLOW fx BEAUTY 17% Total Acids Peeling Serum" },
  { brand: "Glow FX", creatorId: "cr-riceandglow", username: "@riceandglow", displayName: "Rice & Glow Diary", avatarSeed: "riceandglow", category: "Skincare", authorizationType: "AFFILIATE", followerCount: 7200, source: "scrapecreators", productFocus: "GLOW fx BEAUTY Glow Bomb Rice Toner" },
];

function trend(base: number, growth: number[]): { day: string; views: number }[] {
  return growth.map((mult, i) => ({ day: isoDaysFromNow(-(growth.length - i)).slice(0, 10), views: Math.round(base * mult) }));
}

export const MOCK_TRACKED_POSTS: KolTrackedPost[] = [
  {
    brand: "Glow FX", postId: "tp-1", creatorId: "cr-glowfx-official",
    postUrl: "https://www.tiktok.com/@glowfx.beauty/video/7401006", caption: "GLOW BOMB 19% — cerah cuma dalam 7 hari?",
    addedBy: "Sarah (KOL team)", postedAt: isoDaysFromNow(-13), lastSyncedAt: isoDaysFromNow(0), syncStatus: "ok",
    views: 940000, likes: 88000, comments: 5200, shares: 7100,
    linkedGmvMax: { cost: 8340, roi: 4.34, orders: 1120 },
    viewsTrend: trend(940000, [0.5, 0.68, 0.8, 0.9, 0.96, 1]),
  },
  {
    brand: "Glow FX", postId: "tp-2", creatorId: "cr-dermaid-review",
    postUrl: "https://www.tiktok.com/@dermaid.review/video/7401007", caption: "Testing Glow Bomb Serum 14 hari, ini hasilnya",
    addedBy: "Sarah (KOL team)", postedAt: isoDaysFromNow(-8), lastSyncedAt: isoDaysFromNow(0), syncStatus: "ok",
    views: 356000, likes: 24500, comments: 1800, shares: 2100,
    linkedGmvMax: { cost: 2888, roi: 3.36, orders: 323 },
    viewsTrend: trend(356000, [0.55, 0.7, 0.82, 0.91, 0.97, 1]),
  },
  {
    brand: "Glow FX", postId: "tp-3", creatorId: "cr-glow-by-tia",
    postUrl: "https://www.tiktok.com/@glow.by.tia/video/7401008", caption: "7 hari pakai moisturizer ini, before-after gila",
    addedBy: "Budi (KOL team)", postedAt: isoDaysFromNow(-4), lastSyncedAt: isoDaysFromNow(0), syncStatus: "ok",
    views: 142000, likes: 12800, comments: 940, shares: 610,
    linkedGmvMax: null,
    viewsTrend: trend(142000, [0.3, 0.55, 0.75, 0.88, 0.95, 1]),
  },
  {
    brand: "Glow FX", postId: "tp-4", creatorId: "cr-kulitsehat",
    postUrl: "https://www.tiktok.com/@kulitsehat.id/video/7401009", caption: "Acne Pure Serum review jujur 30 hari pemakaian",
    addedBy: "Sarah (KOL team)", postedAt: isoDaysFromNow(-30), lastSyncedAt: isoDaysFromNow(0), syncStatus: "ok",
    views: 610000, likes: 51000, comments: 3300, shares: 4200,
    linkedGmvMax: null,
    viewsTrend: trend(610000, [0.6, 0.75, 0.86, 0.93, 0.98, 1]),
  },
  {
    brand: "Glow FX", postId: "tp-5", creatorId: "cr-serumdiaries",
    postUrl: "https://www.tiktok.com/@serumdiaries/video/7401012", caption: "Peeling serum 60 detik, worth the hype?",
    addedBy: "Budi (KOL team)", postedAt: isoDaysFromNow(-6), lastSyncedAt: isoDaysFromNow(0), syncStatus: "ok",
    views: 88000, likes: 6900, comments: 420, shares: 310,
    linkedGmvMax: null,
    viewsTrend: trend(88000, [0.35, 0.58, 0.78, 0.9, 0.96, 1]),
  },
  {
    brand: "Glow FX", postId: "tp-6", creatorId: "cr-riceandglow",
    postUrl: "https://www.tiktok.com/@riceandglow/video/7401013", caption: "Toner rice water ini beneran nge-glow gak sih?",
    addedBy: "Budi (KOL team)", postedAt: isoDaysFromNow(-1), lastSyncedAt: isoDaysFromNow(0), syncStatus: "ok",
    views: 45000, likes: 3800, comments: 210, shares: 140,
    linkedGmvMax: null,
    viewsTrend: trend(45000, [0.15, 0.35, 0.6, 0.82, 0.94, 1]),
  },
];

export const MOCK_DISCOVERY: KolDiscoveryCandidate[] = [
  { brand: "Glow FX", username: "@brightskin.tips", displayName: "Bright Skin Tips", avatarSeed: "brightskin.tips", category: "Skincare", followerCount: 275000, engagementRate: 6.1, reason: "Sering review toner kompetitor, belum pernah endorse Glow FX Rice Toner", productFocus: "GLOW fx BEAUTY Glow Bomb Rice Toner", sourceTrend: "#ricewaterskincare" },
  { brand: "Glow FX", username: "@ceceliaskin", displayName: "Cecelia Skin Diary", avatarSeed: "ceceliaskin", category: "Skincare", followerCount: 35000, engagementRate: 11.2, reason: "Engagement rate tinggi walau follower kecil — micro-KOL kandidat kedua buat Peeling Serum", productFocus: "GLOW fx BEAUTY 17% Total Acids Peeling Serum", sourceTrend: "Sound: 60 Second Skincare" },
  { brand: "Glow FX", username: "@acnefreejourney", displayName: "Acne Free Journey", avatarSeed: "acnefreejourney", category: "Skincare", followerCount: 91000, engagementRate: 9.0, reason: "Niche jerawat aktif, follower overlap tinggi sama target Acne Pure Serum", productFocus: "GLOW fx BEAUTY Acne Pure Serum 20mL", sourceTrend: "#acnetokindonesia" },
  { brand: "Glow FX", username: "@barrierfixdiary", displayName: "Barrier Fix Diary", avatarSeed: "barrierfixdiary", category: "Skincare", followerCount: 58000, engagementRate: 7.5, reason: "Konten before-after barrier repair lagi naik, cocok buat push Moisturizer", productFocus: "GLOW fx BEAUTY Brightening & Barrier Repair Moisturizer", sourceTrend: "#skinbarrier" },
];

export const MOCK_TRENDING_HASHTAGS: TrendingHashtag[] = [
  { brand: "Glow FX", hashtag: "#ricewaterskincare", videoCount: 210000, growthPct: 52, relevance: "Match ke Glow Bomb Rice Toner — masih early, masuk sekarang sebelum ramai" },
  { brand: "Glow FX", hashtag: "#skinbarrier", videoCount: 480000, growthPct: 34, relevance: "Match ke Brightening & Barrier Repair Moisturizer" },
  { brand: "Glow FX", hashtag: "#glowingskin", videoCount: 1200000, growthPct: 18, relevance: "Match ke Glow Bomb Serum — volume besar tapi makin kompetitif" },
  { brand: "Glow FX", hashtag: "#acnetokindonesia", videoCount: 2100000, growthPct: 9, relevance: "Match ke Acne Pure Serum — niche sudah matang/stabil" },
];

export const MOCK_TRENDING_SOUNDS: TrendingSound[] = [
  { brand: "Glow FX", soundName: "60 Second Skincare", artistName: "Ambient Beats", usageCount: 120000, growthPct: 67 },
  { brand: "Glow FX", soundName: "Glow Up Anthem", artistName: "DJ Nova", usageCount: 340000, growthPct: 45 },
  { brand: "Glow FX", soundName: "Soft Girl Era", artistName: "Mila Sound", usageCount: 890000, growthPct: 12 },
];

export const MOCK_AFFILIATE_CREATORS: AffiliateCreatorPerformance[] = [
  { creatorOpenId: "coid-kulitsehat", username: "@kulitsehat.id", nickname: "Kulit Sehat ID", avatarSeed: "kulitsehat.id", followerCount: 620000, gmv: 486_400_000, videoGmv: 321_100_000, liveGmv: 165_300_000, unitsSold: 3980, gpm: 812_000, avgCommissionRate: 12, videoEngagementRate: 7.8, liveEngagementRate: 5.4, postRate: 84, pps: 4.7, rating: 4.8, brandCollaborationCount: 42, promotedProductNum: 118 },
  { creatorOpenId: "coid-dermaid", username: "@dermaid.review", nickname: "Dermaid Review", avatarSeed: "dermaid.review", followerCount: 340000, gmv: 354_900_000, videoGmv: 298_600_000, liveGmv: 56_300_000, unitsSold: 2841, gpm: 995_000, avgCommissionRate: 14, videoEngagementRate: 8.2, liveEngagementRate: 4.8, postRate: 76, pps: 4.5, rating: 4.9, brandCollaborationCount: 31, promotedProductNum: 82 },
  { creatorOpenId: "coid-tia", username: "@glow.by.tia", nickname: "Glow by Tia", avatarSeed: "glow.by.tia", followerCount: 180000, gmv: 218_700_000, videoGmv: 187_200_000, liveGmv: 31_500_000, unitsSold: 1912, gpm: 743_000, avgCommissionRate: 15, videoEngagementRate: 9.1, liveEngagementRate: 6.2, postRate: 91, pps: 4.8, rating: 4.7, brandCollaborationCount: 18, promotedProductNum: 54 },
  { creatorOpenId: "coid-serumdiaries", username: "@serumdiaries", nickname: "Serum Diaries", avatarSeed: "serumdiaries", followerCount: 32000, gmv: 96_800_000, videoGmv: 96_800_000, liveGmv: 0, unitsSold: 876, gpm: 1_100_000, avgCommissionRate: 16, videoEngagementRate: 10.6, liveEngagementRate: 0, postRate: 88, pps: 4.6, rating: 4.9, brandCollaborationCount: 9, promotedProductNum: 27 },
  { creatorOpenId: "coid-riceandglow", username: "@riceandglow", nickname: "Rice & Glow Diary", avatarSeed: "riceandglow", followerCount: 7200, gmv: 41_200_000, videoGmv: 41_200_000, liveGmv: 0, unitsSold: 402, gpm: 916_000, avgCommissionRate: 18, videoEngagementRate: 12.4, liveEngagementRate: 0, postRate: 94, pps: 4.4, rating: 4.8, brandCollaborationCount: 4, promotedProductNum: 13 },
];

export const MOCK_AFFILIATE_VIDEOS: AffiliateVideoPerformance[] = [
  { videoId: "7401009", username: "@kulitsehat.id", title: "Acne Pure Serum — review 30 hari", views: 610000, gmv: 142_400_000, gpm: 233_443, skuOrders: 1184, itemsSold: 1260, clickThroughRate: 4.8, products: ["Acne Pure Serum 20mL"] },
  { videoId: "7401007", username: "@dermaid.review", title: "Testing Glow Bomb Serum 14 hari", views: 356000, gmv: 118_900_000, gpm: 333_989, skuOrders: 923, itemsSold: 1004, clickThroughRate: 5.6, products: ["Glow Bomb Serum 20mL"] },
  { videoId: "7401008", username: "@glow.by.tia", title: "7 hari barrier repair moisturizer", views: 142000, gmv: 76_300_000, gpm: 537_324, skuOrders: 612, itemsSold: 651, clickThroughRate: 6.9, products: ["Barrier Repair Moisturizer"] },
  { videoId: "7401012", username: "@serumdiaries", title: "Peeling serum 60 detik", views: 88000, gmv: 51_800_000, gpm: 588_636, skuOrders: 408, itemsSold: 433, clickThroughRate: 7.4, products: ["17% Total Acids Peeling Serum"] },
  { videoId: "7401013", username: "@riceandglow", title: "Rice toner: beneran bikin glow?", views: 45000, gmv: 28_600_000, gpm: 635_556, skuOrders: 219, itemsSold: 237, clickThroughRate: 8.1, products: ["Glow Bomb Rice Toner"] },
];

export const MOCK_AFFILIATE_ORDERS: AffiliateOrderSummary[] = [
  { orderId: "57601", creatorUsername: "@kulitsehat.id", productName: "Acne Pure Serum 20mL", contentType: "VIDEO", status: "COMPLETED", quantity: 1260, returnedQuantity: 31, refundedQuantity: 18, commissionBase: 142_400_000, paidCommission: 17_088_000, commissionRate: 12 },
  { orderId: "57602", creatorUsername: "@dermaid.review", productName: "Glow Bomb Serum 20mL", contentType: "VIDEO", status: "COMPLETED", quantity: 1004, returnedQuantity: 22, refundedQuantity: 11, commissionBase: 118_900_000, paidCommission: 16_646_000, commissionRate: 14 },
  { orderId: "57603", creatorUsername: "@glow.by.tia", productName: "Barrier Repair Moisturizer", contentType: "VIDEO", status: "PROCESSING", quantity: 651, returnedQuantity: 5, refundedQuantity: 3, commissionBase: 76_300_000, paidCommission: 11_445_000, commissionRate: 15 },
  { orderId: "57604", creatorUsername: "@kulitsehat.id", productName: "Glow Bomb Rice Toner", contentType: "LIVE", status: "COMPLETED", quantity: 492, returnedQuantity: 14, refundedQuantity: 6, commissionBase: 58_700_000, paidCommission: 7_044_000, commissionRate: 12 },
  { orderId: "57605", creatorUsername: "@serumdiaries", productName: "17% Total Acids Peeling Serum", contentType: "SHOWCASE", status: "DEDUCTED", quantity: 433, returnedQuantity: 19, refundedQuantity: 12, commissionBase: 51_800_000, paidCommission: 7_456_000, commissionRate: 16 },
];

export const MOCK_AFFILIATE_SAMPLES: AffiliateSampleApplication[] = [
  { applicationId: "sa-201", creatorUsername: "@barrierfixdiary", creatorNickname: "Barrier Fix Diary", productName: "Barrier Repair Moisturizer", status: "PENDING", fulfillmentStatus: "PENDING", followerCount: 58000, creatorGmv30d: 74_200_000, medianShoppableVideoViews: 62000, fulfillmentPercentage: 92, commissionRate: 15, shipmentDeadline: isoDaysFromNow(2) },
  { applicationId: "sa-202", creatorUsername: "@acnefreejourney", creatorNickname: "Acne Free Journey", productName: "Acne Pure Serum 20mL", status: "AWAITING_SHIPMENT", fulfillmentStatus: "PENDING", followerCount: 91000, creatorGmv30d: 118_500_000, medianShoppableVideoViews: 87000, fulfillmentPercentage: 96, commissionRate: 14, shipmentDeadline: isoDaysFromNow(1) },
  { applicationId: "sa-203", creatorUsername: "@ceceliaskin", creatorNickname: "Cecelia Skin Diary", productName: "17% Total Acids Peeling Serum", status: "SHIPPED", fulfillmentStatus: "PENDING", followerCount: 35000, creatorGmv30d: 63_900_000, medianShoppableVideoViews: 54000, fulfillmentPercentage: 89, commissionRate: 16, shipmentDeadline: isoDaysFromNow(-1) },
  { applicationId: "sa-204", creatorUsername: "@riceandglow", creatorNickname: "Rice & Glow Diary", productName: "Glow Bomb Rice Toner", status: "COMPLETED", fulfillmentStatus: "FULFILLED", followerCount: 7200, creatorGmv30d: 41_200_000, medianShoppableVideoViews: 45000, fulfillmentPercentage: 100, commissionRate: 18, shipmentDeadline: isoDaysFromNow(-12) },
];

export const MOCK_AFFILIATE_COLLABORATIONS: AffiliateCollaborationSummary[] = [
  { collaborationId: "oc-101", name: "Glow FX Open Collaboration", type: "OPEN", status: "NORMAL", productCount: 6, invitedCreatorCount: null, showcaseCreatorCount: 184, contentCreatorCount: 73, hasFreeSample: true },
  { collaborationId: "tc-201", name: "Acne Authority Q3", type: "TARGET", status: "ONGOING", productCount: 2, invitedCreatorCount: 42, showcaseCreatorCount: 31, contentCreatorCount: 18, hasFreeSample: true },
  { collaborationId: "tc-202", name: "Rice Toner Launch", type: "TARGET", status: "ONGOING", productCount: 1, invitedCreatorCount: 28, showcaseCreatorCount: 19, contentCreatorCount: 11, hasFreeSample: true },
  { collaborationId: "tc-203", name: "Barrier Repair Always-on", type: "TARGET", status: "ONGOING", productCount: 1, invitedCreatorCount: 35, showcaseCreatorCount: 27, contentCreatorCount: 16, hasFreeSample: false },
];
