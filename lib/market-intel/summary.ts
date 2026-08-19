import { Shop, Product, MarketCategory } from "@/lib/market-intel/types";
import { Creator, Video, Livestream } from "@/lib/market-intel/benchmark-types";
import {
  buildEfficiency,
  buildMarketSize,
  buildWhitespace,
  buildBreakout,
  MarketSizeView,
} from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatPct, formatGrowthPct } from "@/lib/market-intel/format";

// ============================================================================
// Per-tab "so what" summaries. Pure functions → verdict-style bullet points so
// a CEO / brand lead / product dev gets the takeaway without reading tables.
// ============================================================================

export type SummaryTone = "positive" | "negative" | "warning" | "neutral";

export interface SummaryPoint {
  tone: SummaryTone;
  /** short bold lead, e.g. "Growth tercepat di benchmark" */
  lead: string;
  /** one-line detail with the numbers */
  detail: string;
}

export interface TabSummary {
  title: string;
  points: SummaryPoint[];
}

// ---------------------------------------------------------------------------
// RINGKASAN
// ---------------------------------------------------------------------------

export function summarizeRingkasan(
  shops: Shop[],
  marketSize: MarketSizeView
): TabSummary {
  const ranked = [...shops].sort((a, b) => b.revenue - a.revenue);
  const glow = shops.find((s) => s.shopName === "Glow FX")!;
  const leader = ranked[0];
  const leaderIsGlow = leader.shopName === "Glow FX";
  const glowGrowth = glow.revenueGrowthRate;
  const marketGrowth = marketSize.marketGrowth;
  const fastest = [...shops].sort((a, b) => b.revenueGrowthRate - a.revenueGrowthRate)[0];

  const points: SummaryPoint[] = [
    {
      tone: "neutral",
      lead: `Posisi #${marketSize.glowShareRank} dari ${shops.length} brand`,
      detail: `Glow FX pegang ${formatPct(marketSize.glowShare)} dari total market skincare ID senilai ${formatIdrCompact(marketSize.totalMarket)} (tumbuh ${formatGrowthPct(marketGrowth)}).`,
    },
  ];

  if (leaderIsGlow) {
    points.push({
      tone: "positive",
      lead: "Memimpin pasar di benchmark ini",
      detail: `Glow FX brand #1 dengan revenue ${formatIdrCompact(glow.revenue)}.`,
    });
  } else {
    points.push({
      tone: "warning",
      lead: `Gap ke leader ${leader.shopName}`,
      detail: `Selisih revenue ${formatIdrCompact(leader.revenue - glow.revenue)} — tapi Glow FX sedang mengejar.`,
    });
  }

  if (glowGrowth >= marketGrowth + 5) {
    points.push({
      tone: "positive",
      lead: "Menang share, bukan cuma tumbuh",
      detail: `Growth Glow FX ${formatGrowthPct(glowGrowth)} vs market ${formatGrowthPct(marketGrowth)} — artinya sedang ambil porsi dari kompetitor.`,
    });
  } else if (glowGrowth < marketGrowth) {
    points.push({
      tone: "negative",
      lead: "Tumbuh di bawah pasar",
      detail: `Growth ${formatGrowthPct(glowGrowth)} < market ${formatGrowthPct(marketGrowth)} — kehilangan share.`,
    });
  }

  if (fastest.shopName === "Glow FX") {
    points.push({
      tone: "positive",
      lead: "Momentum terkuat di benchmark",
      detail: `Growth ${formatGrowthPct(fastest.revenueGrowthRate)} — tertinggi dari ${shops.length} brand.`,
    });
  }

  return { title: "Ringkasan posisi", points };
}

// ---------------------------------------------------------------------------
// DEEP DIVE
// ---------------------------------------------------------------------------

