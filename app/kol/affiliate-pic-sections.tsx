"use client";

import { Avatar } from "@/app/kol/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { AffiliatePic, AffiliatePicCreatorRow, AffiliatePicRow } from "@/lib/kol/affiliate-types";

function compactIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function integer(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="gfx-chip bg-[#DBEAFE] text-[#1D4ED8]">Baru</span>;
  const positive = value >= 0;
  return <span className={`gfx-chip ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{positive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%</span>;
}

export function AffiliatePicPerformance({ rows }: { rows: AffiliatePicRow[] }) {
  const maxGmv = Math.max(...rows.map((row) => row.gmv), 1);
  return (
    <section className="mt-7">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Affiliate Ownership</div>
        <h2 className="gfx-section-title mt-1">Performance by PIC</h2>
        <p className="gfx-section-desc mt-1">Setiap AM bertanggung jawab atas creator yang mereka onboard. Angka gabungan video + LIVE, dibandingkan dengan periode sebelumnya yang setara.</p>
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
                  <div className="text-[10px] text-[#7A8AA3]">{integer(row.creatorCount)} creator · {integer(row.videoQuantity)} video</div>
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                <div>
                  <dt className="kpi-label">Creators</dt>
                  <dd className="font-semibold text-[#14213D]">{integer(row.creatorCount)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">Videos</dt>
                  <dd className="font-semibold text-[#14213D]">{integer(row.videoQuantity)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">Total GMV</dt>
                  <dd className="font-bold text-[#2563EB]">{compactIdr(row.gmv)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">Total NMV</dt>
                  <dd className="font-semibold text-[#0E7490]">{compactIdr(row.nmv)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">GMV Live</dt>
                  <dd className="text-[#4B5D78]">{compactIdr(row.gmvLive)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">GMV Video</dt>
                  <dd className="text-[#4B5D78]">{compactIdr(row.gmvVideo)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">NMV Video</dt>
                  <dd className="text-[#4B5D78]">{compactIdr(row.nmvVideo)}</dd>
                </div>
                <div>
                  <dt className="kpi-label">NMV Live</dt>
                  <dd className="text-[#4B5D78]">{compactIdr(row.nmvLive)}</dd>
                </div>
              </dl>

              <div className="mt-3 h-1.5 bg-[#E8EEF5]">
                <div className="h-full bg-[#2563EB]" style={{ width: `${(row.gmv / maxGmv) * 100}%` }} />
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-[#E8EEF5] pt-2">
                <GrowthBadge value={row.growthPct} />
                <span className="text-[10px] text-[#7A8AA3]">vs periode sebelumnya</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

const KPI_TILES: { label: string; value: (row: AffiliatePicRow) => string }[] = [
  { label: "Creators", value: (row) => integer(row.creatorCount) },
  { label: "Videos", value: (row) => integer(row.videoQuantity) },
  { label: "Total GMV", value: (row) => compactIdr(row.gmv) },
  { label: "Total NMV", value: (row) => compactIdr(row.nmv) },
  { label: "GMV Live", value: (row) => compactIdr(row.gmvLive) },
  { label: "GMV Video", value: (row) => compactIdr(row.gmvVideo) },
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
  {
    key: "level",
    header: "TikTok level",
    sortAccessor: (row) => row.level,
    cell: (row) => <span className="gfx-chip bg-[#EEF2FF] text-[#4338CA]">{row.level ?? "Unavailable"}</span>,
  },
  { key: "videoQuantity", header: "Videos", sortAccessor: (row) => row.videoQuantity, cellClassName: "whitespace-nowrap font-semibold", cell: (row) => row.videoQuantity },
  { key: "gmv", header: "GMV", sortAccessor: (row) => row.gmv, cellClassName: "whitespace-nowrap font-bold text-[#2563EB]", cell: (row) => compactIdr(row.gmv) },
  { key: "nmv", header: "NMV", sortAccessor: (row) => row.nmv, cellClassName: "whitespace-nowrap font-semibold text-[#0E7490]", cell: (row) => compactIdr(row.nmv) },
  { key: "gmvLive", header: "GMV Live", sortAccessor: (row) => row.gmvLive, cellClassName: "whitespace-nowrap text-[#4B5D78]", cell: (row) => compactIdr(row.gmvLive) },
  { key: "gmvVideo", header: "GMV Video", sortAccessor: (row) => row.gmvVideo, cellClassName: "whitespace-nowrap text-[#4B5D78]", cell: (row) => compactIdr(row.gmvVideo) },
  { key: "nmvVideo", header: "NMV Video", sortAccessor: (row) => row.nmvVideo, cellClassName: "whitespace-nowrap text-[#4B5D78]", cell: (row) => compactIdr(row.nmvVideo) },
  { key: "growthPct", header: "vs previous", sortAccessor: (row) => row.growthPct, cell: (row) => <GrowthBadge value={row.growthPct} /> },
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
        <p className="gfx-section-desc mt-1">KPI strip plus daftar creator per AM, dengan growth vs periode sebelumnya. GMV/NMV memisahkan channel video dan LIVE.</p>
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
              <div className="text-[10px] text-[#7A8AA3]">{integer(group.totals.creatorCount)} creator aktif</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
              minWidth={1040}
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
