import {
  MOCK_BRANDS,
  MOCK_DAILY_LIVE_METRICS,
  MOCK_LIVE_CAMPAIGNS,
  MOCK_LIVE_SESSIONS,
} from "@/lib/live-gmv-max/mock-data";
import {
  buildLiveAlerts,
  liveDailySeries,
  sumLiveRows,
} from "@/lib/live-gmv-max/aggregate";
import {
  formatCompact,
  formatCurrency,
  formatNumber,
  formatRoi,
} from "@/lib/live-gmv-max/format";
import { LiveGrid } from "@/app/live-gmv-max/live-grid";
import { LiveTable } from "@/app/live-gmv-max/live-table";
import { LiveTrendChart } from "@/app/live-gmv-max/live-trend-chart";
import { Card, SeverityDot, alertCardClass } from "@/app/live-gmv-max/ui";

export const dynamic = "force-dynamic";

export default function LiveGmvMaxPage() {
  const sessions = MOCK_LIVE_SESSIONS;
  const campaigns = MOCK_LIVE_CAMPAIGNS;
  const dailyRows = MOCK_DAILY_LIVE_METRICS;

  const totals = sumLiveRows(dailyRows);
  const dayPoints = liveDailySeries(dailyRows);
  const activeCount = sessions.filter((s) => s.liveStatus === "ONGOING").length;

  // target ROI — use the first CUSTOM (target-ROI) campaign for the alert heuristic
  const targetCampaign = campaigns.find((c) => c.bidType === "CUSTOM" && c.roasBid > 0);
  const targetRoi = targetCampaign ? targetCampaign.roasBid : null;
  const alerts = buildLiveAlerts(sessions, campaigns, totals, targetRoi);

  const kpis = [
    { label: "LIVE aktif", value: formatNumber(activeCount) },
    { label: "Total cost", value: formatCurrency(totals.cost) },
    { label: "Net cost", value: formatCurrency(totals.netCost) },
    { label: "Gross revenue", value: formatCurrency(totals.grossRevenue) },
    { label: "ROI", value: formatRoi(totals.roi) },
    { label: "Orders", value: formatNumber(totals.orders) },
    { label: "LIVE views", value: formatCompact(totals.liveViews) },
    { label: "10s views", value: formatCompact(totals.views10s) },
    { label: "Follows baru", value: formatNumber(totals.liveFollows) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold text-[#8154b6] ring-1 ring-[#c4c2f2]">
        <span className="h-2 w-2 rounded-none bg-[#f0466d]" />
        Mockup mode — data dummy, struktur field = TikTok Business API LIVE GMV Max
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#342d32]">
        LIVE GMV Max <span className="gfx-text-gradient">Command Center</span>
      </h1>
      <p className="mt-1 text-sm text-[#9d8a97]">
        Pantau semua livestream shopping ads campaign — cost, ROI vs target, live views, follows,
        dan performa tiap live session dalam satu layar.
      </p>

      {/* Filter bar (mock — mirrors the same fields as the real report filter) */}
      <form className="gfx-filter-bar mt-6 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Brand
          <select className="gfx-select mt-1">
            {MOCK_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Status live
          <select className="gfx-select mt-1">
            <option>Semua status</option>
            <option>ONGOING</option>
            <option>END</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Dari
          <input type="date" className="gfx-input mt-1" defaultValue="2026-07-30" />
        </label>
        <label className="flex flex-col text-sm text-[#6b5a66]">
          Sampai
          <input type="date" className="gfx-input mt-1" defaultValue="2026-08-12" />
        </label>
        <button type="submit" className="gfx-btn">
          Terapkan
        </button>
      </form>

      {/* KPI row */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="gfx-kpi">
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mt-8">
          <h2 className="gfx-section-title">Yang perlu diperhatikan ({alerts.length})</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {alerts.map((a, i) => (
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

      {/* Live sessions grid */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Live sessions</h2>
        <p className="gfx-section-desc mt-1">
          LIVE yang sedang berlangsung tampil paling atas. Data per room_id dari{" "}
          <code className="rounded-none bg-[#fdf0f3] px-1 text-[#8154b6]">/gmv_max/report/get/</code>.
        </p>
        <div className="mt-3">
          <LiveGrid sessions={sessions} />
        </div>
      </section>

      {/* Trend */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Tren harian (cost vs revenue vs ROI)</h2>
        <div className="mt-3">
          <Card>
            <LiveTrendChart data={dayPoints} />
          </Card>
        </div>
      </section>

      {/* Detail table */}
      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Detail per live session</h2>
        <p className="gfx-section-desc mt-1">
          Diurutkan by cost. Status, mode bidding, dan ROI protection di-join dari campaign list.
        </p>
        <div className="mt-3">
          <LiveTable sessions={sessions} campaigns={campaigns} />
        </div>
      </section>
    </main>
  );
}
