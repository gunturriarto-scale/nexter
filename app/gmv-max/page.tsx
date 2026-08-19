import {
  MOCK_BRANDS,
  MOCK_CAMPAIGNS,
  MOCK_CREATIVES,
  MOCK_DAILY_METRICS,
  MOCK_LIVESTREAMS,
  MOCK_PRODUCTS,
} from "@/lib/gmv-max/mock-data";
import {
  buildAlerts,
  dailySeries,
  fatiguedCreativeIds,
  rollupBrands,
  rollupCampaigns,
  sumDaily,
} from "@/lib/gmv-max/aggregate";
import { formatCurrency, formatNumber, formatPercentDelta, formatRoi } from "@/lib/gmv-max/format";
import { RoiTrendChart } from "@/app/gmv-max/roi-trend-chart";
import { CampaignTable } from "@/app/gmv-max/campaign-table";
import { ProductTable } from "@/app/gmv-max/product-table";
import { CreativeGallery } from "@/app/gmv-max/creative-gallery";
import { LiveSection } from "@/app/gmv-max/live-section";
import { BudgetAutomationPanel } from "@/app/gmv-max/budget-panel";
import { Card, SeverityDot, alertCardClass } from "@/app/gmv-max/ui";

export const dynamic = "force-dynamic";

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 13 * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

function shiftRange(from: string, to: string) {
  const fromD = new Date(from);
  const toD = new Date(to);
  const days = Math.round((toD.getTime() - fromD.getTime()) / 86400000) + 1;
  const prevTo = new Date(fromD.getTime() - 86400000);
  const prevFrom = new Date(prevTo.getTime() - (days - 1) * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(prevFrom), to: iso(prevTo) };
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const positive = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
      {positive ? "▲" : "▼"} {Math.abs(pct).toFixed(0)}% vs periode sebelumnya
    </span>
  );
}

