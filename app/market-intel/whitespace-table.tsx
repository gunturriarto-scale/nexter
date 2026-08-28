"use client";

import { WhitespaceCell } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatGrowthPct } from "@/lib/market-intel/format";
import { DataTable, type DataTableColumn } from "@/components/data-table";

/** Opportunity score: size (normalized) + growth, penalized if Glow FX already present. */
function score(cell: WhitespaceCell): number {
  const sizeScore = cell.marketSize / 1e9;
  const growthScore = cell.growth;
  const presencePenalty = cell.glowPresent ? -15 : 0;
  return sizeScore + growthScore * 0.5 + presencePenalty;
}

const COLUMNS: DataTableColumn<WhitespaceCell>[] = [
  { key: "categoryName", header: "Kategori", cellClassName: "font-semibold text-[#14213D]", sortAccessor: (c) => c.categoryName, cell: (c) => c.categoryName },
  { key: "marketSize", header: "Market size", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.marketSize, cell: (c) => formatIdrCompact(c.marketSize) },
  { key: "growth", header: "Growth", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.growth, cell: (c) => formatGrowthPct(c.growth) },
  {
    key: "glowPresent",
    header: "Glow FX hadir?",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (c) => c.glowPresent,
    cell: (c) =>
      c.glowPresent ? (
        <span className="rounded-none bg-[#EFF6FF] px-2 py-0.5 text-[11px] font-semibold text-[#2563EB]">✓ Ya</span>
      ) : (
        <span className="rounded-none bg-[#EDF3F8] px-2 py-0.5 text-[11px] font-medium text-[#7A8AA3]">✗ Belum</span>
      ),
  },
  { key: "glowRevenue", header: "Revenue Glow FX", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.glowRevenue, cell: (c) => (c.glowRevenue > 0 ? formatIdrCompact(c.glowRevenue) : "—") },
  {
    key: "opportunity",
    header: "Opportunity",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (c) => score(c),
    cell: (c) => {
      const s = score(c);
      const high = s >= 40;
      const mid = s >= 25 && s < 40;
      return (
        <span className={`rounded-none px-2 py-0.5 text-[11px] font-semibold ${high ? "bg-emerald-100 text-emerald-800" : mid ? "bg-amber-100 text-amber-800" : "bg-[#EDF3F8] text-[#7A8AA3]"}`}>
          {high ? "Tinggi" : mid ? "Sedang" : "Rendah"}
        </span>
      );
    },
  },
];

export function WhitespaceTable({ cells }: { cells: WhitespaceCell[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={cells}
      rowKey={(c) => c.categoryName}
      initialSort={{ key: "opportunity", direction: "desc" }}
      minWidth={760}
      emptyMessage="Belum ada data whitespace."
      note='Opportunity = size + growth, dikurangi kalau Glow FX sudah hadir. Kategori dengan growth tinggi tapi "✗ Belum" = whitespace yang bisa dimasuki. Sumber: category/rank + product/rank.'
    />
  );
}
