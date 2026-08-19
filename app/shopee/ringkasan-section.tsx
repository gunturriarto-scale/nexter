import { Alert, DayPoint, ExecutiveKpis, ParetoRow } from "@/lib/shopee/aggregate";
import { ShopeeAccountHealthDay } from "@/lib/shopee/types";
import { formatIdrCompact, formatNumber, formatPercent, formatRoas } from "@/lib/shopee/format";
import { Card, DeltaBadge, SeverityDot, alertCardClass } from "@/app/shopee/ui";
import { TrendChart } from "@/app/shopee/trend-chart";

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
                { key: "gmv", name: "GMV", color: "#f6a7bc", type: "bar", axis: "left" },
                { key: "orders", name: "Orders", color: "#f0466d", type: "line", axis: "right" },
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
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr>
                {["#", "Produk", "Revenue", "% Cumulative"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paretoTop10.slice(0, 10).map((row, i) => (
                <tr key={row.product.itemId} className="gfx-row-border">
                  <td className="whitespace-nowrap px-3 py-2 text-[#9d8a97]">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-[#342d32]">{row.product.itemName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(row.revenue)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-none bg-[#f7eef1]">
                        <div
                          className="h-full bg-gradient-to-r from-[#f0466d] to-[#8154b6]"
                          style={{ width: `${Math.min(row.cumulativePct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[#6b5a66]">{row.cumulativePct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
