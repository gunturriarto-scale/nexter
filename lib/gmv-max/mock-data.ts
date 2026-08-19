import { Campaign, Creative, DailyMetric, Livestream, Product } from "@/lib/gmv-max/types";

/**
 * Full mockup dataset — no Supabase/TikTok calls. Modeled on every GMV Max
 * field this project has actually verified against TikTok's docs (see
 * lib/gmv-max/types.ts header). Swap this module for lib/gmv-max/queries.ts
 * (real data) once Supabase + TikTok credentials are wired in — the real
 * pipeline (tiktok.ts/route.ts) currently only covers the narrower
 * cost/roi/orders/watch-through fields and will need extending to match
 * this richer shape before that swap.
 *
 * Single brand: Glow FX Beauty, modeled on the real GLOW fx Beauty TikTok
 * Shop catalog (screenshot supplied by the user).
 */

function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}
function isoDaysAgo(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}
function isoDatetimeAgo(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export const MOCK_BRANDS = ["Glow FX"];

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-1",
    campaignName: "Glow FX — Glow Bomb Series GMV Max",
    promotionType: "PRODUCT_GMV_MAX",
    operationStatus: "ENABLE",
    bidType: "CUSTOM",
    scheduleType: "Continuously",
    scheduleStartTime: "2026-05-01 00:00:00",
    scheduleEndTime: null,
    roasBid: 4.5,
    recommendedRoasBid: 4.2,
    dailyBudget: 500,
    maxDeliveryBudget: 0,
    roiProtectionEnabled: true,
    roiProtectionStatus: "IN_EFFECT",
    placements: ["PLACEMENT_TIKTOK"],
    ageGroups: ["AGE_18_24", "AGE_25_34", "AGE_35_44"],
    affiliatePostsEnabled: false,
    promotionDays: null,
    autoBudget: {
      enabled: false,
      currentBudget: 500,
      budgetIncreasePercentage: 0,
      nextIncrease: 0,
      remainedTimes: 0,
      maximumBudget: 500,
    },
  },
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-2",
    campaignName: "Glow FX — Bestseller Auto-Select GMV Max",
    promotionType: "PRODUCT_GMV_MAX",
    operationStatus: "ENABLE",
    bidType: "NO_BID",
    scheduleType: "Continuously",
    scheduleStartTime: "2026-07-01 00:00:00",
    scheduleEndTime: null,
    roasBid: 0,
    recommendedRoasBid: 4.0,
    dailyBudget: 0,
    maxDeliveryBudget: 400,
    roiProtectionEnabled: false,
    roiProtectionStatus: "NOT_ELIGIBLE",
    placements: ["PLACEMENT_TIKTOK"],
    ageGroups: ["AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54"],
    affiliatePostsEnabled: true,
    promotionDays: null,
    autoBudget: {
      enabled: false,
      currentBudget: 400,
      budgetIncreasePercentage: 0,
      nextIncrease: 0,
      remainedTimes: 0,
      maximumBudget: 400,
    },
  },
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-live-1",
    campaignName: "Glow FX — Weekend LIVE GMV Max",
    promotionType: "LIVE_GMV_MAX",
    operationStatus: "ENABLE",
    bidType: "CUSTOM",
    scheduleType: "Continuously",
    scheduleStartTime: "2026-05-10 00:00:00",
    scheduleEndTime: null,
    roasBid: 5.5,
    recommendedRoasBid: 4.8,
    dailyBudget: 400,
    maxDeliveryBudget: 0,
    roiProtectionEnabled: true,
    roiProtectionStatus: "IN_EFFECT",
    placements: ["PLACEMENT_TIKTOK"],
    ageGroups: ["AGE_18_24", "AGE_25_34", "AGE_35_44"],
    affiliatePostsEnabled: false,
    promotionDays: null,
    autoBudget: {
      enabled: false,
      currentBudget: 400,
      budgetIncreasePercentage: 0,
      nextIncrease: 0,
      remainedTimes: 0,
      maximumBudget: 400,
    },
    ttAccountName: "glowfx.beauty",
    ttAccountAvatarSeed: "glowfx.beauty",
  },
];

