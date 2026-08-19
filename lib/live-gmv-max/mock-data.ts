import {
  DailyLiveMetric,
  LiveCampaign,
  LiveSession,
} from "@/lib/live-gmv-max/types";

/**
 * Mock dataset for the LIVE GMV Max dashboard. Every field is structured to
 * match the TikTok Business API LIVE GMV Max response shape 1:1 (see types.ts
 * header for the exact endpoint/field mapping). Swap this module for a real
 * Supabase-backed query once credentials are wired in — no field renaming
 * needed.
 *
 * Single brand: Glow FX Beauty. Deterministic (seeded) numbers so the mock
 * stays consistent across renders.
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

function isoHoursAgo(hoursAgo: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
}

export const MOCK_BRANDS = ["Glow FX"];

export const MOCK_LIVE_CAMPAIGNS: LiveCampaign[] = [
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-live-1",
    campaignName: "Glow FX — Weekend LIVE GMV Max",
    operationStatus: "ENABLE",
    bidType: "CUSTOM",
    roasBid: 5.5,
    dailyBudget: 400,
    maxDeliveryBudget: 0,
    roiProtectionStatus: "IN_EFFECT",
    createTime: "2026-05-10 00:00:00",
    modifyTime: "2026-08-12 09:30:00",
    ttAccountName: "@glowfx.beauty",
    ttAccountProfileImageUrl: null,
    scheduleType: "SCHEDULE_FROM_NOW",
    scheduleStartTime: "2026-05-10 00:00:00",
    scheduleEndTime: null,
  },
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-live-2",
    campaignName: "Glow FX — Payday LIVE GMV Max",
    operationStatus: "ENABLE",
    bidType: "NO_BID",
    roasBid: 0,
    dailyBudget: 0,
    maxDeliveryBudget: 250,
    roiProtectionStatus: "NOT_ELIGIBLE",
    createTime: "2026-07-20 00:00:00",
    modifyTime: "2026-08-11 18:15:00",
    ttAccountName: "@glowfx.beauty",
    ttAccountProfileImageUrl: null,
    scheduleType: "SCHEDULE_START_END",
    scheduleStartTime: "2026-07-20 00:00:00",
    scheduleEndTime: "2026-08-31 23:59:59",
  },
];

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-live-1",
    campaignName: "Glow FX — Weekend LIVE GMV Max",
    roomId: "room-glowfx-1",
    liveName: "GLOW FX Weekend Glow Up — LIVE NOW",
    liveStatus: "ONGOING",
    launchedTime: isoHoursAgo(1.5),
    durationMin: 90,
    ttAccountName: "@glowfx.beauty",
    ttAccountProfileImageUrl: null,
    cost: 512,
    netCost: 497,
    orders: 58,
    costPerOrder: 8.83,
    grossRevenue: 3204,
    roi: 6.26,
    liveViews: 33500,
    costPerLiveView: 0.015,
    views10s: 19100,
    liveFollows: 401,
  },
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-live-1",
    campaignName: "Glow FX — Weekend LIVE GMV Max",
    roomId: "room-glowfx-2",
    liveName: "Glow Up Tuesday — Skincare Routine Live",
    liveStatus: "END",
    launchedTime: isoHoursAgo(52),
    durationMin: 120,
    ttAccountName: "@glowfx.beauty",
    ttAccountProfileImageUrl: null,
    cost: 388,
    netCost: 377,
    orders: 41,
    costPerOrder: 9.46,
    grossRevenue: 1994,
    roi: 5.14,
    liveViews: 26800,
    costPerLiveView: 0.014,
    views10s: 15200,
    liveFollows: 289,
  },
  {
    brand: "Glow FX",
    campaignId: "camp-glowfx-live-2",
    campaignName: "Glow FX — Payday LIVE GMV Max",
    roomId: "room-glowfx-3",
    liveName: "Payday Restock LIVE — Bundling Hemat",
    liveStatus: "END",
    launchedTime: isoHoursAgo(96),
    durationMin: 150,
    ttAccountName: "@glowfx.beauty",
    ttAccountProfileImageUrl: null,
    cost: 276,
    netCost: 268,
    orders: 22,
    costPerOrder: 12.55,
    grossRevenue: 1435,
    roi: 5.2,
    liveViews: 19100,
    costPerLiveView: 0.014,
    views10s: 10800,
    liveFollows: 176,
  },
];

const DAY_COUNT = 14;

interface DaySpec {
  roomId: string;
  campaignId: string;
  baseCost: number;
  baseRevenue: number;
  baseViews: number;
  base10s: number;
  baseFollows: number;
  noise: number;
  seed: number;
}

function buildDailyLiveMetrics(): DailyLiveMetric[] {
  const specs: DaySpec[] = [
    // room-glowfx-1 only has a couple recent days (it's a weekend live)
    { roomId: "room-glowfx-1", campaignId: "camp-glowfx-live-1", baseCost: 256, baseRevenue: 1602, baseViews: 16750, base10s: 9550, baseFollows: 200, noise: 0.35, seed: 21 },
    // room-glowfx-2 ran earlier in the window
    { roomId: "room-glowfx-2", campaignId: "camp-glowfx-live-1", baseCost: 194, baseRevenue: 997, baseViews: 13400, base10s: 7600, baseFollows: 145, noise: 0.35, seed: 22 },
    // room-glowfx-3 (payday campaign, max delivery)
    { roomId: "room-glowfx-3", campaignId: "camp-glowfx-live-2", baseCost: 138, baseRevenue: 718, baseViews: 9550, base10s: 5400, baseFollows: 88, noise: 0.4, seed: 23 },
  ];

  const rows: DailyLiveMetric[] = [];
  for (const spec of specs) {
    const rng = makeRng(spec.seed);
    for (let offset = DAY_COUNT - 1; offset >= 0; offset--) {
      const cost = round2(spec.baseCost * (1 - spec.noise / 2 + rng() * spec.noise));
      const grossRevenue = round2(spec.baseRevenue * (0.85 + rng() * 0.3));
      const orders = Math.max(0, Math.round(cost / (8 + rng() * 4)));
      const liveViews = Math.round(spec.baseViews * (0.85 + rng() * 0.3));
      const views10s = Math.round(liveViews * (0.52 + rng() * 0.08));
      const liveFollows = Math.round(spec.baseFollows * (0.7 + rng() * 0.6));
      rows.push({
        brand: "Glow FX",
        campaignId: spec.campaignId,
        roomId: spec.roomId,
        day: isoDaysAgo(offset),
        cost,
        netCost: round2(cost * 0.97),
        orders,
        costPerOrder: orders > 0 ? round2(cost / orders) : 0,
        grossRevenue,
        roi: cost > 0 ? round2(grossRevenue / cost) : 0,
        liveViews,
        costPerLiveView: liveViews > 0 ? round2(cost / liveViews) : 0,
        views10s,
        liveFollows,
      });
    }
  }
  return rows;
}

export const MOCK_DAILY_LIVE_METRICS: DailyLiveMetric[] = buildDailyLiveMetrics();
