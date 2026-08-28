"use client";

import { useMemo } from "react";
import { Avatar } from "@/app/kol/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import {
  AffiliateCreatorRow,
  AffiliateVideoRow,
  CompetitionCreatorRow,
  CompetitionPeriod,
} from "@/lib/kol/affiliate-types";

function compactIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date(`${value}T00:00:00Z`));
}

function GrowthBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="gfx-chip bg-[#DBEAFE] text-[#1D4ED8]">Baru</span>;
  const positive = value >= 0;
  return <span className={`gfx-chip ${positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{positive ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%</span>;
}

const CREATOR_COLUMNS: DataTableColumn<AffiliateCreatorRow>[] = [
  { key: "rank", header: "Rank", cellClassName: "font-bold text-[#71839B]", cell: (_row, index) => `#${index + 1}` },
  {
    key: "creator",
    header: "Affiliate creator",
    sortAccessor: (row) => row.creator.displayName,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Avatar seed={row.creator.avatarSeed} label={row.creator.displayName} size={30} />
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
  {
    key: "tags",
    header: "Internal tags",
    headClassName: "max-w-[230px]",
    cellClassName: "max-w-[230px]",
    cell: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.creator.tags.map((tag) => (
          <span key={tag} className="gfx-chip bg-[#F1F5F9] text-[#536984]">{tag}</span>
        ))}
      </div>
    ),
  },
  { key: "videoQuantity", header: "Videos", sortAccessor: (row) => row.videoQuantity, cellClassName: "font-semibold", cell: (row) => row.videoQuantity },
  {
    key: "validVideoQuantity",
    header: "Valid",
    sortAccessor: (row) => row.validVideoQuantity,
    cell: (row) => (
      <span className={row.validVideoQuantity === row.videoQuantity && row.videoQuantity > 0 ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
        {row.validVideoQuantity}/{row.videoQuantity}
      </span>
    ),
  },
  { key: "gmv", header: "GMV", sortAccessor: (row) => row.gmv, cellClassName: "font-bold text-[#14213D]", cell: (row) => compactIdr(row.gmv) },
  { key: "nmv", header: "NMV", sortAccessor: (row) => row.nmv, cellClassName: "font-semibold text-[#0E7490]", cell: (row) => compactIdr(row.nmv) },
  { key: "commission", header: "Commission", sortAccessor: (row) => row.commission, cell: (row) => compactIdr(row.commission) },
  { key: "growthPct", header: "vs previous", sortAccessor: (row) => row.growthPct, cell: (row) => <GrowthBadge value={row.growthPct} /> },
];

export function AffiliateCreatorLeaderboard({ rows }: { rows: AffiliateCreatorRow[] }) {
  return (
    <section className="mt-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Performance Affiliators</div>
          <h2 className="gfx-section-title mt-1">Affiliate creator leaderboard</h2>
          <p className="gfx-section-desc mt-1">Ranked by GMV dalam periode terpilih. Creator Level adalah snapshot resmi bulanan, bukan tier follower.</p>
        </div>
        <div className="text-[10px] text-[#7A8AA3]">{rows.length} affiliate in scope</div>
      </div>
      <div className="mt-3">
        <DataTable
          columns={CREATOR_COLUMNS}
          rows={rows}
          rowKey={(row) => row.creator.creatorId}
          initialSort={{ key: "gmv", direction: "desc" }}
          minWidth={1120}
          size="xs"
          cellClassName="px-3 py-3"
          emptyMessage="Belum ada affiliate creator untuk kombinasi filter ini."
        />
      </div>
    </section>
  );
}

