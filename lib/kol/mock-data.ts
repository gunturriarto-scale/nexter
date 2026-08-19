import {
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
