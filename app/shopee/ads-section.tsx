"use client";

import { AdsCampaignRollup, AdsDayPoint, AdsTotals } from "@/lib/shopee/aggregate";
import { ShopeeAffiliatePerformance } from "@/lib/shopee/types";
import { formatIdrCompact, formatNumber, formatPercent, formatRoas } from "@/lib/shopee/format";
import { Card } from "@/app/shopee/ui";
import { TrendChart } from "@/app/shopee/trend-chart";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const AD_TYPE_LABEL: Record<string, string> = { PRODUCT: "Product Ads", SHOP: "Shop Ads", KEYWORD: "Keyword Ads" };
const AD_STATUS_STYLE: Record<string, string> = {
  ONGOING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  PAUSED: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  ENDED: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

const CAMPAIGN_COLUMNS: DataTableColumn<AdsCampaignRollup>[] = [
  { key: "campaignName", header: "Campaign", cellClassName: "font-medium text-[#14213D]", sortAccessor: (c) => c.campaignName, cell: (c) => c.campaignName },
  { key: "adType", header: "Tipe", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.adType, cell: (c) => AD_TYPE_LABEL[c.adType] },
  { key: "status", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (c) => c.status, cell: (c) => <span className={`rounded-none px-2 py-0.5 text-[11px] font-semibold ${AD_STATUS_STYLE[c.status]}`}>{c.status}</span> },
  { key: "cost", header: "Cost", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.cost, cell: (c) => formatIdrCompact(c.cost) },
  { key: "gmv", header: "GMV", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.gmv, cell: (c) => formatIdrCompact(c.gmv) },
  { key: "roas", header: "ROAS", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (c) => c.roas, cell: (c) => formatRoas(c.roas) },
  { key: "impressions", header: "Impressions", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.impressions, cell: (c) => formatNumber(c.impressions) },
  { key: "clicks", header: "Clicks", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (c) => c.clicks, cell: (c) => formatNumber(c.clicks) },
];

const AFFILIATE_COLUMNS: DataTableColumn<ShopeeAffiliatePerformance>[] = [
  { key: "affiliateName", header: "Affiliate", cellClassName: "font-medium text-[#14213D]", sortAccessor: (a) => a.affiliateName, cell: (a) => a.affiliateName },
  { key: "clicks", header: "Clicks", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (a) => a.clicks, cell: (a) => formatNumber(a.clicks) },
  { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (a) => a.orders, cell: (a) => formatNumber(a.orders) },
  { key: "gmv", header: "GMV", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (a) => a.gmv, cell: (a) => formatIdrCompact(a.gmv) },
  { key: "commission", header: "Komisi", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (a) => a.commission, cell: (a) => formatIdrCompact(a.commission) },
];

export function AdsSection({
  totals,
  trend,
  campaigns,
  affiliates,
}: {
  totals: AdsTotals;
  trend: AdsDayPoint[];
  campaigns: AdsCampaignRollup[];
  affiliates: ShopeeAffiliatePerformance[];
}) {
  const tiles = [
    { label: "Cost", value: formatIdrCompact(totals.cost) },
    { label: "GMV", value: formatIdrCompact(totals.gmv) },
    { label: "ROAS", value: formatRoas(totals.roas) },
    { label: "Impressions", value: formatNumber(totals.impressions) },
    { label: "Clicks", value: formatNumber(totals.clicks) },
    { label: "CTR", value: formatPercent(totals.ctr) },
    { label: "Conversion Rate", value: formatPercent(totals.conversionRate) },
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {tiles.map((t) => (
          <div key={t.label} className="gfx-kpi">
            <div className="kpi-label">{t.label}</div>
            <div className="kpi-value">{t.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Tren Cost, GMV & ROAS</h2>
        <div className="mt-3">
          <Card>
            <TrendChart
              data={trend}
              series={[
                { key: "cost", name: "Cost", color: "#93C5FD", type: "bar", axis: "left" },
                { key: "gmv", name: "GMV", color: "#BFDBFE", type: "bar", axis: "left" },
                { key: "roas", name: "ROAS", color: "#2563EB", type: "line", axis: "right" },
              ]}
            />
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Campaign performance</h2>
        <div className="mt-3">
          <DataTable
            columns={CAMPAIGN_COLUMNS}
            rows={campaigns}
            rowKey={(c) => c.campaignId}
            initialSort={{ key: "cost", direction: "desc" }}
            minWidth={760}
            emptyMessage="Belum ada campaign."
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Affiliate & content performance</h2>
        <p className="gfx-section-desc mt-1">
          Kreator/affiliate yang paling nge-drive GMV lewat Shopee Ads — setara KOL untuk channel TikTok.
        </p>
        <div className="mt-3">
          <DataTable
            columns={AFFILIATE_COLUMNS}
            rows={affiliates}
            rowKey={(a) => a.affiliateId}
            initialSort={{ key: "gmv", direction: "desc" }}
            minWidth={560}
            emptyMessage="Belum ada data affiliate."
          />
        </div>
      </section>
    </>
  );
}