export function summarizeDeepDive(shops: Shop[]): TabSummary {
  const eff = buildEfficiency(shops);
  const glow = shops.find((s) => s.shopName === "Glow FX")!;
  const glowEff = eff.find((e) => e.shopName === "Glow FX")!;
  const bestPerCreator = eff[0]; // sorted desc by revenuePerCreator
  const bestPerProduct = [...eff].sort((a, b) => b.revenuePerProduct - a.revenuePerProduct)[0];
  const leader = [...shops].sort((a, b) => b.revenue - a.revenue)[0];

  const points: SummaryPoint[] = [];

  // efficiency
  if (glowEff.revenuePerCreator >= bestPerCreator.revenuePerCreator * 0.9) {
    points.push({
      tone: "positive",
      lead: "Efisiensi kreator solid",
      detail: `Rev/kreator Glow FX ${formatIdrCompact(glowEff.revenuePerCreator)} — setara leader ${bestPerCreator.shopName}. Tinggal scale jumlah kreator.`,
    });
  } else {
    points.push({
      tone: "warning",
      lead: `Kalah efisien dari ${bestPerCreator.shopName}`,
      detail: `Rev/kreator Glow FX ${formatIdrCompact(glowEff.revenuePerCreator)} vs ${bestPerCreator.shopName} ${formatIdrCompact(bestPerCreator.revenuePerCreator)}.`,
    });
  }

  // hero SKU risk
  if (glow.top3RevenueShare >= 55) {
    points.push({
      tone: "warning",
      lead: `Konsentrasi hero SKU tinggi (${formatPct(glow.top3RevenueShare)})`,
      detail: "3 SKU terlaris nyumbang mayoritas revenue — rentan kalau satu produk turun.",
    });
  } else {
    points.push({
      tone: "neutral",
      lead: `Portofolio cukup diversifikasi (${formatPct(glow.top3RevenueShare)})`,
      detail: "Revenue nggak tergantung ke satu SKU.",
    });
  }

  // channel gap (mall)
  const glowMallPct = glow.revenue > 0 ? (glow.shoppingMallRevenue / glow.revenue) * 100 : 0;
  const maxMall = shops.reduce((a, s) => Math.max(a, (s.shoppingMallRevenue / Math.max(1, s.revenue)) * 100), 0);
  if (maxMall - glowMallPct > 3) {
    points.push({
      tone: "warning",
      lead: "Belum garap channel mall",
      detail: `Mall Glow FX ${formatPct(glowMallPct)} vs kompetitor hingga ${formatPct(maxMall)} — peluang revenue belum disentuh.`,
    });
  }

  // growth vs size (momentum)
  const glowGrowth = glow.revenueGrowthRate;
  const avgGrowth = shops.reduce((a, s) => a + s.revenueGrowthRate, 0) / shops.length;
  if (glowGrowth > avgGrowth + 5) {
    points.push({
      tone: "positive",
      lead: "High growth, masih mid-size",
      detail: `Growth ${formatGrowthPct(glowGrowth)} di atas rata-rata ${formatGrowthPct(avgGrowth)} — posisi ideal buat scale.`,
    });
  }

  // if fewer than 4 points, add a neutral filler with rev/product leader
  if (points.length < 4) {
    points.push({
      tone: "neutral",
      lead: `Efisiensi produk tertinggi: ${bestPerProduct.shopName}`,
      detail: `Rev/produk ${bestPerProduct.shopName} ${formatIdrCompact(bestPerProduct.revenuePerProduct)} — benchmark buat katalog Glow FX.`,
    });
  }

  return { title: "Kesimpulan deep dive", points };
}

// ---------------------------------------------------------------------------
// KONTEN & KREATOR
// ---------------------------------------------------------------------------

export function summarizeKonten(
  videos: Video[],
  lives: Livestream[],
  creators: Creator[]
): TabSummary {
  const ads = videos.filter((v) => v.isAd);
  const bestRoas = [...ads].sort((a, b) => b.adsRoas - a.adsRoas)[0];
  const glowAds = ads.filter((v) => v.affiliatedBrand === "Glow FX");
  const glowBestRoas = glowAds.length > 0 ? [...glowAds].sort((a, b) => b.adsRoas - a.adsRoas)[0] : null;

  const bestLive = [...lives].sort((a, b) => b.revenue - a.revenue)[0];
  const glowLive = lives.find((l) => l.affiliatedBrand === "Glow FX");

  const bestCreator = [...creators].sort((a, b) => b.revenue - a.revenue)[0];
  const glowCreators = creators.filter((c) => c.affiliatedBrand === "Glow FX");
  const glowTopCreator = [...glowCreators].sort((a, b) => b.revenue - a.revenue)[0];
  const highestEng = [...creators].sort((a, b) => b.engagementRate - a.engagementRate)[0];

  const points: SummaryPoint[] = [];

  // video ROAS
  if (glowBestRoas && bestRoas.affiliatedBrand === "Glow FX") {
    points.push({
      tone: "positive",
      lead: "Konten iklan paling efisien",
      detail: `ROAS ${glowBestRoas.adsRoas.toFixed(2)}x (${glowBestRoas.videoTitle}) — tertinggi di benchmark.`,
    });
  } else if (glowBestRoas) {
    points.push({
      tone: "neutral",
      lead: `ROAS terbaik Glow FX ${glowBestRoas.adsRoas.toFixed(2)}x`,
      detail: `Masih di bawah ${bestRoas.affiliatedBrand} (${bestRoas.adsRoas.toFixed(2)}x) — benchmark konten iklan.`,
    });
  }

  // live benchmark
  if (glowLive) {
    const bestLiveIsGlow = bestLive.affiliatedBrand === "Glow FX";
    points.push({
      tone: bestLiveIsGlow ? "positive" : "warning",
      lead: bestLiveIsGlow ? "Live paling besar" : `Live terbesar: ${bestLive.affiliatedBrand}`,
      detail: bestLiveIsGlow
        ? `Revenue ${formatIdrCompact(glowLive.revenue)} per session.`
        : `Glow FX ${formatIdrCompact(glowLive.revenue)} vs ${bestLive.affiliatedBrand} ${formatIdrCompact(bestLive.revenue)} — durasi & produk live perlu dibandingkan.`,
    });
  }

  // creator leverage
  if (glowTopCreator) {
    points.push({
      tone: glowTopCreator.revenue >= bestCreator.revenue * 0.7 ? "positive" : "neutral",
      lead: `Kreator top Glow FX: ${glowTopCreator.creatorNickname}`,
      detail: `GMV ${formatIdrCompact(glowTopCreator.revenue)} (growth ${formatGrowthPct(glowTopCreator.revenueGrowthRate)}). Kreator #1 benchmark: ${bestCreator.creatorNickname} (${formatIdrCompact(bestCreator.revenue)}).`,
    });
  }

  // engagement opportunity
  if (highestEng.affiliatedBrand !== "Glow FX") {
    points.push({
      tone: "neutral",
      lead: `Engagement tertinggi: ${highestEng.creatorNickname} (${formatPct(highestEng.engagementRate)})`,
      detail: `Kreator ${highestEng.affiliatedBrand} — kandidat model buat konten Glow FX.`,
    });
  }

  return { title: "Kesimpulan konten & kreator", points };
}

