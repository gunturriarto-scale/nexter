import {
  MOCK_AFFILIATE_COLLABORATIONS,
  MOCK_AFFILIATE_CREATORS,
  MOCK_AFFILIATE_ORDERS,
  MOCK_AFFILIATE_SAMPLES,
  MOCK_AFFILIATE_VIDEOS,
  MOCK_BRANDS,
  MOCK_CREATORS,
  MOCK_DISCOVERY,
  MOCK_TRACKED_POSTS,
  MOCK_TRENDING_HASHTAGS,
  MOCK_TRENDING_SOUNDS,
} from "@/lib/kol/mock-data";
import { buildKolAlerts, buildLeaderboard, buildProductPerformance, buildTierPerformance, engagementRate } from "@/lib/kol/aggregate";
import { formatCompact, formatNumber } from "@/lib/kol/format";
import { classifyTier, KolTier, TIER_LABEL, TIER_ORDER } from "@/lib/kol/tier";
import { SeverityDot, alertCardClass } from "@/app/kol/ui";
import { Leaderboard } from "@/app/kol/leaderboard";
import { TrackedPosts } from "@/app/kol/tracked-posts";
import { DiscoveryTable } from "@/app/kol/discovery-table";
import { TierPerformanceTable } from "@/app/kol/tier-performance";
import { ProductPerformanceTable } from "@/app/kol/product-performance";
import { TrendingHashtagsTable, TrendingSoundsTable } from "@/app/kol/trends";
import { AffiliateOverview } from "@/app/kol/affiliate-overview";

export const dynamic = "force-dynamic";

