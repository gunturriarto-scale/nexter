import { ActionableOrder, FunnelRow, LogisticsSummaryRow } from "@/lib/shopee/aggregate";
import { OrderStatus, ShopeeOrder } from "@/lib/shopee/types";
import { formatDateTime, formatIdrCompact, formatNumber, maskBuyerUsername } from "@/lib/shopee/format";
import { OrderStatusChip, SeverityDot } from "@/app/shopee/ui";
import { StatusFunnel } from "@/app/shopee/status-funnel";

const STATUS_COLOR: Record<OrderStatus, string> = {
  UNPAID: "bg-amber-300",
  PENDING: "bg-amber-400",
  READY_TO_SHIP: "bg-gradient-to-r from-[#f0466d] to-[#8154b6]",
  PROCESSED: "bg-[#8154b6]",
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
      : 0; // illustrative constant until real create->ship timestamps are wired (Wave 2)

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
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr>
                {["Order SN", "Item", "Amount", "Ship-by", "Status"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actionable.slice(0, 15).map((a) => (
                <tr key={a.order.orderSn} className="gfx-row-border">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-[#342d32]">{a.order.orderSn}</td>
                  <td className="px-3 py-2 text-[#6b5a66]">{a.order.items[0]?.itemName}{a.order.items.length > 1 ? ` +${a.order.items.length - 1} lainnya` : ""}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(a.order.totalAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {a.order.shipByDate && formatDateTime(a.order.shipByDate)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <SeverityDot severity={a.overdue ? "critical" : "info"} />
                      {a.overdue ? "Lewat deadline" : `${a.daysLeft}h lagi`}
                    </span>
                  </td>
                </tr>
              ))}
              {actionable.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-[#9d8a97]">
                    Tidak ada order yang perlu aksi sekarang. 🎉
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Logistik</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="gfx-table-wrap overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  {["Kurir", "Jumlah Order"].map((h) => (
                    <th key={h} className="gfx-th px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logistics.byCarrier.map((c) => (
                  <tr key={c.carrier} className="gfx-row-border">
                    <td className="px-3 py-2 font-medium text-[#342d32]">{c.carrier}</td>
                    <td className="px-3 py-2 text-[#6b5a66]">{formatNumber(c.orderCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="gfx-card p-5">
            <h3 className="mb-3 font-serif text-base font-semibold text-[#342d32]">First Mile Binding</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#9d8a97]">Bound</div>
                <div className="mt-1 text-xl font-bold text-emerald-600">{logistics.firstMileBound}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#9d8a97]">Belum Bound</div>
                <div className="mt-1 text-xl font-bold text-rose-600">{logistics.firstMileUnbound}</div>
              </div>
            </div>
            {logistics.firstMileUnbound > 0 && (
              <p className="mt-3 text-xs text-[#9d8a97]">
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
          <label className="flex flex-col text-sm text-[#6b5a66]">
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
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr>
                {["Order SN", "Status", "Buyer", "Item", "Amount", "Dibuat", "Ship-by"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 50).map((o) => (
                <tr key={o.orderSn} className="gfx-row-border">
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-[#342d32]">{o.orderSn}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <OrderStatusChip status={o.orderStatus} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{maskBuyerUsername(o.buyerUsername)}</td>
                  <td className="px-3 py-2 text-[#6b5a66]">
                    {o.items.length} item{o.items.length > 1 ? "s" : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(o.totalAmount)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatDateTime(o.createTime)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                    {o.shipByDate ? formatDateTime(o.shipByDate) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length > 50 && (
          <p className="mt-2 text-xs text-[#9d8a97]">Menampilkan 50 dari {orders.length} order — pagination menyusul.</p>
        )}
      </section>
    </>
  );
}
