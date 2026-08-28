import {
  MOCK_AFFILIATE_CAMPAIGNS,
  MOCK_AFFILIATE_DAILY_FACTS,
  MOCK_AFFILIATE_PICS,
  MOCK_AFFILIATE_PROFILES,
  MOCK_AFFILIATE_VIDEOS,
  MOCK_COMPETITIONS,
  MOCK_CREATOR_LEVEL_SNAPSHOTS,
} from "@/lib/kol/affiliate-mock-data";
import {
  buildAffiliateCreatorRows,
  buildAffiliateOverview,
  buildAffiliatePicBreakdown,
  buildAffiliatePicRows,
  buildAffiliateTrend,
  buildAffiliateVideoRows,
  buildCompetitionRows,
  findUnmatchedUsernames,
} from "@/lib/kol/affiliate-aggregate";
import { AffiliateFilters, AffiliateTimeGrain, MetricValue } from "@/lib/kol/affiliate-types";
import Link from "next/link";
import { AffiliateTrendChart } from "@/app/kol/affiliate-trend-chart";
import {
  AffiliateCreatorLeaderboard,
  AffiliateVideoValidation,
  CompetitionCenter,
  DataQualityNotice,
} from "@/app/kol/affiliate-dashboard-sections";
import { AffiliatePicBreakdown, AffiliatePicPerformance } from "@/app/kol/affiliate-pic-sections";

