"use client";

import { ReturnKpis, ReturnReasonRow, ReturnTrendPoint, TopReturnedProductRow } from "@/lib/shopee/aggregate";
import { ShopeeReturn } from "@/lib/shopee/types";
import { formatDate, formatIdrCompact, formatNumber, formatPercent } from "@/lib/shopee/format";
import { Card, ReturnStatusChip, SeverityDot } from "@/app/shopee/ui";
import { ReturnReasonDonut } from "@/app/shopee/return-reason-donut";
import { TrendChart } from "@/app/shopee/trend-chart";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const QUEUE_COLUMNS: DataTableColumn<ShopeeReturn>[] = [
  {
    key: "returnSn",
    header: "Return SN",
    cellClassName: "whitespace-nowrap font-medium text-[#14213D]",
    sortAccessor: (r) => r.returnSn,
    cell: (r) => {
      const needsSellerAction = r.status === "JUDGING" || r.status === "SELLER_DISPUTE";
      return (
        <span className="inline-flex items-center gap-1.5">
          {needsSellerAction && <SeverityDot severity="warning" />}
          {r.returnSn}
        </span>
      );
    },
  },
  { key: "orderSn", header: "Order SN", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.orderSn, cell: (r) => r.orderSn },
  { key: "status", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (r) => r.status, cell: (r) => <ReturnStatusChip status={r.status} /> },
  { key: "reason", header: "Alasan", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.reason, cell: (r) => r.reason.replaceAll("_", " ") },
  { key: "refundAmount", header: "Refund", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.refundAmount, cell: (r) => formatIdrCompact(r.refundAmount) },
  { key: "createTime", header: "Dibuka", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.createTime, cell: (r) => formatDate(r.createTime) },
];

const TOP_RETURNED_COLUMNS: DataTableColumn<TopReturnedProductRow>[] = [
  { key: "itemName", header: "Produk", cellClassName: "font-medium text-[#14213D]", sortAccessor: (r) => r.itemName, cell: (r) => r.itemName },
  { key: "count", header: "Jumlah Retur", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.count, cell: (r) => r.count },
];

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
                  { key: "orders", name: "Orders", color: "#BFDBFE", type: "bar", axis: "left" },
                  { key: "returns", name: "Returns", color: "#2563EB", type: "bar", axis: "left" },
                  { key: "ratePct", name: "Return Rate %", color: "#0891B2", type: "line", axis: "right" },
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
        <div className="mt-3">
          <DataTable
            columns={QUEUE_COLUMNS}
            rows={returns}
            rowKey={(r) => r.returnSn}
            initialSort={{ key: "createTime", direction: "desc" }}
            minWidth={680}
            emptyMessage="Belum ada retur."
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Produk paling sering diretur</h2>
        <p className="gfx-section-desc mt-1">Konsentrasi retur di SKU tertentu = sinyal masalah kualitas/deskripsi.</p>
        <div className="mt-3">
          <DataTable
            columns={TOP_RETURNED_COLUMNS}
            rows={topReturned}
            rowKey={(r) => r.itemName}
            initialSort={{ key: "count", direction: "desc" }}
            minWidth={420}
            emptyMessage="Belum ada data."
          />
        </div>
      </section>
    </>
  );
}
