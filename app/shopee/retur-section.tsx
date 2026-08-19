import { ReturnKpis, ReturnReasonRow, ReturnTrendPoint, TopReturnedProductRow } from "@/lib/shopee/aggregate";
import { ShopeeReturn } from "@/lib/shopee/types";
import { formatDate, formatIdrCompact, formatNumber, formatPercent } from "@/lib/shopee/format";
import { Card, ReturnStatusChip, SeverityDot } from "@/app/shopee/ui";
import { ReturnReasonDonut } from "@/app/shopee/return-reason-donut";
import { TrendChart } from "@/app/shopee/trend-chart";

export function ReturSection({
  kpis,
  reasons,
  trend,
  returns,
  topReturned,
}: {
  kpis: ReturnKpis;
  reasons: ReturnReasonRow[];
  trend: ReturnTrendPoint[];
  returns: ShopeeReturn[];
  topReturned: TopReturnedProductRow[];
}) {
  const tiles = [
    { label: "Total Return Request", value: formatNumber(kpis.totalRequests) },
    { label: "Return Rate", value: formatPercent(kpis.returnRatePct) },
    { label: "Avg Resolution", value: `${kpis.avgResolutionDays.toFixed(1)} hari` },
    { label: "Refund Value", value: formatIdrCompact(kpis.refundValue) },
  ];

  const needsAction = returns.filter((r) => r.status === "JUDGING" || r.status === "SELLER_DISPUTE");

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="gfx-kpi">
            <div className="kpi-label">{t.label}</div>
            <div className="kpi-value">{t.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h2 className="gfx-section-title">Breakdown alasan retur</h2>
          <div className="mt-3">
            <Card>
              <ReturnReasonDonut rows={reasons} />
            </Card>
          </div>
        </div>
        <div>
          <h2 className="gfx-section-title">Tren order vs retur</h2>
          <div className="mt-3">
            <Card>
              <TrendChart
                data={trend}
                series={[
                  { key: "orders", name: "Orders", color: "#c4c2f2", type: "bar", axis: "left" },
                  { key: "returns", name: "Returns", color: "#f0466d", type: "bar", axis: "left" },
                  { key: "ratePct", name: "Return Rate %", color: "#8154b6", type: "line", axis: "right" },
                ]}
              />
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Antrean retur {needsAction.length > 0 && `— ${needsAction.length} butuh aksi`}</h2>
        <p className="gfx-section-desc mt-1">
          Baris JUDGING/SELLER_DISPUTE butuh respons seller sebelum window keputusan Shopee tutup.
        </p>
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr>
                {["Return SN", "Order SN", "Status", "Alasan", "Refund", "Dibuka"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {returns.slice(0, 30).map((r) => {
                const needsSellerAction = r.status === "JUDGING" || r.status === "SELLER_DISPUTE";
                return (
                  <tr key={r.returnSn} className="gfx-row-border">
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-[#342d32]">
                      <span className="inline-flex items-center gap-1.5">
                        {needsSellerAction && <SeverityDot severity="warning" />}
                        {r.returnSn}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{r.orderSn}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <ReturnStatusChip status={r.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{r.reason.replaceAll("_", " ")}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(r.refundAmount)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatDate(r.createTime)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Produk paling sering diretur</h2>
        <p className="gfx-section-desc mt-1">Konsentrasi retur di SKU tertentu = sinyal masalah kualitas/deskripsi.</p>
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr>
                {["Produk", "Jumlah Retur"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topReturned.map((row) => (
                <tr key={row.itemName} className="gfx-row-border">
                  <td className="px-3 py-2 font-medium text-[#342d32]">{row.itemName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{row.count}</td>
                </tr>
              ))}
              {topReturned.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-[#9d8a97]">
                    Belum ada data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