// ---------------------------------------------------------------------------
// PRODUK & PASAR
// ---------------------------------------------------------------------------

export function summarizeProduk(
  products: Product[],
  categories: MarketCategory[],
  shops: Shop[]
): TabSummary {
  const topProduct = [...products].sort((a, b) => b.revenue - a.revenue)[0];
  const glowTop = [...products.filter((p) => p.shopName === "Glow FX")].sort((a, b) => b.revenue - a.revenue)[0];
  const breakout = buildBreakout(products);
  const fastestBreakout = breakout[0];
  const whitespace = buildWhitespace(categories, products, shops);
  const bestOpportunity = [...whitespace].sort((a, b) => {
    const score = (c: typeof whitespace[number]) => c.marketSize / 1e9 + c.growth * 0.5 - (c.glowPresent ? 15 : 0);
    return score(b) - score(a);
  })[0];

  const points: SummaryPoint[] = [];

  // hero product
  points.push({
    tone: topProduct.shopName === "Glow FX" ? "positive" : "neutral",
    lead: `Produk terbesar: ${topProduct.shopName === "Glow FX" ? "milik Glow FX" : topProduct.shopName}`,
    detail: `${topProduct.productName} — ${formatIdrCompact(topProduct.revenue)} (30 hari). Glow FX: ${glowTop.productName} ${formatIdrCompact(glowTop.revenue)}.`,
  });

  // breakout
  if (fastestBreakout) {
    points.push({
      tone: fastestBreakout.isGlow ? "positive" : "neutral",
      lead: `Breakout tercepat: ${fastestBreakout.productName}`,
      detail: `Growth ${formatGrowthPct(fastestBreakout.growth)}${fastestBreakout.isNew ? " (produk baru <90 hari)" : ""} — ${fastestBreakout.shopName}.`,
    });
  }

  // whitespace
  if (bestOpportunity && !bestOpportunity.glowPresent) {
    points.push({
      tone: "warning",
      lead: `Whitespace terbesar: ${bestOpportunity.categoryName}`,
      detail: `Market ${formatIdrCompact(bestOpportunity.marketSize)} + growth ${formatGrowthPct(bestOpportunity.growth)} — Glow FX belum hadir. Peluang ekspansi.`,
    });
  } else if (bestOpportunity) {
    points.push({
      tone: "neutral",
      lead: `Semua kategori utama sudah digarap`,
      detail: `Kategori terbesar: ${bestOpportunity.categoryName} (${formatIdrCompact(bestOpportunity.marketSize)}).`,
    });
  }

  // category concentration (fragmented = easy entry)
  const mostFragmented = [...categories].sort((a, b) => a.top3ShopRevenueRatio - b.top3ShopRevenueRatio)[0];
  points.push({
    tone: "neutral",
    lead: `Pasar paling terbuka: ${mostFragmented.categoryName}`,
    detail: `Top-3 shop cuma ${formatPct(mostFragmented.top3ShopRevenueRatio)} — fragmented, pemain baru masih bisa masuk.`,
  });

  return { title: "Kesimpulan produk & pasar", points };
}
