"use client";

import { useMemo } from "react";
import { MarketCategory } from "@/lib/market-intel/types";
import { formatIdrCompact, formatGrowthPct, formatNumber, formatPct } from "@/lib/market-intel/format";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const sharePct = (part: number, total: number) => (part / Math.max(1, total)) * 100;

export function CategoryOverview({ categories }: { categories: MarketCategory[] }) {
  const maxRev = useMemo(() => Math.max(1, ...categories.map((c) => c.revenue)), [categories]);

  const columns = useMemo<DataTableColumn<MarketCategory>[]>(
    () => [
      { key: "categoryName", header: "Kategori", cellClassName: "font-semibold text-[#14213D]", sortAccessor: (c) => c.categoryName, cell: (c) => c.categoryName },
      {
        key: "revenue",
        header: "Market size",
        sortAccessor: (c) => c.revenue,
        cell: (c) => (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-none bg-[#EDF3F8]">
              <div className="h-full rounded-none bg-gradient-to-r from-[#2563EB] to-[#0891B2]" style={{ width: `${(c.revenue / maxRev) * 100}%` }} />
            </div>
            <span className="whitespace-nowrap font-semibold text-[#14213D]">{formatIdrCompact(c.revenue)}</span>
          </div>
        ),
      },
      { key: "growth", header: "Growth", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.revenueGrowthRate, cell: (c) => formatGrowthPct(c.revenueGrowthRate) },
      { key: "shareVideo", header: "Share video", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => sharePct(c.videoRevenue, c.revenue), cell: (c) => formatPct(sharePct(c.videoRevenue, c.revenue)) },
      { key: "shareLive", header: "Share live", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => sharePct(c.liveRevenue, c.revenue), cell: (c) => formatPct(sharePct(c.liveRevenue, c.revenue)) },
      { key: "top3", header: "Top-3 shop conc.", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.top3ShopRevenueRatio, cell: (c) => formatPct(c.top3ShopRevenueRatio) },
      { key: "shopNumber", header: "Jumlah shop", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.shopNumber, cell: (c) => formatNumber(c.shopNumber) },
      { key: "activeProductNumber", header: "Produk aktif", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.activeProductNumber, cell: (c) => formatNumber(c.activeProductNumber) },
    ],
    [maxRev]
  );

  return (
    <DataTable
      columns={columns}
      rows={categories}
      rowKey={(c) => c.categoryId}
      initialSort={{ key: "revenue", direction: "desc" }}
      minWidth={820}
      emptyMessage="Belum ada data kategori."
      note="Share video/live = porsi revenue kategori dari video vs live commerce. Top-3 shop conc. = seberapa terkonsentrasi pasar (rendah = fragmented, lebih mudah masuk). Sumber: category/rank + category/detail."
    />
  );
}
