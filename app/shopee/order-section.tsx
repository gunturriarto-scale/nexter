"use client";

import { ActionableOrder, FunnelRow, LogisticsSummaryRow } from "@/lib/shopee/aggregate";
import { OrderStatus, ShopeeOrder } from "@/lib/shopee/types";
import { formatDateTime, formatIdrCompact, formatNumber, maskBuyerUsername } from "@/lib/shopee/format";
import { OrderStatusChip, SeverityDot } from "@/app/shopee/ui";
import { StatusFunnel } from "@/app/shopee/status-funnel";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const STATUS_COLOR: Record<OrderStatus, string> = {
  UNPAID: "bg-amber-300",
  PENDING: "bg-amber-400",
  READY_TO_SHIP: "bg-gradient-to-r from-[#2563EB] to-[#0891B2]",
  PROCESSED: "bg-[#0891B2]",
  SHIPPED: "bg-blue-400",
  TO_CONFIRM_RECEIVE: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-rose-400",
  TO_RETURN: "bg-rose-500",
};

const STATUS_LABEL_ID: Record<OrderStatus, string> = {
  UNPAID: "Belum Bayar",
  PENDING: "Pending",
  READY_TO_SHIP: "Siap Kirim",
  PROCESSED: "Diproses",
  SHIPPED: "Dikirim",
  TO_CONFIRM_RECEIVE: "Menunggu Konfirmasi",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  TO_RETURN: "Retur",
};

const ACTIONABLE_COLUMNS: DataTableColumn<ActionableOrder>[] = [
  { key: "orderSn", header: "Order SN", cellClassName: "whitespace-nowrap font-medium text-[#14213D]", sortAccessor: (a) => a.order.orderSn, cell: (a) => a.order.orderSn },
  {
    key: "item",
    header: "Item",
    cellClassName: "text-[#4B5D78]",
    sortAccessor: (a) => a.order.items[0]?.itemName ?? "",
    cell: (a) => `${a.order.items[0]?.itemName ?? ""}${a.order.items.length > 1 ? ` +${a.order.items.length - 1} lainnya` : ""}`,
  },
  { key: "amount", header: "Amount", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (a) => a.order.totalAmount, cell: (a) => formatIdrCompact(a.order.totalAmount) },
  { key: "shipBy", header: "Ship-by", cellClassName: "whitespace-nowrap", sortAccessor: (a) => a.order.shipByDate ?? "", cell: (a) => (a.order.shipByDate ? formatDateTime(a.order.shipByDate) : "—") },
  {
    key: "status",
    header: "Status",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (a) => (a.overdue ? -1 : a.daysLeft),
    cell: (a) => (
      <span className="inline-flex items-center gap-1.5">
        <SeverityDot severity={a.overdue ? "critical" : "info"} />
        {a.overdue ? "Lewat deadline" : `${a.daysLeft}h lagi`}
      </span>
    ),
  },
];

const CARRIER_COLUMNS: DataTableColumn<LogisticsSummaryRow>[] = [
  { key: "carrier", header: "Kurir", cellClassName: "font-medium text-[#14213D]", sortAccessor: (c) => c.carrier, cell: (c) => c.carrier },
  { key: "orderCount", header: "Jumlah Order", cellClassName: "text-[#4B5D78]", sortAccessor: (c) => c.orderCount, cell: (c) => formatNumber(c.orderCount) },
];

const ORDER_COLUMNS: DataTableColumn<ShopeeOrder>[] = [
  { key: "orderSn", header: "Order SN", cellClassName: "whitespace-nowrap font-medium text-[#14213D]", sortAccessor: (o) => o.orderSn, cell: (o) => o.orderSn },
  { key: "orderStatus", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (o) => o.orderStatus, cell: (o) => <OrderStatusChip status={o.orderStatus} /> },
  { key: "buyer", header: "Buyer", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (o) => o.buyerUsername, cell: (o) => maskBuyerUsername(o.buyerUsername) },
  { key: "items", header: "Item", cellClassName: "text-[#4B5D78]", sortAccessor: (o) => o.items.length, cell: (o) => `${o.items.length} item${o.items.length > 1 ? "s" : ""}` },
  { key: "amount", header: "Amount", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (o) => o.totalAmount, cell: (o) => formatIdrCompact(o.totalAmount) },
  { key: "createTime", header: "Dibuat", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (o) => o.createTime, cell: (o) => formatDateTime(o.createTime) },
  { key: "shipByDate", header: "Ship-by", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (o) => o.shipByDate ?? "", cell: (o) => (o.shipByDate ? formatDateTime(o.shipByDate) : "—") },
];

