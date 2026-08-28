"use client";

import { Avatar } from "@/app/kol/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { AffiliatePic, AffiliatePicCreatorRow, AffiliatePicRow, MetricValue } from "@/lib/kol/affiliate-types";

function compactIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function integer(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

/** Compact "% vs previous" shown next to / under a metric value. */
function GrowthInline({ value, size = "sm" }: { value: number | null; size?: "sm" | "xs" }) {
  const cls = size === "xs" ? "text-[9px]" : "text-[10px]";
  if (value === null) return <span className={`${cls} font-semibold text-[#2563EB]`}>Baru</span>;
  const positive = value >= 0;
  return (
    <span className={`${cls} font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
      {positive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/** Two-line table cell: value on top, small "% vs previous" underneath. */
function metricCell(value: MetricValue, format: (n: number) => string, valueClassName = "font-semibold text-[#14213D]") {
  return (
    <div>
      <div className={valueClassName}>{format(value.current)}</div>
      <div className="mt-0.5">
        <GrowthInline value={value.growthPct} size="xs" />
      </div>
    </div>
  );
}

function PicMetric({
  label,
  metric,
  format,
  valueClassName = "font-semibold text-[#14213D]",
}: {
  label: string;
  metric: MetricValue;
  format: (n: number) => string;
  valueClassName?: string;
}) {
  return (
    <div>
      <dt className="kpi-label">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
        <span className={valueClassName}>{format(metric.current)}</span>
        <GrowthInline value={metric.growthPct} />
      </dd>
    </div>
  );
}

export function AffiliatePicPerformance({ rows }: { rows: AffiliatePicRow[] }) {
  const maxGmv = Math.max(...rows.map((row) => row.gmv.current), 1);
  return (
    <section className="mt-7">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Affiliate Ownership</div>
        <h2 className="gfx-section-title mt-1">Performance by PIC</h2>
        <p className="gfx-section-desc mt-1">Setiap AM bertanggung jawab atas creator yang mereka onboard. Angka gabungan video + LIVE + product card; tiap metrik dibandingkan dengan periode sebelumnya yang setara.</p>
      </div>

      {rows.length === 0 ? (
        <div className="gfx-card mt-3 p-4 text-xs text-[#7A8AA3]">Belum ada PIC dengan aktivitas pada filter ini.</div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <article key={row.pic.picId} className="gfx-card p-4">
              <div className="flex items-center gap-2">
                <Avatar seed={row.pic.avatarSeed} label={row.pic.name} size={30} />
                <div>
                  <div className="font-semibold text-[#14213D]">{row.pic.name}</div>
                  <div className="text-[10px] text-[#7A8AA3]">{integer(row.creatorCount.current)} creator · {integer(row.videoQuantity.current)} video</div>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[11px]">
                <PicMetric label="Creators" metric={row.creatorCount} format={integer} />
                <PicMetric label="Videos" metric={row.videoQuantity} format={integer} />
                <PicMetric label="Total GMV" metric={row.gmv} format={compactIdr} valueClassName="font-bold text-[#2563EB]" />
                <PicMetric label="Total NMV" metric={row.nmv} format={compactIdr} valueClassName="font-semibold text-[#0E7490]" />
                <PicMetric label="GMV Video" metric={row.gmvVideo} format={compactIdr} valueClassName="text-[#4B5D78]" />
                <PicMetric label="GMV Live" metric={row.gmvLive} format={compactIdr} valueClassName="text-[#4B5D78]" />
                <PicMetric label="GMV Product Card" metric={row.gmvProductCard} format={compactIdr} valueClassName="text-[#4B5D78]" />
              </dl>

              <div className="mt-3 h-1.5 bg-[#E8EEF5]">
                <div className="h-full bg-[#2563EB]" style={{ width: `${(row.gmv.current / maxGmv) * 100}%` }} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const KPI_TILES: { label: string; value: (row: AffiliatePicRow) => string }[] = [
  { label: "Creators", value: (row) => integer(row.creatorCount.current) },
  { label: "Videos", value: (row) => integer(row.videoQuantity.current) },
  { label: "Total GMV", value: (row) => compactIdr(row.gmv.current) },
  { label: "Total NMV", value: (row) => compactIdr(row.nmv.current) },
  { label: "GMV Video", value: (row) => compactIdr(row.gmvVideo.current) },
  { label: "GMV Live", value: (row) => compactIdr(row.gmvLive.current) },
  { label: "GMV Product Card", value: (row) => compactIdr(row.gmvProductCard.current) },
];

const BREAKDOWN_COLUMNS: DataTableColumn<AffiliatePicCreatorRow>[] = [
  {
    key: "creator",
    header: "Creator",
    sortAccessor: (row) => row.creator.displayName,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Avatar seed={row.creator.avatarSeed} label={row.creator.displayName} size={28} />
        <div>
          <div className="font-semibold text-[#14213D]">{row.creator.displayName}</div>
          <div className="text-[10px] text-[#7A8AA3]">{row.creator.username} · {compactNumber(row.creator.followerCount)} followers</div>
        </div>
      </div>
    ),
  },
  { key: "gmv", header: "GMV", sortAccessor: (row) => row.gmv.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.gmv, compactIdr, "font-bold text-[#2563EB]") },
  { key: "nmv", header: "NMV", sortAccessor: (row) => row.nmv.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.nmv, compactIdr, "font-semibold text-[#0E7490]") },
  { key: "gmvVideo", header: "GMV Video", sortAccessor: (row) => row.gmvVideo.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.gmvVideo, compactIdr, "text-[#4B5D78]") },
  { key: "videoQuantity", header: "Videos", sortAccessor: (row) => row.videoQuantity.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.videoQuantity, integer, "font-semibold text-[#14213D]") },
  { key: "gmvLive", header: "GMV Live", sortAccessor: (row) => row.gmvLive.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.gmvLive, compactIdr, "text-[#4B5D78]") },
  { key: "liveSessions", header: "Live sessions", sortAccessor: (row) => row.liveSessions.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.liveSessions, integer, "font-semibold text-[#14213D]") },
  { key: "gmvProductCard", header: "GMV Product Card", sortAccessor: (row) => row.gmvProductCard.current, cellClassName: "whitespace-nowrap align-top", cell: (row) => metricCell(row.gmvProductCard, compactIdr, "text-[#4B5D78]") },
  {
    key: "level",
    header: "TikTok level",
    sortAccessor: (row) => row.level,
    cellClassName: "align-top",
    cell: (row) => <span className="gfx-chip bg-[#EEF2FF] text-[#4338CA]">{row.level ?? "Unavailable"}</span>,
  },
];

export function AffiliatePicBreakdown({
  groups,
}: {
  groups: { pic: AffiliatePic; totals: AffiliatePicRow; creators: AffiliatePicCreatorRow[] }[];
}) {
  return (
    <section className="mt-7 border-t border-[#D9E3EE] pt-7">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Per-PIC Detail</div>
        <h2 className="gfx-section-title mt-1">Creator breakdown by PIC</h2>
        <p className="gfx-section-desc mt-1">KPI strip plus daftar creator per AM, dengan growth vs periode sebelumnya. GMV memisahkan channel video, LIVE, dan product card.</p>
      </div>

      {groups.length === 0 && (
        <div className="gfx-card mt-4 p-4 text-xs text-[#7A8AA3]">Tidak ada data PIC untuk filter ini.</div>
      )}

      {groups.map((group) => (
        <div key={group.pic.picId} className="mt-6 first:mt-4">
          <div className="flex items-center gap-2">
            <Avatar seed={group.pic.avatarSeed} label={group.pic.name} size={28} />
            <div>
              <div className="font-semibold text-[#14213D]">{group.pic.name}</div>
              <div className="text-[10px] text-[#7A8AA3]">{integer(group.totals.creatorCount.current)} creator aktif</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {KPI_TILES.map((tile) => (
              <div key={tile.label} className="gfx-kpi">
                <div className="kpi-label">{tile.label}</div>
                <div className="kpi-value">{tile.value(group.totals)}</div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <DataTable
              columns={BREAKDOWN_COLUMNS}
              rows={group.creators}
              rowKey={(row) => row.creator.creatorId}
              initialSort={{ key: "gmv", direction: "desc" }}
              minWidth={1320}
              size="xs"
              cellClassName="px-3 py-3"
              emptyMessage="Belum ada creator aktif untuk AM ini pada filter ini."
            />
          </div>
        </div>
      ))}
    </section>
  );
}
