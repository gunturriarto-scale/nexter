import { MOCK_BRANDS, MOCK_CANCELLATIONS } from "@/lib/loss/mock-data";
import { buildLossAlerts, groupByReason, sumLoss } from "@/lib/loss/aggregate";
import { formatCurrency, formatNumber } from "@/lib/loss/format";
import { CancelTable } from "@/app/loss/cancel-table";
import { ReasonBreakdownTable } from "@/app/loss/reason-breakdown-table";
import { SeverityDot, alertCardClass } from "@/app/loss/ui";

export const dynamic = "force-dynamic";

export default function LossAnalysisPage() {
  const rows = MOCK_CANCELLATIONS;
  const totals = sumLoss(rows);
  const reasons = groupByReason(rows);
  const alerts = buildLossAlerts(rows);

  const kpis = [
    { label: "Total cancellations", value: formatNumber(totals.totalCancellations) },
    { label: "Total refund", value: formatCurrency(totals.totalRefund) },
    { label: "Pending cancel", value: formatNumber(totals.pendingCount) },
    { label: "Pending refund", value: formatCurrency(totals.pendingRefund) },
    { label: "Perlu action seller", value: formatNumber(totals.pendingActionCount) },
    { label: "Urgent (<24j)", value: formatNumber(totals.urgentActionCount) },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-4 inline-flex items-center gap-2 rounded-none bg-white px-3 py-1 text-xs font-semibold text-[#0891B2] ring-1 ring-[#BFDBFE]">
        <span className="h-2 w-2 rounded-none bg-[#2563EB]" />
        Mockup mode — data dummy, struktur field = TikTok Shop Seller API search-cancellations
      </div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#14213D]">
        Loss Analysis <span className="gfx-text-gradient">— Cancellations</span>
      </h1>
      <p className="mt-1 text-sm text-[#7A8AA3]">
        Pantau order cancellation & refund — revenue bocor, alasan cancel terbanyak, dan action yang
        perlu diambil seller sebelum deadline.
      </p>

      {/* Filter bar (mock — mirrors the real query filters) */}
      <form className="gfx-filter-bar mt-6 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Brand
          <select className="gfx-select mt-1">
            {MOCK_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Cancel status
          <select className="gfx-select mt-1">
            <option>Semua status</option>
            <option>Pending</option>
            <option>Disetujui</option>
            <option>Selesai</option>
            <option>Dibatalkan</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Dari
          <input type="date" className="gfx-input mt-1" defaultValue="2026-08-01" />
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Sampai
          <input type="date" className="gfx-input mt-1" defaultValue="2026-08-12" />
        </label>
        <button type="submit" className="gfx-btn">
          Terapkan
        </button>
      </form>

      {/* KPI row */}
      <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
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
          <h2 className="gfx-section-title">Action yang perlu diambil ({alerts.length})</h2>
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

      {/* Reason breakdown */}
      <section className="mt-8">
        <h2 className="gfx-section-title">Alasan cancel terbanyak</h2>
        <p className="gfx-section-desc mt-1">
          Group by <code className="rounded-none bg-[#EFF6FF] px-1 text-[#0891B2]">cancel_reason</code> —
          lihat akar masalah cancellation (product? shipping? buyer?).
        </p>
        <div className="mt-3">
          <ReasonBreakdownTable reasons={reasons} totalRefund={totals.totalRefund} />
        </div>
      </section>

      {/* Cancellation table */}
      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Daftar cancellations</h2>
        <p className="gfx-section-desc mt-1">
          Diurutkan by waktu dibuat (terbaru dulu). Deadline action muncul untuk buyer-cancel yang
          masih nunggu respond seller.
        </p>
        <div className="mt-3">
          <CancelTable rows={rows} />
        </div>
      </section>
    </main>
  );
}
