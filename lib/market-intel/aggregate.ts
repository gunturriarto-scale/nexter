import { Shop, Product, MarketCategory } from "@/lib/market-intel/types";

export interface RankedShop extends Shop {
  rank: number;
  marketShare: number; // percent of total revenue
}

/** Sort shops by revenue desc and assign rank + market share. */
export function rankShops(shops: Shop[]): RankedShop[] {
  const total = shops.reduce((a, s) => a + s.revenue, 0);
  const sorted = [...shops].sort((a, b) => b.revenue - a.revenue);
  return sorted.map((s, i) => ({
    ...s,
    rank: i + 1,
    marketShare: total > 0 ? (s.revenue / total) * 100 : 0,
  }));
}

export interface RevenueMix {
  affiliatePct: number;
  selfPct: number;
  mallPct: number;
}

/** Affiliate / self-operated / mall split as percentages of shop revenue. */
export function revenueMix(shop: Shop): RevenueMix {
  const total = shop.revenue || 1;
  return {
    affiliatePct: (shop.affiliateRevenue / total) * 100,
    selfPct: (shop.selfAccountRevenue / total) * 100,
    mallPct: (shop.shoppingMallRevenue / total) * 100,
  };
}

export interface TrendSeriesPoint {
  day: string;
  [shopName: string]: string | number;
}