export default async function GmvMaxPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { from: defaultFrom, to: defaultTo } = defaultDateRange();
  const filter = {
    brand: params.brand || undefined,
    from: params.from || defaultFrom,
    to: params.to || defaultTo,
    promotionType:
      params.type === "PRODUCT_GMV_MAX" || params.type === "LIVE_GMV_MAX" ? params.type : undefined,
  } as const;
  const prevRange = shiftRange(filter.from, filter.to);

  const inScope = <T extends { brand: string }>(rows: T[]) =>
    filter.brand ? rows.filter((r) => r.brand === filter.brand) : rows;

  const campaigns = inScope(MOCK_CAMPAIGNS).filter(
    (c) => !filter.promotionType || c.promotionType === filter.promotionType
  );
  const campaignIds = new Set(campaigns.map((c) => c.campaignId));
  const products = inScope(MOCK_PRODUCTS).filter((p) => campaignIds.has(p.campaignId));
  const creatives = inScope(MOCK_CREATIVES).filter((c) => campaignIds.has(c.campaignId));
  const livestreams = inScope(MOCK_LIVESTREAMS).filter((l) => campaignIds.has(l.campaignId));

  const dailyInRange = MOCK_DAILY_METRICS.filter(
    (r) => campaignIds.has(r.campaignId) && r.day >= filter.from && r.day <= filter.to
  );
  const dailyPrevRange = MOCK_DAILY_METRICS.filter(
    (r) => campaignIds.has(r.campaignId) && r.day >= prevRange.from && r.day <= prevRange.to
  );

  const kpis = sumDaily(dailyInRange);
  const prevKpis = sumDaily(dailyPrevRange);
  const dayPoints = dailySeries(dailyInRange);
  const campaignRollups = rollupCampaigns(campaigns, dailyInRange);
  const brandRollups = rollupBrands(filter.brand ? [filter.brand] : MOCK_BRANDS, campaigns, dailyInRange);
  const fatigued = fatiguedCreativeIds(creatives);
  const alerts = buildAlerts(campaigns, creatives, livestreams, campaignRollups);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold text-[#8154b6] ring-1 ring-[#c4c2f2]">
        <span className="h-2 w-2 rounded-none bg-[#f0466d]" />
        Mockup mode — data dummy, belum tersambung Supabase/TikTok API
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#342d32]">
        GMV Max <span className="gfx-text-gradient">Command Center</span>
      </h1>
      <p className="mt-1 text-sm text-[#9d8a97]">
        Ringkasan harian buat performance marketing & leadership — cost, ROI vs target, kesehatan
        campaign, produk, creative, dan LIVE, dalam satu layar.
      </p>

      <form className="gfx-filter-bar mt-6 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Brand
          <select name="brand" defaultValue={filter.brand ?? ""} className="gfx-select mt-1">
            <option value="">Semua brand</option>
            {MOCK_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Tipe
          <select name="type" defaultValue={filter.promotionType ?? ""} className="gfx-select mt-1">
            <option value="">Product + LIVE</option>
            <option value="PRODUCT_GMV_MAX">Product GMV Max</option>
            <option value="LIVE_GMV_MAX">LIVE GMV Max</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Dari
          <input type="date" name="from" defaultValue={filter.from} className="gfx-input mt-1" />
        </label>
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Sampai
          <input type="date" name="to" defaultValue={filter.to} className="gfx-input mt-1" />
        </label>
        <button type="submit" className="gfx-btn">
          Terapkan
        </button>
      </form>

      {/* Executive summary */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Cost", value: formatCurrency(kpis.cost), cur: kpis.cost, prev: prevKpis.cost },
          { label: "Net Cost", value: formatCurrency(kpis.netCost), cur: kpis.netCost, prev: prevKpis.netCost },
          { label: "Gross Revenue", value: formatCurrency(kpis.grossRevenue), cur: kpis.grossRevenue, prev: prevKpis.grossRevenue },
          { label: "ROI", value: formatRoi(kpis.roi), cur: kpis.roi, prev: prevKpis.roi },
          { label: "Orders", value: formatNumber(kpis.orders), cur: kpis.orders, prev: prevKpis.orders },
          { label: "Cost / Order", value: formatCurrency(kpis.costPerOrder), cur: kpis.costPerOrder, prev: prevKpis.costPerOrder },
        ].map((k) => (
          <div key={k.label} className="gfx-kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="mt-1">
              <DeltaBadge current={k.cur} previous={k.prev} />
            </div>
          </div>
        ))}
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mt-8">
          <h2 className="gfx-section-title">Yang perlu diperhatikan hari ini ({alerts.length})</h2>
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

      {/* Trend */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Tren harian</h2>
        <div className="mt-3">
          <Card>
            <RoiTrendChart data={dayPoints} />
          </Card>
        </div>
      </section>

      {/* Brand rollup */}
      {!filter.brand && (
        <section className="mt-8">
          <h2 className="gfx-section-title">Ringkasan per brand</h2>
          <div className="gfx-table-wrap mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr>
                  {["Brand", "Campaign aktif", "Cost", "Revenue", "Orders", "ROI"].map((h) => (
                    <th key={h} className="gfx-th px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandRollups.map((b) => (
                  <tr key={b.brand} className="gfx-row-border">
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">{b.brand}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                      {b.activeCampaignCount}/{b.campaignCount}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCurrency(b.cost)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCurrency(b.grossRevenue)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(b.orders)}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#f0466d]">{formatRoi(b.roi)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Campaign health */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Kesehatan campaign</h2>
        <p className="gfx-section-desc mt-1">
          &quot;vs target&quot; membandingkan ROI aktual terhadap target ROI yang dikonfigurasi (roas_bid) — kosong
          untuk campaign mode Max Delivery karena tidak punya target ROI.
        </p>
        <div className="mt-3">
          <CampaignTable rollups={campaignRollups} />
        </div>
      </section>

      {/* Products */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Performa produk</h2>
        <div className="mt-3">
          <ProductTable products={products} />
        </div>
      </section>

      {/* Creative gallery */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Creative library</h2>
        <p className="gfx-section-desc mt-1">
          Diurutkan by spend. Status langsung dari TikTok (Delivering/Learning/Rejected/dst) — bukan cuma
          angka performa.
        </p>
        <div className="mt-3">
          <CreativeGallery creatives={creatives} fatiguedIds={fatigued} />
        </div>
      </section>

      {/* LIVE */}
      <section className="mt-8">
        <h2 className="gfx-section-title">LIVE GMV Max</h2>
        <div className="mt-3">
          <LiveSection livestreams={livestreams} />
        </div>
      </section>

      {/* Budget & automation */}
      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Budget otomatis & promotion days</h2>
        <div className="mt-3">
          <BudgetAutomationPanel campaigns={campaigns} />
        </div>
      </section>
    </main>
  );
}
