"use client";

import { BreakoutRow } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatGrowthPct } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const COLUMNS: DataTableColumn<BreakoutRow>[] = [
  { key: "productName", header: "Produk", cellClassName: "font-semibold text-[#14213D]", sortAccessor: (r) => r.productName, cell: (r) => r.productName },
  {
    key: "shopName",
    header: "Brand",
    sortAccessor: (r) => r.shopName,
    cell: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-[#4B5D78]">{r.shopName}</span>
        <GlowChip name={r.shopName} />
      </div>
    ),
  },
  {
    key: "growth",
    header: "Growth",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (r) => r.growth,
    cell: (r) => (
      <>
        <span className={`font-semibold ${r.growth >= 25 ? "text-emerald-700" : "text-[#4B5D78]"}`}>{formatGrowthPct(r.growth)}</span>
        {r.growth >= 25 && <span className="ml-1">🔥</span>}
      </>
    ),
  },
  { key: "revenue", header: "Revenue (30 hari)", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.revenue, cell: (r) => formatIdrCompact(r.revenue) },
  {
    key: "isNew",
    header: "Status",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (r) => r.isNew,
    cell: (r) =>
      r.isNew ? (
        <span className="rounded-none bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0891B2]">Baru (&lt;90 hari)</span>
      ) : (
        <span className="text-[#91A0B5]">—</span>
      ),
  },
];

export function BreakoutRadar({ rows }: { rows: BreakoutRow[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => r.productName}
      initialSort={{ key: "growth", direction: "desc" }}
      minWidth={680}
      rowClassName={(r) => (r.isGlow ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada produk breakout untuk filter ini."
      note="🔥 = growth ≥25%. Produk “Baru” = launch <90 hari. Sumber: product/rank (sort=revenue_growth_rate) + product/detail (launch_date)."
    />
  );
}