export const MOCK_PRODUCTS: Product[] = [
  { brand: "Glow FX", campaignId: "camp-glowfx-1", itemGroupId: "sku-glowfx-glowbomb", productName: "GLOW fx BEAUTY Glow Bomb Serum 20ml", productImageSeed: "glowfx-glowbomb", cost: 11228, orders: 1443, grossRevenue: 45923, roi: 4.09 },
  { brand: "Glow FX", campaignId: "camp-glowfx-1", itemGroupId: "sku-glowfx-ricetoner", productName: "GLOW fx BEAUTY Glow Bomb Rice Toner", productImageSeed: "glowfx-ricetoner", cost: 3016, orders: 402, grossRevenue: 13272, roi: 4.40 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-acnepure", productName: "GLOW fx BEAUTY Acne Pure Serum 20mL", productImageSeed: "glowfx-acnepure", cost: 6420, orders: 540, grossRevenue: 20544, roi: 3.20 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-moisturizer", productName: "GLOW fx BEAUTY Brightening & Barrier Repair Moisturizer", productImageSeed: "glowfx-moisturizer", cost: 2810, orders: 233, grossRevenue: 8149, roi: 2.90 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-peeling", productName: "GLOW fx BEAUTY 17% Total Acids Peeling Serum", productImageSeed: "glowfx-peeling", cost: 4200, orders: 310, grossRevenue: 11800, roi: 2.81 },
];

export const MOCK_CREATIVES: Creative[] = [
  { brand: "Glow FX", campaignId: "camp-glowfx-1", itemGroupId: "sku-glowfx-glowbomb", itemId: "vid-glowfx-glowbomb-a", title: "GLOW BOMB 19% — cerah cuma dalam 7 hari?", ttAccountName: "@glowfx.beauty", ttAccountAvatarSeed: "glowfx.beauty", authorizationType: "TTS_TT", shopContentType: "VIDEO", status: "DELIVERING", durationSec: 26, videoCoverSeed: "glowfx-glowbomb-a", cost: 8340, orders: 1120, grossRevenue: 36228, roi: 4.34, productImpressions: 402000, productClicks: 11500, productClickRate: 2.86, adClickRate: 4.4, adConversionRate: 12.7, viewRate2s: 51.7, viewRate6s: 29.6, viewRateP25: 21.0, viewRateP50: 13.8, viewRateP75: 7.9, viewRateP100: 3.2 },
  { brand: "Glow FX", campaignId: "camp-glowfx-1", itemGroupId: "sku-glowfx-glowbomb", itemId: "vid-glowfx-glowbomb-b", title: "Testing Glow Bomb Serum 14 hari, ini hasilnya", ttAccountName: "@dermaid.review", ttAccountAvatarSeed: "dermaid.review", authorizationType: "AFFILIATE", shopContentType: "VIDEO", status: "LEARNING", durationSec: 61, videoCoverSeed: "glowfx-glowbomb-b", cost: 2888, orders: 323, grossRevenue: 9695, roi: 3.36, productImpressions: 118000, productClicks: 2760, productClickRate: 2.34, adClickRate: 3.0, adConversionRate: 9.1, viewRate2s: 44.2, viewRate6s: 24.8, viewRateP25: 17.1, viewRateP50: 10.5, viewRateP75: 5.6, viewRateP100: 2.1 },
  { brand: "Glow FX", campaignId: "camp-glowfx-1", itemGroupId: "sku-glowfx-ricetoner", itemId: "vid-glowfx-ricetoner-a", title: "77% Rice Bran Water, ini toner favorit gue", ttAccountName: "@glowfx.beauty", ttAccountAvatarSeed: "glowfx.beauty", authorizationType: "TTS_TT", shopContentType: "VIDEO", status: "DELIVERING", durationSec: 22, videoCoverSeed: "glowfx-ricetoner-a", cost: 3016, orders: 402, grossRevenue: 13272, roi: 4.40, productImpressions: 129000, productClicks: 3010, productClickRate: 2.33, adClickRate: 3.2, adConversionRate: 10.1, viewRate2s: 41.0, viewRate6s: 23.4, viewRateP25: 16.0, viewRateP50: 9.9, viewRateP75: 5.2, viewRateP100: 2.0 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-acnepure", itemId: "vid-glowfx-acnepure-a", title: "Jerawat membandel? coba Acne Pure Serum", ttAccountName: "@glowfx.beauty", ttAccountAvatarSeed: "glowfx.beauty", authorizationType: "TTS_TT", shopContentType: "VIDEO", status: "DELIVERING", durationSec: 35, videoCoverSeed: "glowfx-acnepure-a", cost: 6420, orders: 540, grossRevenue: 20544, roi: 3.20, productImpressions: 267000, productClicks: 5340, productClickRate: 2.00, adClickRate: 2.8, adConversionRate: 8.4, viewRate2s: 37.5, viewRate6s: 20.2, viewRateP25: 13.4, viewRateP50: 8.0, viewRateP75: 4.1, viewRateP100: 1.6 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-moisturizer", itemId: "vid-glowfx-moisturizer-a", title: "7 hari pakai moisturizer ini, before-after gila", ttAccountName: "@glow.by.tia", ttAccountAvatarSeed: "glow.by.tia", authorizationType: "AUTH_CODE", shopContentType: "VIDEO", status: "AUTHORIZATION_NEEDED", durationSec: 45, videoCoverSeed: "glowfx-moisturizer-a", cost: 0, orders: 0, grossRevenue: 0, roi: 0, productImpressions: 0, productClicks: 0, productClickRate: 0, adClickRate: 0, adConversionRate: 0, viewRate2s: 0, viewRate6s: 0, viewRateP25: 0, viewRateP50: 0, viewRateP75: 0, viewRateP100: 0 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-moisturizer", itemId: "vid-glowfx-moisturizer-b", title: "Barrier repair dulu apa brightening dulu sih?", ttAccountName: "@glowfx.beauty", ttAccountAvatarSeed: "glowfx.beauty", authorizationType: "TTS_TT", shopContentType: "VIDEO", status: "DELIVERING", durationSec: 29, videoCoverSeed: "glowfx-moisturizer-b", cost: 2810, orders: 233, grossRevenue: 8149, roi: 2.90, productImpressions: 121000, productClicks: 2420, productClickRate: 2.00, adClickRate: 2.4, adConversionRate: 7.2, viewRate2s: 33.8, viewRate6s: 18.0, viewRateP25: 12.0, viewRateP50: 7.1, viewRateP75: 3.6, viewRateP100: 1.4 },
  { brand: "Glow FX", campaignId: "camp-glowfx-2", itemGroupId: "sku-glowfx-peeling", itemId: "vid-glowfx-peeling-a", title: "60 detik doang, kulit langsung glowing bersih", ttAccountName: "@glowfx.beauty", ttAccountAvatarSeed: "glowfx.beauty", authorizationType: "TTS_TT", shopContentType: "VIDEO", status: "DELIVERING", durationSec: 24, videoCoverSeed: "glowfx-peeling-a", cost: 4200, orders: 310, grossRevenue: 11800, roi: 2.81, productImpressions: 118000, productClicks: 2360, productClickRate: 2.00, adClickRate: 2.3, adConversionRate: 7.0, viewRate2s: 33.0, viewRate6s: 17.6, viewRateP25: 11.7, viewRateP50: 6.9, viewRateP75: 3.5, viewRateP100: 1.3 },
];

export const MOCK_LIVESTREAMS: Livestream[] = [
  { brand: "Glow FX", campaignId: "camp-glowfx-live-1", roomId: "room-glowfx-1", liveName: "GLOW FX Weekend Glow Up — LIVE NOW", liveStatus: "ONGOING", launchedTime: isoDatetimeAgo(1.5), durationMin: 90, cost: 512, orders: 58, grossRevenue: 3204, roi: 6.26, allShopsOrders: 58, allShopsGrossRevenue: 3204, allShopsRoi: 6.26, liveViews: 33500, costPerLiveView: 0.015, views10s: 19100, liveFollows: 401 },
];

const DAY_COUNT = 14;

function buildDailyMetrics(): DailyMetric[] {
  const rows: DailyMetric[] = [];
  const specs: { campaignId: string; brand: string; promotionType: Campaign["promotionType"]; dailyCost: number; targetRoi: number; noise: number; seed: number }[] = [
    { campaignId: "camp-glowfx-1", brand: "Glow FX", promotionType: "PRODUCT_GMV_MAX", dailyCost: 424, targetRoi: 4.2, noise: 0.3, seed: 13 },
    { campaignId: "camp-glowfx-2", brand: "Glow FX", promotionType: "PRODUCT_GMV_MAX", dailyCost: 380, targetRoi: 3.0, noise: 0.35, seed: 14 },
    { campaignId: "camp-glowfx-live-1", brand: "Glow FX", promotionType: "LIVE_GMV_MAX", dailyCost: 73, targetRoi: 5.8, noise: 0.5, seed: 17 },
  ];
  for (const spec of specs) {
    const rng = makeRng(spec.seed);
    for (let offset = DAY_COUNT - 1; offset >= 0; offset--) {
      const cost = round2(spec.dailyCost * (1 - spec.noise / 2 + rng() * spec.noise));
      const grossRevenue = round2(cost * spec.targetRoi * (0.85 + rng() * 0.3));
      const costPerOrder = 6 + rng() * 4; // ~$6-10/order, plausible for these SKUs
      rows.push({
        brand: spec.brand,
        campaignId: spec.campaignId,
        promotionType: spec.promotionType,
        day: isoDaysAgo(offset),
        cost,
        netCost: round2(cost * 0.97),
        grossRevenue,
        orders: Math.max(0, Math.round(cost / costPerOrder)),
      });
    }
  }
  return rows;
}

export const MOCK_DAILY_METRICS: DailyMetric[] = buildDailyMetrics();
