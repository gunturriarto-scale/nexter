"use client";

import { Alert, DayPoint, ExecutiveKpis, ParetoRow } from "@/lib/shopee/aggregate";
import { ShopeeAccountHealthDay } from "@/lib/shopee/types";
import { formatIdrCompact, formatNumber, formatPercent, formatRoas } from "@/lib/shopee/format";
import { Card, DeltaBadge, SeverityDot, alertCardClass } from "@/app/shopee/ui";
import { TrendChart } from "@/app/shopee/trend-chart";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const PARETO_COLUMNS: DataTableColumn<ParetoRow>[] = [
  { key: "idx", header: "#", cellClassName: "whitespace-nowrap text-[#7A8AA3]", cell: (_row, index) => index + 1 },
  { key: "name", header: "Produk", cellClassName: "font-medium text-[#14213D]", sortAccessor: (row) => row.product.itemName, cell: (row) => row.product.itemName },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (row) => row.revenue, cell: (row) => formatIdrCompact(row.revenue) },
  {
    key: "cumulative",
    header: "% Cumulative",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (row) => row.cumulativePct,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-none bg-[#EDF3F8]">
          <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#0891B2]" style={{ width: `${Math.min(row.cumulativePct, 100)}%` }} />
        </div>
        <span className="text-[#4B5D78]">{row.cumulativePct.toFixed(0)}%</span>
      </div>
    ),
  },
];

export function RingkasanSection({
  kpis,
  prevKpis,
  alerts,
  trend,
  paretoTop10,
  adsRoas,
  health,
}: {
  kpis: ExecutiveKpis;
  prevKpis: ExecutiveKpis;
  alerts: Alert[];
  trend: DayPoint[];
  paretoTop10: ParetoRow[];
  adsRoas: number;
  health: ShopeeAccountHealthDay;
}) {
  const tiles = [
    { label: "GMV Bersih", value: formatIdrCompact(kpis.gmv), cur: kpis.gmv, prev: prevKpis.gmv },
    { label: "Orders Selesai", value: formatNumber(kpis.ordersCompleted), cur: kpis.ordersCompleted, prev: prevKpis.ordersCompleted },
    { label: "AOV", value: formatIdrCompact(kpis.aov), cur: kpis.aov, prev: prevKpis.aov },
    { label: "Return Rate", value: formatPercent(kpis.returnRate), cur: kpis.returnRate, prev: prevKpis.returnRate },
    { label: "Ads ROAS (AMS)", value: formatRoas(adsRoas), cur: adsRoas, prev: adsRoas },
    { label: "Escrow Pending", value: formatIdrCompact(kpis.escrowPending), cur: kpis.escrowPending, prev: prevKpis.escrowPending },
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="gfx-kpi">
            <div className="kpi-label">{t.label}</div>
            <div className="kpi-value">{t.value}</div>
            <div className="mt-1">
              <DeltaBadge current={t.cur} previous={t.prev} />
            </div>
          </div>
        ))}
      </section>

      {alerts.length > 0 && (
        <section className="mt-8">
          <h2 className="gfx-section-title">Yang perlu diperhatikan ({alerts.length})</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {alerts.map((a, i) => (
              <div key={i} className={alertCardClass(a.severity)}>
                <div className="flex items-center gap-2 font-medium">
                  <SeverityDot severity={a.severity} />
                  {a.title}
                </div>
                <p className="mt-1 opacity-90">{a.detail}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="gfx-section-title">Tren GMV & Orders</h2>
        <div className="mt-3">
          <Card>
            <TrendChart
              data={trend}
              series={[
                { key: "gmv", name: "GMV", color: "#93C5FD", type: "bar", axis: "left" },
                { key: "orders", name: "Orders", color: "#2563EB", type: "line", axis: "right" },
              ]}
            />
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Top 10 SKU — Kontribusi Revenue</h2>
        <p className="gfx-section-desc mt-1">
          Pareto view — kalau top 2-3 SKU udah nyumbang &gt;50% cumulative, itu risiko konsentrasi. Detail
          lengkap ada di tab Produk.
        </p>
        <div className="mt-3">
          <DataTable
            columns={PARETO_COLUMNS}
            rows={paretoTop10.slice(0, 10)}
            rowKey={(row) => row.product.itemId}
            minWidth={560}
            emptyMessage="Belum ada data."
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Kesehatan Toko</h2>
        <p className="gfx-section-desc mt-1">
          Ringkasan Account Health — detail penuh (penalty history, listing issues) menyusul di Wave 4
          begitu <code>get_shop_performance</code> tersambung.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="gfx-kpi">
            <div className="kpi-label">Penalty Points</div>
            <div className="kpi-value">{health.penaltyPoints}</div>
          </div>
          <div className="gfx-kpi">
            <div className="kpi-label">Late Order Rate</div>
            <div className="kpi-value">{formatPercent(health.lateOrderRate)}</div>
          </div>
          <div className="gfx-kpi">
            <div className="kpi-label">Listing Issues</div>
            <div className="kpi-value">{health.listingViolationCount}</div>
          </div>
          <div className="gfx-kpi">
            <div className="kpi-label">Response Rate</div>
            <div className="kpi-value">{formatPercent(health.responseRate)}</div>
          </div>
        </div>
      </section>
    </>
  );
}
