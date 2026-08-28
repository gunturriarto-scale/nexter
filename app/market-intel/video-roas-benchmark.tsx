"use client";

import { Video } from "@/lib/market-intel/benchmark-types";
import { formatIdrCompact, formatCompact } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

function roasColor(roas: number): string {
  if (roas >= 4.5) return "text-emerald-600";
  if (roas >= 3.5) return "text-amber-600";
  return "text-rose-600";
}

const AD_COLUMNS: DataTableColumn<Video>[] = [
  {
    key: "title",
    header: "Video (iklan)",
    sortAccessor: (v) => v.videoTitle,
    cell: (v) => (
      <>
        <div className="font-semibold text-[#14213D]">{v.videoTitle}</div>
        <div className="text-xs text-[#7A8AA3]">{v.belongedCreatorHandle} · {v.duration}s</div>
      </>
    ),
  },
  {
    key: "brand",
    header: "Brand",
    sortAccessor: (v) => v.affiliatedBrand,
    cell: (v) => (
      <div className="flex items-center gap-2">
        <span className="text-[#4B5D78]">{v.affiliatedBrand}</span>
        <GlowChip name={v.affiliatedBrand} />
      </div>
    ),
  },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (v) => v.revenue, cell: (v) => formatIdrCompact(v.revenue) },
  { key: "views", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.views, cell: (v) => formatCompact(v.views) },
  { key: "gpm", header: "GPM", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.videoGpm, cell: (v) => formatIdrCompact(v.videoGpm) },
  { key: "adsViews", header: "Ads views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.adsViews, cell: (v) => formatCompact(v.adsViews) },
  { key: "adsRoas", header: "Ads ROAS", cellClassName: "whitespace-nowrap", sortAccessor: (v) => v.adsRoas, cell: (v) => <span className={`font-bold ${roasColor(v.adsRoas)}`}>{v.adsRoas.toFixed(2)}x</span> },
  { key: "digg", header: "Likes", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.diggCount, cell: (v) => formatCompact(v.diggCount) },
];

const ORGANIC_COLUMNS: DataTableColumn<Video>[] = [
  {
    key: "title",
    header: "Video (organik)",
    sortAccessor: (v) => v.videoTitle,
    cell: (v) => (
      <>
        <div className="font-semibold text-[#14213D]">{v.videoTitle}</div>
        <div className="text-xs text-[#7A8AA3]">{v.belongedCreatorHandle}</div>
      </>
    ),
  },
  { key: "brand", header: "Brand", cellClassName: "text-[#4B5D78]", sortAccessor: (v) => v.affiliatedBrand, cell: (v) => v.affiliatedBrand },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (v) => v.revenue, cell: (v) => formatIdrCompact(v.revenue) },
  { key: "views", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.views, cell: (v) => formatCompact(v.views) },
  { key: "gpm", header: "GPM", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.videoGpm, cell: (v) => formatIdrCompact(v.videoGpm) },
  { key: "digg", header: "Likes", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.diggCount, cell: (v) => formatCompact(v.diggCount) },
];

export function VideoRoasBenchmark({ videos }: { videos: Video[] }) {
  const ads = videos.filter((v) => v.isAd);
  const organic = videos.filter((v) => !v.isAd);

  return (
    <div className="space-y-4">
      <DataTable
        columns={AD_COLUMNS}
        rows={ads}
        rowKey={(v) => v.videoId}
        initialSort={{ key: "adsRoas", direction: "desc" }}
        minWidth={920}
        rowClassName={(v) => (v.affiliatedBrand === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
        emptyMessage="Belum ada video iklan."
      />

      {organic.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#7A8AA3]">Video organik (tanpa ads)</div>
          <DataTable
            columns={ORGANIC_COLUMNS}
            rows={organic}
            rowKey={(v) => v.videoId}
            initialSort={{ key: "revenue", direction: "desc" }}
            minWidth={760}
            rowClassName={(v) => (v.affiliatedBrand === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
            emptyMessage="Belum ada video organik."
          />
        </div>
      )}
      <p className="text-[11px] text-[#7A8AA3]">
        Ads ROAS = revenue iklan ÷ cost. GPM = revenue per 1000 views. Sumber: video/rank (sort=ads_roas).
        Ini benchmark efisiensi konten iklan kompetitor.
      </p>
    </div>
  );
}
