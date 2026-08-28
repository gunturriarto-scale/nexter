import Link from "next/link";
import { MOCK_SHOPS, MOCK_PRODUCTS, MOCK_REGION, MOCK_CATEGORIES } from "@/lib/market-intel/mock-data";
import { MOCK_CREATORS, MOCK_VIDEOS, MOCK_LIVESTREAMS } from "@/lib/market-intel/benchmark-mock-data";
import { buildInsights, rankShops, buildMarketSize, buildWhitespace, buildBreakout } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatNumber, formatPct, formatGrowthPct } from "@/lib/market-intel/format";
import { BrandRankTable } from "@/app/market-intel/brand-rank-table";
import { ProductRankTable } from "@/app/market-intel/product-rank-table";
import { RevenueTrendChart } from "@/app/market-intel/revenue-trend-chart";
import { EfficiencyMatrix } from "@/app/market-intel/efficiency-matrix";
import { GrowthSizeQuadrant } from "@/app/market-intel/growth-size-quadrant";
import { ChannelMix } from "@/app/market-intel/channel-mix";
import { HeroSkuRisk } from "@/app/market-intel/hero-sku-risk";
import { MarketSizeBanner } from "@/app/market-intel/market-size-banner";
import { WhitespaceTable } from "@/app/market-intel/whitespace-table";
import { PricePositioningMap } from "@/app/market-intel/price-positioning-map";
import { BreakoutRadar } from "@/app/market-intel/breakout-radar";
import { CategoryOverview } from "@/app/market-intel/category-overview";
import { CreatorBenchmark } from "@/app/market-intel/creator-benchmark";
import { VideoRoasBenchmark } from "@/app/market-intel/video-roas-benchmark";
import { LivestreamBenchmark } from "@/app/market-intel/livestream-benchmark";
import { Card, SeverityDot, insightCardClass } from "@/app/market-intel/ui";
import { TabSummaryCard } from "@/app/market-intel/tab-summary-card";
import {
  summarizeRingkasan,
  summarizeDeepDive,
  summarizeKonten,
  summarizeProduk,
} from "@/lib/market-intel/summary";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "ringkasan", label: "Ringkasan", icon: "📊" },
  { key: "deep-dive", label: "Deep Dive", icon: "🔍" },
  { key: "konten", label: "Konten & Kreator", icon: "🎬" },
  { key: "produk", label: "Produk & Pasar", icon: "🛍️" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function MarketIntelPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const tabParam = params.tab ?? "ringkasan";
  const activeTab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "ringkasan";

  const shops = MOCK_SHOPS;
  const products = MOCK_PRODUCTS;
  const categories = MOCK_CATEGORIES;
  const creators = MOCK_CREATORS;
  const videos = MOCK_VIDEOS;
  const lives = MOCK_LIVESTREAMS;

  const ranked = rankShops(shops);
  const glow = ranked.find((s) => s.shopName === "Glow FX");
  const insights = buildInsights(shops);
  const marketSize = buildMarketSize(categories, shops);
  const whitespace = buildWhitespace(categories, products, shops);
  const breakout = buildBreakout(products);

  const summaryRingkasan = summarizeRingkasan(shops, marketSize);
  const summaryDeepDive = summarizeDeepDive(shops);
  const summaryKonten = summarizeKonten(videos, lives, creators);
  const summaryProduk = summarizeProduk(products, categories, shops);

  const kpis = [
    { label: "Rank Glow FX", value: glow ? `#${glow.rank}` : "—" },
    { label: "Revenue Glow FX", value: glow ? formatIdrCompact(glow.revenue) : "—" },
    { label: "Growth", value: glow ? formatGrowthPct(glow.revenueGrowthRate) : "—" },
    { label: "Share (brand tracked)", value: glow ? formatPct(glow.marketShare) : "—" },
    { label: "Kreator aktif", value: glow ? formatNumber(glow.creatorNumber) : "—" },
    { label: "Brand terbandingkan", value: formatNumber(shops.length) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Header */}
      <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold text-[#0891B2] ring-1 ring-[#BFDBFE]">
        <span className="h-2 w-2 rounded-none bg-[#2563EB]" />
        Mockup mode — data dummy, struktur field = KaloData Open Center (region ID, IDR)
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#14213D]">
        Market Intelligence <span className="gfx-text-gradient">— Skincare ID</span>
      </h1>
      <p className="mt-1 text-sm text-[#7A8AA3]">
        Glow FX vs kompetitor skincare Indonesia — revenue, growth, konten, kreator, dan produk dalam
        satu dashboard. POV: brand, product development, dan CEO.
      </p>

      {/* Filter bar (mock) */}
      <form className="gfx-filter-bar mt-6 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Region
          <select className="gfx-select mt-1">
            <option>{MOCK_REGION} — Indonesia</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Kategori
          <select className="gfx-select mt-1">
            <option>Beauty — Skincare</option>
            <option>Beauty — Semua</option>
            <option>Personal Care</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Periode
          <select className="gfx-select mt-1">
            <option>30 hari terakhir</option>
            <option>7 hari terakhir</option>
            <option>90 hari terakhir</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Tipe shop
          <select className="gfx-select mt-1">
            <option>Semua</option>
            <option>Brand store</option>
            <option>Retailer</option>
          </select>
        </label>
        <button type="submit" className="gfx-btn">
          Terapkan
        </button>
      </form>

      {/* Tab bar */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-[#DDE6F0]">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/market-intel?tab=${t.key}`}
              className={`-mb-px rounded-none px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "border border-b-0 border-[#DDE6F0] bg-white text-[#2563EB]"
                  : "text-[#7A8AA3] hover:bg-[#EFF6FF] hover:text-[#14213D]"
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* ============ TAB: RINGKASAN ============ */}
      {activeTab === "ringkasan" && (
        <>
          <section className="mt-6">
            <MarketSizeBanner view={marketSize} />
          </section>

          <section className="mt-4">
            <TabSummaryCard summary={summaryRingkasan} />
          </section>

          <section className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {kpis.map((k) => (
              <div key={k.label} className="gfx-kpi">
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value">{k.value}</div>
              </div>
            ))}
          </section>

          {insights.length > 0 && (
            <section className="mt-6">
              <h2 className="gfx-section-title">Insight buat decision ({insights.length})</h2>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {insights.map((ins, i) => (
                  <div key={i} className={insightCardClass(ins.severity)}>
                    <div className="flex items-center gap-2 font-medium">
                      <SeverityDot severity={ins.severity} />
                      {ins.title}
                    </div>
                    <p className="mt-1 opacity-90">{ins.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-6">
            <h2 className="gfx-section-title">Tren revenue per brand (14 hari)</h2>
            <div className="mt-3">
              <Card>
                <RevenueTrendChart shops={shops} />
              </Card>
            </div>
          </section>

          <section className="mt-6 mb-4">
            <h2 className="gfx-section-title">Ranking brand skincare ID</h2>
            <p className="gfx-section-desc mt-1">
              Glow FX di-highlight. Revenue mix nunjukin porsi affiliate vs self-operated vs mall.
            </p>
            <div className="mt-3">
              <BrandRankTable shops={shops} />
            </div>
          </section>
        </>
      )}

      {/* ============ TAB: DEEP DIVE ============ */}
      {activeTab === "deep-dive" && (
        <>
          <section className="mt-6">
            <TabSummaryCard summary={summaryDeepDive} />
          </section>

          <section className="mt-6">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-[#14213D]">
              Glow FX vs Everybody <span className="gfx-text-gradient">— 8 lensa komparasi</span>
            </h2>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">1. Efisiensi per unit channel</h3>
            <div className="mt-3">
              <EfficiencyMatrix shops={shops} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">2. Momentum: growth vs size</h3>
            <div className="mt-3">
              <Card>
                <GrowthSizeQuadrant shops={shops} />
              </Card>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">3. Struktur channel (affiliate vs self vs mall)</h3>
            <div className="mt-3">
              <Card>
                <ChannelMix shops={shops} />
              </Card>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">4. Risiko konsentrasi hero SKU</h3>
            <div className="mt-3">
              <HeroSkuRisk shops={shops} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">5. Posisi harga di pasar</h3>
            <div className="mt-3">
              <Card>
                <PricePositioningMap shops={shops} />
              </Card>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">6. Whitespace produk (kategori belum digarap)</h3>
            <div className="mt-3">
              <WhitespaceTable cells={whitespace} />
            </div>
          </section>

          <section className="mt-6">
            <h3 className="gfx-section-title">7. Breakout radar (produk naik daun)</h3>
            <div className="mt-3">
              <BreakoutRadar rows={breakout} />
            </div>
          </section>

          <section className="mt-6 mb-4">
            <h3 className="gfx-section-title">8. Struktur pasar per kategori</h3>
            <div className="mt-3">
              <CategoryOverview categories={categories} />
            </div>
          </section>
        </>
      )}

      {/* ============ TAB: KONTEN & KREATOR ============ */}
      {activeTab === "konten" && (
        <>
          <section className="mt-6">
            <TabSummaryCard summary={summaryKonten} />
          </section>

          <section className="mt-6">
            <h2 className="gfx-section-title">Benchmark video iklan (Ads ROAS)</h2>
            <p className="gfx-section-desc mt-1">
              Konten iklan tiap brand — ROAS, GPM, views. Lihat konten mana yang paling efisien nge-drive
              revenue, dan benchmark konten Glow FX vs kompetitor.
            </p>
            <div className="mt-3">
              <VideoRoasBenchmark videos={videos} />
            </div>
          </section>

          <section className="mt-6">
            <h2 className="gfx-section-title">Benchmark livestream</h2>
            <p className="gfx-section-desc mt-1">
              Live session tiap brand — revenue, viewers, GPM, durasi, jumlah produk. Strategi live
              kompetitor kebuka di sini.
            </p>
            <div className="mt-3">
              <LivestreamBenchmark lives={lives} />
            </div>
          </section>

          <section className="mt-6 mb-4">
            <h2 className="gfx-section-title">Benchmark kreator</h2>
            <p className="gfx-section-desc mt-1">
              Kreator top per brand — GMV, growth, follower, engagement, tipe (independent vs brand-owned).
              Buat lihat siapa yang nge-drive revenue kompetitor.
            </p>
            <div className="mt-3">
              <CreatorBenchmark creators={creators} />
            </div>
          </section>
        </>
      )}

      {/* ============ TAB: PRODUK & PASAR ============ */}
      {activeTab === "produk" && (
        <>
          <section className="mt-6">
            <TabSummaryCard summary={summaryProduk} />
          </section>

          <section className="mt-6">
            <h2 className="gfx-section-title">Produk terlaris per brand</h2>
            <p className="gfx-section-desc mt-1">
              Hero SKU tiap brand. Komisi + video/live revenue buat lihat mana yang di-drive lewat konten.
            </p>
            <div className="mt-3">
              <ProductRankTable products={products} />
            </div>
          </section>

          <section className="mt-6">
            <h2 className="gfx-section-title">Whitespace produk</h2>
            <p className="gfx-section-desc mt-1">
              Kategori dengan market size + growth tinggi tapi Glow FX belum hadir = peluang ekspansi
              product development.
            </p>
            <div className="mt-3">
              <WhitespaceTable cells={whitespace} />
            </div>
          </section>

          <section className="mt-6 mb-4">
            <h2 className="gfx-section-title">Struktur pasar per kategori</h2>
            <p className="gfx-section-desc mt-1">
              Market size + share video/live + konsentrasi top-3 per sub-kategori.
            </p>
            <div className="mt-3">
              <CategoryOverview categories={categories} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