/** Combine each shop's revenueTrend into a single chart-friendly series (day + one key per shop). */
export function buildTrendSeries(shops: Shop[]): TrendSeriesPoint[] {
  const byDay = new Map<string, Record<string, number>>();
  for (const s of shops) {
    for (const p of s.revenueTrend) {
      const e = byDay.get(p.day) ?? {};
      e[s.shopName] = p.revenue;
      byDay.set(p.day, e);
    }
  }
  return Array.from(byDay.entries())
    .map(([day, vals]) => ({ day, ...vals }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export type IntelSeverity = "critical" | "warning" | "info";

export interface IntelInsight {
  severity: IntelSeverity;
  title: string;
  detail: string;
}

export interface EfficiencyRow {
  shopName: string;
  isGlow: boolean;
  revenuePerCreator: number;
  revenuePerProduct: number;
  revenuePerVideo: number;
  revenuePerLive: number;
}

/** Revenue-per-channel ratios — "working smart vs working hard". */
export function buildEfficiency(shops: Shop[]): EfficiencyRow[] {
  return shops
    .map((s) => ({
      shopName: s.shopName,
      isGlow: s.shopName === "Glow FX",
      revenuePerCreator: s.revenue / Math.max(1, s.creatorNumber),
      revenuePerProduct: s.revenue / Math.max(1, s.productNumber),
      revenuePerVideo: s.revenue / Math.max(1, s.videoNumber),
      revenuePerLive: s.revenue / Math.max(1, s.liveNumber),
    }))
    .sort((a, b) => b.revenuePerCreator - a.revenuePerCreator);
}

export interface QuadrantPoint {
  shopName: string;
  revenue: number;
  growth: number;
  isGlow: boolean;
}

/** For the growth-vs-size bubble chart. */
export function buildQuadrant(shops: Shop[]): QuadrantPoint[] {
  return shops.map((s) => ({
    shopName: s.shopName,
    revenue: s.revenue,
    growth: s.revenueGrowthRate,
    isGlow: s.shopName === "Glow FX",
  }));
}

/** Benchmark percentile (rank 1..n) of Glow FX for a given value, low = best. */
export function glowRankFor(shops: Shop[], key: (s: Shop) => number): number {
  const sorted = [...shops].sort((a, b) => key(b) - key(a));
  const idx = sorted.findIndex((s) => s.shopName === "Glow FX");
  return idx >= 0 ? idx + 1 : 0;
}

// ---- Market size & positioning (the "CEO verdict" layer) ----

export interface MarketSizeView {
  totalMarket: number; // sum of all category revenue
  marketGrowth: number; // weighted average growth
  glowRevenue: number;
  glowShare: number; // percent of total market
  glowShareRank: number; // rank among tracked shops
  leaderShare: number; // leader's share
  categoryCount: number;
}

/** CEO lens: how big is the market, how much do we hold, who's winning. */
export function buildMarketSize(
  categories: MarketCategory[],
  shops: Shop[]
): MarketSizeView {
  const totalMarket = categories.reduce((a, c) => a + c.revenue, 0);
  const marketGrowth =
    categories.reduce((a, c) => a + c.revenue * c.revenueGrowthRate, 0) /
    Math.max(1, totalMarket);
  const glow = shops.find((s) => s.shopName === "Glow FX");
  const glowRevenue = glow?.revenue ?? 0;
  const ranked = rankShops(shops);
  return {
    totalMarket,
    marketGrowth,
    glowRevenue,
    glowShare: totalMarket > 0 ? (glowRevenue / totalMarket) * 100 : 0,
    glowShareRank: ranked.findIndex((s) => s.shopName === "Glow FX") + 1,
    leaderShare: totalMarket > 0 ? (ranked[0].revenue / totalMarket) * 100 : 0,
    categoryCount: categories.length,
  };
}

export interface WhitespaceCell {
  categoryName: string;
  marketSize: number;
  growth: number;
  glowPresent: boolean;
  glowRevenue: number;
  /** competitor revenue in this category (excl Glow FX) */
  competitorRevenue: number;
}

/** Product-dev lens: which category has size+growth but thin Glow FX presence. */
export function buildWhitespace(
  categories: MarketCategory[],
  products: Product[],
  shops: Shop[]
): WhitespaceCell[] {
  const glowProducts = products.filter((p) => p.shopName === "Glow FX");
  // map product categoryTag → category via name matching (mock: tag maps to category)
  const tagToCategory: Record<string, string> = {
    Serum: "Serum & Essence",
    Toner: "Toner & Essence Water",
    Sunscreen: "Sunscreen",
    Moisturizer: "Moisturizer",
    "Body Care": "Body Care",
  };
  const glowCategories = new Set(glowProducts.map((p) => tagToCategory[p.categoryTag]).filter(Boolean));

  return categories.map((c) => {
    const glowRevenue = glowProducts
      .filter((p) => tagToCategory[p.categoryTag] === c.categoryName)
      .reduce((a, p) => a + p.revenue, 0);
    return {
      categoryName: c.categoryName,
      marketSize: c.revenue,
      growth: c.revenueGrowthRate,
      glowPresent: glowCategories.has(c.categoryName),
      glowRevenue,
      competitorRevenue: c.revenue - glowRevenue,
    };
  });
}

export interface PositioningPoint {
  shopName: string;
  unitPrice: number;
  revenue: number;
  isGlow: boolean;
}

/** Brand lens: price positioning (x = avg price, y = revenue). */
export function buildPositioning(shops: Shop[]): PositioningPoint[] {
  return shops.map((s) => ({
    shopName: s.shopName,
    unitPrice: s.unitPrice,
    revenue: s.revenue,
    isGlow: s.shopName === "Glow FX",
  }));
}

export interface BreakoutRow {
  productName: string;
  shopName: string;
  growth: number;
  revenue: number;
  isGlow: boolean;
  isNew: boolean; // launched < 90 days ago
}

/** Product-dev lens: fastest-growing / recently-launched products. */
export function buildBreakout(products: Product[]): BreakoutRow[] {
  const now = Date.now();
  return products
    .map((p) => ({
      productName: p.productName,
      shopName: p.shopName,
      growth: p.revenueGrowthRate,
      revenue: p.revenue,
      isGlow: p.shopName === "Glow FX",
      isNew: now - new Date(p.launchDate).getTime() < 90 * 86400000,
    }))
    .sort((a, b) => b.growth - a.growth);
}


/**
 * Derived insights from the benchmark — the "so what" for a growth lead.
 * Pure heuristics on top of the shop data, not API fields.
 */
export function buildInsights(shops: Shop[]): IntelInsight[] {
  const ranked = rankShops(shops);
  const glow = ranked.find((s) => s.shopName === "Glow FX");
  if (!glow) return [];

  const leader = ranked[0];
  const insights: IntelInsight[] = [];

  // Fastest growing
  const fastest = [...ranked].sort((a, b) => b.revenueGrowthRate - a.revenueGrowthRate)[0];
  if (fastest.shopName === "Glow FX") {
    insights.push({
      severity: "info",
      title: "Glow FX growth tertinggi",
      detail: `Growth ${fastest.revenueGrowthRate.toFixed(1)}% — paling cepat di benchmark, momentum naik.`,
    });
  }

  // Gap to leader
  if (glow.rank > 1) {
    const gap = leader.revenue - glow.revenue;
    const m = (n: number) => (n / 1e9).toFixed(1).replace(".", ",");
    insights.push({
      severity: "warning",
      title: `Gap ke #1 (${leader.shopName})`,
      detail: `Revenue Glow FX Rp ${m(glow.revenue)} M vs ${leader.shopName} Rp ${m(leader.revenue)} M — selisih Rp ${m(gap)} M.`,
    });
  }

  // Affiliate dependency
  const mix = revenueMix(glow);
  if (mix.affiliatePct > 45) {
    insights.push({
      severity: "warning",
      title: "Ketergantungan affiliate tinggi",
      detail: `${mix.affiliatePct.toFixed(0)}% revenue Glow FX dari affiliate — bandingkan rata-rata kompetitor. Diversifikasi channel perlu dipertimbangkan.`,
    });
  }

  // Creator leverage (revenue per creator)
  const glowRevPerCreator = glow.revenue / Math.max(1, glow.creatorNumber);
  const leaderRevPerCreator = leader.revenue / Math.max(1, leader.creatorNumber);
  if (glowRevPerCreator > leaderRevPerCreator) {
    insights.push({
      severity: "info",
      title: "Efisiensi kreator lebih tinggi",
      detail: `Revenue/kreator Glow FX lebih besar dari ${leader.shopName} — kreator Glow FX lebih produktif per orang.`,
    });
  }

  return insights;
}
