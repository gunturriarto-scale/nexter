"use client";

import { Creator } from "@/lib/market-intel/benchmark-types";
import { formatIdrCompact, formatCompact, formatGrowthPct, formatPct } from "@/lib/market-intel/format";
import { DataTable, type DataTableColumn } from "@/components/data-table";

function brandColor(brand: string): string {
  const map: Record<string, string> = {
    "Glow FX": "#2563EB",
    Somethinc: "#0891B2",
    Hanasui: "#06B6D4",
    Scarlett: "#60A5FA",
    Whitelab: "#7A8AA3",
    Azarine: "#93C5FD",
  };
  return map[brand] ?? "#7A8AA3";
}

function engLevel(er: number): { label: string; color: string } {
  if (er >= 12) return { label: "Tinggi", color: "text-emerald-600" };
  if (er >= 8) return { label: "Sedang", color: "text-amber-600" };
  return { label: "Rendah", color: "text-[#7A8AA3]" };
}

const COLUMNS: DataTableColumn<Creator>[] = [
  {
    key: "creator",
    header: "Kreator",
    sortAccessor: (c) => c.creatorNickname,
    cell: (c) => (
      <>
        <div className="font-semibold text-[#14213D]">{c.creatorNickname}</div>
        <div className="text-xs text-[#7A8AA3]">{c.creatorHandle}</div>
      </>
    ),
  },
  {
    key: "brand",
    header: "Brand",
    sortAccessor: (c) => c.affiliatedBrand,
    cell: (c) => (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-none" style={{ background: brandColor(c.affiliatedBrand) }} />
        <span className="text-[#4B5D78]">{c.affiliatedBrand}</span>
      </span>
    ),
  },
  {
    key: "type",
    header: "Tipe",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (c) => c.creatorStatus,
    cell: (c) => (
      <span className={`rounded-none px-2 py-0.5 text-[10px] font-medium ${c.creatorStatus === "INDEPENDENT" ? "bg-blue-100 text-blue-800" : "bg-violet-100 text-violet-800"}`}>
        {c.creatorStatus === "INDEPENDENT" ? "Independent" : "Brand-owned"}
      </span>
    ),
  },
  { key: "revenue", header: "GMV", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (c) => c.revenue, cell: (c) => formatIdrCompact(c.revenue) },
  { key: "growth", header: "Growth", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.revenueGrowthRate, cell: (c) => formatGrowthPct(c.revenueGrowthRate) },
  { key: "followers", header: "Followers", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.creatorFollowers, cell: (c) => formatCompact(c.creatorFollowers) },
  { key: "views", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.contentViews, cell: (c) => formatCompact(c.contentViews) },
  { key: "engagement", header: "Engagement", cellClassName: "whitespace-nowrap", sortAccessor: (c) => c.engagementRate, cell: (c) => <span className={`font-semibold ${engLevel(c.engagementRate).color}`}>{formatPct(c.engagementRate)}</span> },
  { key: "videoRevenue", header: "Video rev.", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.videoRevenue, cell: (c) => formatIdrCompact(c.videoRevenue) },
  { key: "liveRevenue", header: "Live rev.", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.liveRevenue, cell: (c) => formatIdrCompact(c.liveRevenue) },
];

export function CreatorBenchmark({ creators }: { creators: Creator[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={creators}
      rowKey={(c) => c.creatorId}
      initialSort={{ key: "revenue", direction: "desc" }}
      minWidth={960}
      rowClassName={(c) => (c.affiliatedBrand === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada data kreator."
      note="Sumber: creator/rank + creator/detail. Independent = kreator luar, brand-owned = akun resmi brand. Engagement: tinggi ≥12%, sedang 8–12%."
    />
  );
}
