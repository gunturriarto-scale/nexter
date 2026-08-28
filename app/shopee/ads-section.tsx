import { AdsCampaignRollup, AdsDayPoint, AdsTotals } from "@/lib/shopee/aggregate";
import { ShopeeAffiliatePerformance } from "@/lib/shopee/types";
import { formatIdrCompact, formatNumber, formatPercent, formatRoas } from "@/lib/shopee/format";
import { Card } from "@/app/shopee/ui";
import { TrendChart } from "@/app/shopee/trend-chart";

const AD_TYPE_LABEL: Record<string, string> = { PRODUCT: "Product Ads", SHOP: "Shop Ads", KEYWORD: "Keyword Ads" };
const AD_STATUS_STYLE: Record<string, string> = {
  ONGOING: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  PAUSED: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  ENDED: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
  SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

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
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr>
                {["Campaign", "Tipe", "Status", "Cost", "GMV", "ROAS", "Impressions", "Clicks"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.campaignId} className="gfx-row-border">
                  <td className="px-3 py-2 font-medium text-[#14213D]">{c.campaignName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{AD_TYPE_LABEL[c.adType]}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span className={`rounded-none px-2 py-0.5 text-[11px] font-semibold ${AD_STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(c.cost)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(c.gmv)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatRoas(c.roas)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(c.impressions)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(c.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Affiliate & content performance</h2>
        <p className="gfx-section-desc mt-1">
          Kreator/affiliate yang paling nge-drive GMV lewat Shopee Ads — setara KOL untuk channel TikTok.
        </p>
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr>
                {["Affiliate", "Clicks", "Orders", "GMV", "Komisi"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {affiliates.map((a) => (
                <tr key={a.affiliateId} className="gfx-row-border">
                  <td className="px-3 py-2 font-medium text-[#14213D]">{a.affiliateName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(a.clicks)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(a.orders)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatIdrCompact(a.gmv)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(a.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
