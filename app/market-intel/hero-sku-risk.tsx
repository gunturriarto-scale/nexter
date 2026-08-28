"use client";

import { Shop } from "@/lib/market-intel/types";
import { formatPct, formatNumber } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

function riskLabel(share: number): { label: string; color: string } {
  if (share >= 55) return { label: "Tinggi", color: "text-rose-600" };
  if (share >= 45) return { label: "Sedang", color: "text-amber-600" };
  return { label: "Rendah", color: "text-emerald-600" };
}

const COLUMNS: DataTableColumn<Shop>[] = [
  {
    key: "shopName",
    header: "Brand",
    sortAccessor: (s) => s.shopName,
    cell: (s) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold text-[#14213D]">{s.shopName}</span>
        <GlowChip name={s.shopName} />
      </div>
    ),
  },
  {
    key: "top3RevenueShare",
    header: "Top-3 share",
    sortAccessor: (s) => s.top3RevenueShare,
    cell: (s) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-32 overflow-hidden rounded-none bg-[#EDF3F8]">
          <div
            className={`h-full rounded-none ${
              s.top3RevenueShare >= 55
                ? "bg-gradient-to-r from-[#06B6D4] to-[#2563EB]"
                : s.top3RevenueShare >= 45
                  ? "bg-gradient-to-r from-[#2563EB] to-[#0891B2]"
                  : "bg-gradient-to-r from-[#0891B2] to-[#BFDBFE]"
            }`}
            style={{ width: `${Math.min(100, s.top3RevenueShare)}%` }}
          />
        </div>
        <span className="font-semibold text-[#14213D]">{formatPct(s.top3RevenueShare)}</span>
      </div>
    ),
  },
  { key: "risk", header: "Risiko konsentrasi", cellClassName: "whitespace-nowrap", sortAccessor: (s) => s.top3RevenueShare, cell: (s) => <span className={`font-semibold ${riskLabel(s.top3RevenueShare).color}`}>{riskLabel(s.top3RevenueShare).label}</span> },
  { key: "productNumber", header: "Total SKU", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.productNumber, cell: (s) => formatNumber(s.productNumber) },
];

export function HeroSkuRisk({ shops }: { shops: Shop[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={shops}
      rowKey={(s) => s.shopId}
      initialSort={{ key: "top3RevenueShare", direction: "desc" }}
      minWidth={640}
      rowClassName={(s) => (s.shopName === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada data brand."
      note="Top-3 share = revenue 3 SKU terlaris ÷ total revenue (join shop/detail top3_product_ids dengan product/detail). Semakin tinggi = semakin bergantung ke hero SKU."
    />
  );
}