export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const TABS = [
  { key: "ringkasan", label: "Ringkasan", icon: "📊" },
  { key: "creator", label: "Per Creator", icon: "👥" },
  { key: "konten", label: "Konten", icon: "🎬" },
  { key: "competition", label: "Competition", icon: "🏆" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function compactIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function integer(value: number): string {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function Change({ metric }: { metric: MetricValue }) {
  if (metric.growthPct === null) {
    return <span className="text-[10px] font-semibold text-[#2563EB]">Baru vs periode sebelumnya</span>;
  }
  const positive = metric.growthPct >= 0;
  return (
    <span className={`text-[10px] font-semibold ${positive ? "text-emerald-600" : "text-rose-600"}`}>
      {positive ? "▲" : "▼"} {Math.abs(metric.growthPct).toFixed(1)}% vs periode sebelumnya
    </span>
  );
}

export default async function CreatorPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const startParam = first(params.start);
  const endParam = first(params.end);
  const grainParam = first(params.grain);
  const grain: AffiliateTimeGrain = ["daily", "weekly", "monthly"].includes(grainParam ?? "")
    ? (grainParam as AffiliateTimeGrain)
    : "daily";
  const startDate = startParam && DATE_PATTERN.test(startParam) ? startParam : "2026-08-01";
  const endDate = endParam && DATE_PATTERN.test(endParam) && endParam >= startDate ? endParam : "2026-08-28";
  const campaignId = MOCK_AFFILIATE_CAMPAIGNS.some((campaign) => campaign.campaignId === first(params.campaign))
    ? first(params.campaign)
    : undefined;
  const creatorLevel = first(params.level) || undefined;
  const creatorTag = first(params.tag) || undefined;
  const query = first(params.q) || undefined;
  const selectedCompetition =
    MOCK_COMPETITIONS.find((competition) => competition.competitionId === first(params.event)) ?? MOCK_COMPETITIONS[0];
  const filters: AffiliateFilters = { startDate, endDate, grain, campaignId, creatorLevel, creatorTag, query };

  const tabParam = first(params.tab) ?? "ringkasan";
  const activeTab: TabKey = TABS.some((tab) => tab.key === tabParam) ? (tabParam as TabKey) : "ringkasan";

  function tabHref(tab: TabKey): string {
    const search = new URLSearchParams({ tab });
    search.set("start", startDate);
    search.set("end", endDate);
    if (grain !== "daily") search.set("grain", grain);
    if (campaignId) search.set("campaign", campaignId);
    if (creatorLevel) search.set("level", creatorLevel);
    if (creatorTag) search.set("tag", creatorTag);
    if (query) search.set("q", query);
    search.set("event", selectedCompetition.competitionId);
    return `/creator?${search.toString()}`;
  }

  const overview = buildAffiliateOverview(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_VIDEOS, MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_CAMPAIGNS, MOCK_CREATOR_LEVEL_SNAPSHOTS, filters);
  const trend = buildAffiliateTrend(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_VIDEOS, MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_CAMPAIGNS, MOCK_CREATOR_LEVEL_SNAPSHOTS, filters);
  const creatorRows = buildAffiliateCreatorRows(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_VIDEOS, MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_CAMPAIGNS, MOCK_CREATOR_LEVEL_SNAPSHOTS, filters);
  const videoRows = buildAffiliateVideoRows(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_VIDEOS, MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_CAMPAIGNS, MOCK_CREATOR_LEVEL_SNAPSHOTS, filters);
  const competitionRows =
    campaignId && campaignId !== selectedCompetition.campaignId
      ? []
      : buildCompetitionRows(
          selectedCompetition,
          MOCK_AFFILIATE_DAILY_FACTS,
          MOCK_AFFILIATE_VIDEOS,
          MOCK_AFFILIATE_PROFILES,
          MOCK_CREATOR_LEVEL_SNAPSHOTS,
          filters
        );
  const picRows = buildAffiliatePicRows(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_VIDEOS, MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_CAMPAIGNS, MOCK_CREATOR_LEVEL_SNAPSHOTS, MOCK_AFFILIATE_PICS, filters);
  const picBreakdown = buildAffiliatePicBreakdown(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_VIDEOS, MOCK_AFFILIATE_PROFILES, MOCK_AFFILIATE_CAMPAIGNS, MOCK_CREATOR_LEVEL_SNAPSHOTS, MOCK_AFFILIATE_PICS, filters);
  const unmatchedUsernames = findUnmatchedUsernames(MOCK_AFFILIATE_DAILY_FACTS, MOCK_AFFILIATE_PROFILES);
  const levels = Array.from(new Set(MOCK_CREATOR_LEVEL_SNAPSHOTS.map((snapshot) => snapshot.level))).sort();
  const tags = Array.from(new Set(MOCK_AFFILIATE_PROFILES.flatMap((creator) => creator.tags))).sort();
  const kpis = [
    { label: "Affiliate GMV", value: compactIdr(overview.gmv.current), metric: overview.gmv },
    { label: "Affiliate NMV", value: compactIdr(overview.nmv.current), metric: overview.nmv },
    { label: "Active affiliates", value: integer(overview.activeAffiliates.current), metric: overview.activeAffiliates },
    { label: "Video quantity", value: integer(overview.videoQuantity.current), metric: overview.videoQuantity },
    { label: "Valid videos", value: integer(overview.validVideoQuantity.current), metric: overview.validVideoQuantity },
    { label: "Orders", value: integer(overview.orders.current), metric: overview.orders },
    { label: "Commission", value: compactIdr(overview.commission.current), metric: overview.commission },
  ];

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6">
      <div className="flex flex-col gap-4 border-b border-[#D9E3EE] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="gfx-chip bg-[#DBEAFE] text-[#1D4ED8]">MOCK DATA · API-READY</span>
            <span className="gfx-chip bg-[#ECFDF5] text-[#047857]">CREATOR TYPE: AFFILIATE</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#14213D]">Affiliate Creator Intelligence</h1>
          <p className="mt-1 max-w-2xl text-[11px] text-[#7A8AA3]">Monitor affiliate marketing, creator contribution, valid content, dan competition performance dalam satu scope data.</p>
        </div>
        <div className="text-left text-[10px] leading-5 text-[#7A8AA3] lg:text-right">
          <div>Timezone: Asia/Jakarta · Currency: IDR</div>
          <div>Creator Level snapshot: Aug 2026</div>
        </div>
      </div>

      <form className="gfx-filter-bar mt-5 grid grid-cols-2 gap-3 p-4 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-9">
        <input type="hidden" name="tab" value={activeTab} />
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">Creator type<input className="gfx-input mt-1 cursor-not-allowed bg-[#F3F7FB] font-semibold text-[#2563EB]" value="Affiliate" disabled readOnly /></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">From<input type="date" name="start" defaultValue={startDate} className="gfx-input mt-1" /></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">To<input type="date" name="end" defaultValue={endDate} className="gfx-input mt-1" /></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">Breakdown<select name="grain" defaultValue={grain} className="gfx-select mt-1"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">Campaign<select name="campaign" defaultValue={campaignId ?? ""} className="gfx-select mt-1"><option value="">All campaigns</option>{MOCK_AFFILIATE_CAMPAIGNS.map((campaign) => <option key={campaign.campaignId} value={campaign.campaignId}>{campaign.name}</option>)}</select></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">TikTok level<select name="level" defaultValue={creatorLevel ?? ""} className="gfx-select mt-1"><option value="">All levels</option>{levels.map((level) => <option key={level} value={level}>{level}</option>)}</select></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">Internal tag<select name="tag" defaultValue={creatorTag ?? ""} className="gfx-select mt-1"><option value="">All tags</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">Creator search<input name="q" defaultValue={query ?? ""} placeholder="Name or @handle" className="gfx-input mt-1" /></label>
        <label className="flex flex-col text-[10px] font-semibold uppercase tracking-[0.06em] text-[#71839B]">Competition<select name="event" defaultValue={selectedCompetition.competitionId} className="gfx-select mt-1">{MOCK_COMPETITIONS.map((competition) => <option key={competition.competitionId} value={competition.competitionId}>{competition.name}</option>)}</select></label>
        <div className="col-span-2 flex items-end gap-2 md:col-span-4 xl:col-span-6 2xl:col-span-9"><button type="submit" className="gfx-btn">Apply filters</button><a href={`/creator?tab=${activeTab}`} className="px-3 py-2 text-[11px] font-semibold text-[#536984] hover:text-[#2563EB]">Reset</a></div>
      </form>

      <div className="mt-5 flex flex-wrap gap-2 border-b border-[#DDE6F0]">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={tabHref(tab.key)}
              className={`-mb-px rounded-none px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "border border-b-0 border-[#DDE6F0] bg-white text-[#2563EB]"
                  : "text-[#7A8AA3] hover:bg-[#EFF6FF] hover:text-[#14213D]"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>

      {activeTab === "ringkasan" && (
        <>
          <section className="mt-6">
            <div className="flex items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">Affiliate Marketing Overview</div><h2 className="gfx-section-title mt-1">Performance snapshot</h2></div><div className="text-[10px] text-[#7A8AA3]">{startDate} — {endDate}</div></div>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
              {kpis.map((kpi) => <article key={kpi.label} className="gfx-kpi min-h-[94px]"><div className="kpi-label">{kpi.label}</div><div className="kpi-value">{kpi.value}</div><div className="mt-2"><Change metric={kpi.metric} /></div></article>)}
            </div>
          </section>

          <section className="gfx-card mt-5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="gfx-section-title">GMV &amp; NMV trend</h2><p className="gfx-section-desc mt-1">Affiliate-only performance, grouped {grain}.</p></div><div className="flex gap-4 text-[10px] text-[#71839B]"><span><i className="mr-1 inline-block h-2 w-2 bg-[#2563EB]" />GMV</span><span><i className="mr-1 inline-block h-2 w-2 bg-[#22D3EE]" />NMV</span></div></div>
            <div className="mt-3 h-[300px]"><AffiliateTrendChart data={trend} /></div>
          </section>

          <AffiliatePicPerformance rows={picRows} />
          <DataQualityNotice usernames={unmatchedUsernames} />
        </>
      )}

      {activeTab === "creator" && (
        <>
          <DataQualityNotice usernames={unmatchedUsernames} />
          <AffiliateCreatorLeaderboard rows={creatorRows} />
          <AffiliatePicBreakdown groups={picBreakdown} />
        </>
      )}

      {activeTab === "konten" && <AffiliateVideoValidation rows={videoRows} />}

      {activeTab === "competition" && (
        <CompetitionCenter competition={selectedCompetition} rows={competitionRows} />
      )}

      <footer className="mt-8 border-t border-[#D9E3EE] py-5 text-[10px] leading-4 text-[#7A8AA3]">
        Mockup API-ready. Creator marketplace attributes map to TikTok Shop Affiliate Seller; arbitrary period performance maps to affiliate-account video analytics and affiliate orders. NMV deducts mutually exclusive cancellation, return, and refund adjustments.
      </footer>
    </main>
  );
}