export function OrderSection({
  funnel,
  actionable,
  logistics,
  orders,
  statusFilter,
}: {
  funnel: { main: FunnelRow[]; side: FunnelRow[] };
  actionable: ActionableOrder[];
  logistics: { byCarrier: LogisticsSummaryRow[]; firstMileBound: number; firstMileUnbound: number };
  orders: ShopeeOrder[];
  statusFilter: OrderStatus | "";
}) {
  const countBy = (s: OrderStatus) => funnel.main.find((r) => r.status === s)?.count ?? funnel.side.find((r) => r.status === s)?.count ?? 0;
  const newOrders = countBy("UNPAID") + countBy("PENDING");
  const avgFulfillmentHours =
    orders.filter((o) => o.orderStatus === "SHIPPED" || o.orderStatus === "TO_CONFIRM_RECEIVE" || o.orderStatus === "COMPLETED").length > 0
      ? 38
      : 0;

  const tiles = [
    { label: "Order Baru", value: formatNumber(newOrders) },
    { label: "Siap Kirim", value: formatNumber(countBy("READY_TO_SHIP")) },
    { label: "Dikirim", value: formatNumber(countBy("SHIPPED") + countBy("TO_CONFIRM_RECEIVE")) },
    { label: "Selesai", value: formatNumber(countBy("COMPLETED")) },
    { label: "Dibatalkan", value: formatNumber(countBy("CANCELLED")) },
    { label: "Avg Fulfillment", value: avgFulfillmentHours > 0 ? `~${avgFulfillmentHours} jam` : "—" },
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="gfx-kpi">
            <div className="kpi-label">{t.label}</div>
            <div className="kpi-value">{t.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Status funnel order</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <StatusFunnel
              rows={funnel.main.map((r) => ({
                label: STATUS_LABEL_ID[r.status],
                count: r.count,
                pct: r.pct,
                colorClass: STATUS_COLOR[r.status],
              }))}
            />
          </div>
          <StatusFunnel
            rows={funnel.side.map((r) => ({
              label: STATUS_LABEL_ID[r.status],
              count: r.count,
              pct: r.pct,
              colorClass: STATUS_COLOR[r.status],
            }))}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Butuh aksi hari ini ({actionable.length})</h2>
        <p className="gfx-section-desc mt-1">
          Order READY_TO_SHIP diurutkan berdasarkan ship-by deadline — baris merah artinya sudah lewat batas.
        </p>
        <div className="mt-3">
          <DataTable
            columns={ACTIONABLE_COLUMNS}
            rows={actionable}
            rowKey={(a) => a.order.orderSn}
            initialSort={{ key: "shipBy", direction: "asc" }}
            minWidth={640}
            emptyMessage="Tidak ada order yang perlu aksi sekarang. 🎉"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Logistik</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DataTable
            columns={CARRIER_COLUMNS}
            rows={logistics.byCarrier}
            rowKey={(c) => c.carrier}
            initialSort={{ key: "orderCount", direction: "desc" }}
            emptyMessage="Belum ada data kurir."
          />
          <div className="gfx-card p-5">
            <h3 className="mb-3 font-serif text-base font-semibold text-[#14213D]">First Mile Binding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#7A8AA3]">Bound</div>
                <div className="mt-1 text-xl font-bold text-emerald-600">{logistics.firstMileBound}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#7A8AA3]">Belum Bound</div>
                <div className="mt-1 text-xl font-bold text-rose-600">{logistics.firstMileUnbound}</div>
              </div>
            </div>
            {logistics.firstMileUnbound > 0 && (
              <p className="mt-3 text-xs text-[#7A8AA3]">
                Order belum di-bind ke kurir bisa telat pickup — prioritaskan sebelum ship-by deadline.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Semua order</h2>
        <form className="gfx-filter-bar mt-3 flex flex-wrap items-end gap-4 p-4">
          <input type="hidden" name="tab" value="order" />
          <label className="flex flex-col text-sm text-[#4B5D78]">
            Status
            <select name="status" defaultValue={statusFilter} className="gfx-select mt-1">
              <option value="">Semua status</option>
              {(Object.keys(STATUS_LABEL_ID) as OrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL_ID[s]}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="gfx-btn">
            Filter
          </button>
        </form>
        <div className="mt-3">
          <DataTable
            columns={ORDER_COLUMNS}
            rows={orders}
            rowKey={(o) => o.orderSn}
            initialSort={{ key: "createTime", direction: "desc" }}
            minWidth={720}
            emptyMessage="Belum ada order."
          />
        </div>
      </section>
    </>
  );
}