const VIDEO_COLUMNS: DataTableColumn<AffiliateVideoRow>[] = [
  {
    key: "video",
    header: "Video",
    headClassName: "max-w-[250px]",
    cellClassName: "max-w-[250px]",
    sortAccessor: (row) => row.video.title,
    cell: (row) => (
      <>
        <div className="font-semibold text-[#14213D]">{row.video.title}</div>
        <div className="mt-1 text-[10px] text-[#91A0B5]">ID {row.video.videoId}</div>
      </>
    ),
  },
  {
    key: "creator",
    header: "Affiliate",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (row) => row.creator.displayName,
    cell: (row) => (
      <>
        <div className="font-medium">{row.creator.displayName}</div>
        <div className="text-[10px] text-[#7A8AA3]">{row.creator.username}</div>
      </>
    ),
  },
  { key: "posted", header: "Posted", cellClassName: "whitespace-nowrap", sortAccessor: (row) => row.video.videoPostTime, cell: (row) => dateLabel(row.video.videoPostTime) },
  { key: "campaign", header: "Campaign", cellClassName: "whitespace-nowrap", sortAccessor: (row) => row.campaign.name, cell: (row) => row.campaign.name },
  { key: "gmv", header: "GMV", cellClassName: "whitespace-nowrap font-semibold", sortAccessor: (row) => row.gmv, cell: (row) => compactIdr(row.gmv) },
  { key: "nmv", header: "NMV", cellClassName: "whitespace-nowrap text-[#0E7490]", sortAccessor: (row) => row.nmv, cell: (row) => compactIdr(row.nmv) },
  {
    key: "hashtags",
    header: "Video hashtags",
    headClassName: "max-w-[310px]",
    cellClassName: "max-w-[310px]",
    cell: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.video.hashtags.map((hashtag, index) => (
          <span key={`${hashtag}-${index}`} className="gfx-chip bg-[#F1F5F9] text-[#536984]">{hashtag.startsWith("#") ? hashtag : `#${hashtag}`}</span>
        ))}
      </div>
    ),
  },
  {
    key: "matched",
    header: "Matched",
    sortAccessor: (row) => row.matchedHashtags.length,
    cell: (row) => (
      <>
        <div className="font-semibold">{row.matchedHashtags.length}/{row.campaign.requiredHashtags.length}</div>
        <div className="mt-1 text-[10px] text-[#7A8AA3]">min. {row.campaign.minimumHashtagMatches}</div>
      </>
    ),
  },
  {
    key: "status",
    header: "Status",
    sortAccessor: (row) => row.isValid,
    cell: (row) => <span className={`gfx-chip ${row.isValid ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{row.isValid ? "VALID" : "INVALID"}</span>,
  },
];

export function AffiliateVideoValidation({ rows }: { rows: AffiliateVideoRow[] }) {
  return (
    <section className="mt-7">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Content Compliance</div>
        <h2 className="gfx-section-title mt-1">Affiliate video validation</h2>
        <p className="gfx-section-desc mt-1">Video quantity dihitung dari video yang diposting pada periode. Default valid jika minimal 3 dari 5 hashtag campaign cocok.</p>
      </div>
      <div className="mt-3">
        <DataTable
          columns={VIDEO_COLUMNS}
          rows={rows}
          rowKey={(row) => row.video.videoId}
          initialSort={{ key: "gmv", direction: "desc" }}
          minWidth={1200}
          size="xs"
          cellClassName="px-3 py-3 align-top"
          emptyMessage="Tidak ada video yang diposting pada periode dan filter ini."
          note="Default valid jika minimal 3 dari 5 hashtag campaign cocok."
        />
      </div>
    </section>
  );
}

const TYPE_LABEL: Record<CompetitionPeriod["type"], string> = {
  MONTHLY_COMPETITION: "Monthly Competition",
  QUARTERLY_REWARD: "Quarterly Reward",
  DOUBLE_DATE: "Double Date",
  PAYDAY: "Payday",
};

export function CompetitionCenter({ competition, rows }: { competition: CompetitionPeriod; rows: CompetitionCreatorRow[] }) {
  const maxGmv = Math.max(...rows.map((row) => row.gmv), 1);
  const columns = useMemo<DataTableColumn<CompetitionCreatorRow>[]>(
    () => [
      {
        key: "rank",
        header: "Rank",
        sortAccessor: (row) => row.rank,
        cell: (row) => (
          <span className={`inline-flex h-7 w-7 items-center justify-center font-bold ${row.rank <= 3 ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#F1F5F9] text-[#71839B]"}`}>{row.rank}</span>
        ),
      },
      {
        key: "creator",
        header: "Affiliate",
        sortAccessor: (row) => row.creator.displayName,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Avatar seed={row.creator.avatarSeed} label={row.creator.displayName} size={28} />
            <div>
              <div className="font-semibold">{row.creator.displayName}</div>
              <div className="text-[10px] text-[#7A8AA3]">{row.creator.username}</div>
            </div>
          </div>
        ),
      },
      { key: "gmv", header: "GMV", cellClassName: "font-bold", sortAccessor: (row) => row.gmv, cell: (row) => compactIdr(row.gmv) },
      { key: "nmv", header: "NMV", cellClassName: "font-semibold text-[#0E7490]", sortAccessor: (row) => row.nmv, cell: (row) => compactIdr(row.nmv) },
      { key: "validVideoQuantity", header: "Valid videos", sortAccessor: (row) => row.validVideoQuantity, cell: (row) => row.validVideoQuantity },
      { key: "growthPct", header: "vs previous", sortAccessor: (row) => row.growthPct, cell: (row) => <GrowthBadge value={row.growthPct} /> },
      {
        key: "share",
        header: "GMV share",
        headClassName: "w-[180px]",
        cellClassName: "w-[180px]",
        cell: (row) => (
          <div className="h-1.5 bg-[#E8EEF5]">
            <div className="h-full bg-[#2563EB]" style={{ width: `${(row.gmv / maxGmv) * 100}%` }} />
          </div>
        ),
      },
    ],
    [maxGmv]
  );

  return (
    <section className="mt-7">
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <aside className="gfx-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Competition Center</div>
          <h2 className="mt-2 text-base font-bold text-[#14213D]">{competition.name}</h2>
          <span className="gfx-chip mt-2 inline-block bg-[#EEF2FF] text-[#4338CA]">{TYPE_LABEL[competition.type]}</span>
          <dl className="mt-4 space-y-3 text-[11px]">
            <div><dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#91A0B5]">Manual period</dt><dd className="mt-1 font-semibold">{dateLabel(competition.startDate)} — {dateLabel(competition.endDate)}</dd></div>
            <div><dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#91A0B5]">Ranking metric</dt><dd className="mt-1 font-semibold">GMV only</dd></div>
            <div><dt className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#91A0B5]">Validation rule</dt><dd className="mt-1 font-semibold">Minimum {competition.minimumHashtagMatches} of {competition.requiredHashtags.length} hashtags</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-1">{competition.requiredHashtags.map((hashtag) => <span key={hashtag} className="gfx-chip bg-[#EFF6FF] text-[#1D4ED8]">{hashtag}</span>)}</div>
          <p className="mt-4 border-t border-[#E8EEF5] pt-3 text-[10px] leading-4 text-[#7A8AA3]">Comparison memakai rentang tepat sebelumnya dengan jumlah hari yang sama.</p>
        </aside>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.creator.creatorId}
          initialSort={{ key: "rank", direction: "asc" }}
          minWidth={760}
          size="xs"
          cellClassName="px-3 py-3"
          emptyMessage="Belum ada peserta atau performa untuk competition ini."
        />
      </div>
    </section>
  );
}

export function DataQualityNotice({ usernames }: { usernames: string[] }) {
  if (usernames.length === 0) return null;
  return (
    <aside className="mt-5 border border-amber-200 bg-amber-50 px-4 py-3 text-[11px] text-amber-900">
      <span className="font-bold">Data quality:</span> {usernames.length} username belum cocok dengan identity map ({usernames.join(", ")}). Record tersebut dikeluarkan dari KPI dan leaderboard.
    </aside>
  );
}
