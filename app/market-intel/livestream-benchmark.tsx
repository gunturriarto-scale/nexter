"use client";

import { Livestream } from "@/lib/market-intel/benchmark-types";
import { formatIdrCompact, formatCompact, formatNumber, formatDuration } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

function formatGpm(gpm: number): string {
  return `Rp ${Math.round(gpm).toLocaleString("id-ID")}`;
}

function formatMsDuration(ms: number): string {
  return formatDuration(Math.round(ms / 60000));
}

const COLUMNS: DataTableColumn<Livestream>[] = [
  {
    key: "title",
    header: "Livestream",
    sortAccessor: (l) => l.livestreamTitle,
    cell: (l) => (
      <>
        <div className="font-semibold text-[#14213D]">{l.livestreamTitle}</div>
        <div className="text-xs text-[#7A8AA3]">{l.creatorHandle}</div>
      </>
    ),
  },
  {
    key: "brand",
    header: "Brand",
    sortAccessor: (l) => l.affiliatedBrand,
    cell: (l) => (
      <div className="flex items-center gap-2">
        <span className="text-[#4B5D78]">{l.affiliatedBrand}</span>
        <GlowChip name={l.affiliatedBrand} />
      </div>
    ),
  },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (l) => l.revenue, cell: (l) => formatIdrCompact(l.revenue) },
  { key: "viewers", header: "Viewers", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.viewers, cell: (l) => formatCompact(l.viewers) },
  { key: "gpm", header: "GPM", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (l) => l.gpm, cell: (l) => formatGpm(l.gpm) },
  { key: "duration", header: "Durasi", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.livestreamDuration, cell: (l) => formatMsDuration(l.livestreamDuration * 1000) },
  { key: "productNumber", header: "Produk", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.productNumber, cell: (l) => formatNumber(l.productNumber) },
  { key: "unitPrice", header: "Avg. harga", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.unitPrice, cell: (l) => formatIdrCompact(l.unitPrice) },
];

export function LivestreamBenchmark({ lives }: { lives: Livestream[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={lives}
      rowKey={(l) => l.livestreamId}
      initialSort={{ key: "revenue", direction: "desc" }}
      minWidth={880}
      rowClassName={(l) => (l.affiliatedBrand === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada data livestream."
      note="GPM = revenue per 1000 viewers. Sumber: livestream/rank + livestream/detail. Benchmark strategi live kompetitor — durasi, produk yang dijual, dan efisiensi per viewer."
    />
  );
}