export default async function CreatorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const brand = params.brand || undefined;
  const tier = TIER_ORDER.includes(params.tier as KolTier) ? (params.tier as KolTier) : undefined;
  const product = params.product || undefined;

  const inScope = <T extends { brand: string }>(rows: T[]) => (brand ? rows.filter((r) => r.brand === brand) : rows);

  const productOptions = Array.from(
    new Set(
      MOCK_CREATORS.filter((c) => (!brand || c.brand === brand) && c.productFocus !== "Multi-produk").map(
        (c) => c.productFocus
      )
    )
  ).sort();

  const creators = inScope(MOCK_CREATORS).filter(
    (c) => (!tier || classifyTier(c.followerCount) === tier) && (!product || c.productFocus === product)
  );
  const creatorIds = new Set(creators.map((c) => c.creatorId));
  const posts = inScope(MOCK_TRACKED_POSTS).filter((p) => creatorIds.has(p.creatorId));
  const discovery = inScope(MOCK_DISCOVERY).filter(
    (c) => (!tier || classifyTier(c.followerCount) === tier) && (!product || c.productFocus === product)
  );
  const trendingHashtags = inScope(MOCK_TRENDING_HASHTAGS);
  const trendingSounds = inScope(MOCK_TRENDING_SOUNDS);

  const leaderboard = buildLeaderboard(creators, posts);
  const tierPerformance = buildTierPerformance(leaderboard);
  const productPerformance = buildProductPerformance(leaderboard);
  const alerts = buildKolAlerts(creators, posts);

  const okPosts = posts.filter((p) => p.syncStatus === "ok");
  const totalViews = okPosts.reduce((a, p) => a + p.views, 0);
  const avgEngagement = okPosts.length > 0 ? okPosts.reduce((a, p) => a + engagementRate(p), 0) / okPosts.length : 0;
  const paidPosts = okPosts.filter((p) => p.linkedGmvMax);
  const totalPaidCost = paidPosts.reduce((a, p) => a + (p.linkedGmvMax?.cost ?? 0), 0);
  const totalPaidOrders = paidPosts.reduce((a, p) => a + (p.linkedGmvMax?.orders ?? 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold text-[#0891B2] ring-1 ring-[#BFDBFE]">
        <span className="h-2 w-2 rounded-none bg-[#2563EB]" />
        Mockup mode — official TikTok Shop OpenAPI field map
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#14213D]">
        Creator <span className="gfx-text-gradient">Command Center</span>
      </h1>
      <p className="mt-1 text-sm text-[#7A8AA3]">
        Affiliate GMV, creator performance, collaboration, sample, commission, dan content attribution.
      </p>

      <form className="gfx-filter-bar mt-6 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Brand
          <select name="brand" defaultValue={brand ?? ""} className="gfx-select mt-1">
            <option value="">Semua brand</option>
            {MOCK_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Tier Creator
          <select name="tier" defaultValue={tier ?? ""} className="gfx-select mt-1">
            <option value="">Semua tier</option>
            {TIER_ORDER.map((t) => (
              <option key={t} value={t}>
                {TIER_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Fokus produk
          <select name="product" defaultValue={product ?? ""} className="gfx-select mt-1 max-w-[260px]">
            <option value="">Semua produk</option>
            {productOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="gfx-btn">
          Terapkan
        </button>
      </form>

      <AffiliateOverview
        creators={MOCK_AFFILIATE_CREATORS}
        videos={MOCK_AFFILIATE_VIDEOS}
        orders={MOCK_AFFILIATE_ORDERS}
        samples={MOCK_AFFILIATE_SAMPLES}
        collaborations={MOCK_AFFILIATE_COLLABORATIONS}
      />

      <section className="mt-12 border-t border-[#e8dce2] pt-8">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0891B2]">Enrichment layer</div>
        <h2 className="gfx-section-title mt-1">Social signals + GMV Max overlay</h2>
        <p className="gfx-section-desc mt-1">Data pendamping dari tracked posts, discovery source, dan paid creative matching.</p>
      </section>

      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Creator aktif", value: formatNumber(creators.length) },
          { label: "Tracked posts", value: formatNumber(posts.length) },
          { label: "Total views", value: formatCompact(totalViews) },
          { label: "Avg. engagement", value: `${avgEngagement.toFixed(1)}%` },
          { label: "Paid (GMV Max) cost", value: formatCompact(totalPaidCost) },
          { label: "Paid orders", value: formatNumber(totalPaidOrders) },
        ].map((k) => (
          <div key={k.label} className="gfx-kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </section>

      {alerts.length > 0 && (
        <section className="mt-8">
          <h2 className="gfx-section-title">Yang perlu diperhatikan ({alerts.length})</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {alerts.slice(0, 10).map((a, i) => (
              <div key={i} className={alertCardClass(a.severity)}>
                <div className="flex items-center gap-2 font-medium">
                  <SeverityDot severity={a.severity} />
                  {a.title}
                  <span className="ml-auto text-[11px] font-normal opacity-70">{a.brand}</span>
                </div>
                <p className="mt-1 opacity-90">{a.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="gfx-section-title">Performa per kategori Creator</h2>
        <p className="gfx-section-desc mt-1">
          Klasifikasi Nano/Micro/Mid/Macro/Mega Creator berdasarkan jumlah follower — bandingkan tier mana
          yang paling efisien (views, engagement) buat brand ini.
        </p>
        <div className="mt-3">
          <TierPerformanceTable rows={tierPerformance} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Performa per produk / SKU</h2>
        <p className="gfx-section-desc mt-1">
          Creator dikelompokkan berdasarkan produk yang jadi fokus kolaborasinya — lihat SKU mana yang
          paling banyak didorong lewat creator, dan seberapa efektif.
        </p>
        <div className="mt-3">
          <ProductPerformanceTable rows={productPerformance} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Leaderboard Creator</h2>
        <p className="gfx-section-desc mt-1">
          Diurutkan by total views. Kolom &quot;Paid (GMV Max)&quot; cuma keisi kalau ada video creator ini yang
          juga jalan sebagai creative berbayar.
        </p>
        <div className="mt-3">
          <Leaderboard rows={leaderboard} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Tracked post links</h2>
        <p className="gfx-section-desc mt-1">
          Database link post yang dikumpulkan tim Creator sendiri, performa di-refresh berkala lewat
          ScrapeCreators.
        </p>
        <div className="mt-3">
          <TrackedPosts posts={posts} creators={creators} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Tren hashtag & sound naik daun</h2>
        <p className="gfx-section-desc mt-1">
          Dari ScrapeCreators (Search by Hashtag, Get Song Details) — sinyal buat nentuin arah konten &amp;
          kandidat Creator berikutnya. 🔥 = growth ≥40% minggu ke minggu.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#7A8AA3]">Hashtag</h3>
            <TrendingHashtagsTable hashtags={trendingHashtags} />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-[#7A8AA3]">Sound</h3>
            <TrendingSoundsTable sounds={trendingSounds} />
          </div>
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Kandidat Creator baru</h2>
        <p className="gfx-section-desc mt-1">
          Kolom &quot;Sumber tren&quot; nunjukin hashtag/sound mana yang munculin kandidat ini.
        </p>
        <div className="mt-3">
          <DiscoveryTable candidates={discovery} />
        </div>
      </section>
    </main>
  );
}
