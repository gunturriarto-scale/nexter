"use client";

import { Shop } from "@/lib/market-intel/types";
import { rankShops, revenueMix, RankedShop } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatNumber, formatPct, formatGrowthPct } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

function MixBar({ shop }: { shop: Shop }) {
  const mix = revenueMix(shop);
  const seg = [
    { label: "Affiliate", pct: mix.affiliatePct, color: "#2563EB" },
    { label: "Self", pct: mix.selfPct, color: "#0891B2" },
    { label: "Mall", pct: mix.mallPct, color: "#BFDBFE" },
  ];
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-none bg-[#EDF3F8]">
        {seg.map((s) => (
          <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
        ))}
      </div>
      <div className="mt-1 flex gap-3 text-[10px] text-[#7A8AA3]">
        {seg.map((s) => (
          <span key={s.label}>
            {s.label} {formatPct(s.pct)}
          </span>
        ))}
      </div>
    </div>
  );
}

const COLUMNS: DataTableColumn<RankedShop>[] = [
  { key: "rank", header: "#", cellClassName: "font-serif text-lg font-semibold text-[#0891B2]", sortAccessor: (s) => s.rank, cell: (s) => s.rank },
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
  { key: "revenue", header: "Revenue (30 hari)", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (s) => s.revenue, cell: (s) => formatIdrCompact(s.revenue) },
  { key: "growth", header: "Growth", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.revenueGrowthRate, cell: (s) => formatGrowthPct(s.revenueGrowthRate) },
  { key: "salesVolumn", header: "Sales volume", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.salesVolumn, cell: (s) => formatNumber(s.salesVolumn) },
  { key: "unitPrice", header: "Avg. harga", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.unitPrice, cell: (s) => formatIdrCompact(s.unitPrice) },
  { key: "mix", header: "Revenue mix", cell: (s) => <MixBar shop={s} /> },
  { key: "creatorNumber", header: "Kreator", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.creatorNumber, cell: (s) => formatNumber(s.creatorNumber) },
  { key: "productNumber", header: "Produk", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.productNumber, cell: (s) => formatNumber(s.productNumber) },
];

export function BrandRankTable({ shops }: { shops: Shop[] }) {
  const ranked = rankShops(shops);
  return (
    <DataTable
      columns={COLUMNS}
      rows={ranked}
      rowKey={(s) => s.shopId}
      initialSort={{ key: "rank", direction: "asc" }}
      minWidth={1040}
      rowClassName={(s) => (s.shopName === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada data brand."
    />
  );
}
