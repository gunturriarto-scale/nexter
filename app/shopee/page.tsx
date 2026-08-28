import Link from "next/link";
import {
  MOCK_ACCOUNT_HEALTH,
  MOCK_ADS_DAILY,
  MOCK_AFFILIATES,
  MOCK_LIVESTREAMS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_RETURNS,
  MOCK_VIDEOS,
} from "@/lib/shopee/mock-data";
import {
  adsDailySeries,
  buildActionableOrders,
  buildAlerts,
  buildLogisticsSummary,
  buildOrderStatusFunnel,
  buildProductPareto,
  buildReturnReasonBreakdown,
  computeExecutiveKpis,
  computeReturnKpis,
  gmvDailySeries,
  lowStockProducts,
  returnDailySeries,
  rollupAdsCampaigns,
  sumAds,
  topReturnedProducts,
} from "@/lib/shopee/aggregate";
import { OrderStatus } from "@/lib/shopee/types";
import { MockupBanner } from "@/app/shopee/ui";
import { RingkasanSection } from "@/app/shopee/ringkasan-section";
import { OrderSection } from "@/app/shopee/order-section";
import { ProdukSection } from "@/app/shopee/produk-section";
import { ReturSection } from "@/app/shopee/retur-section";
import { AdsSection } from "@/app/shopee/ads-section";
import { KontenSection } from "@/app/shopee/konten-section";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "ringkasan", label: "Ringkasan Eksekutif", icon: "📈" },
  { key: "order", label: "Order & Fulfillment", icon: "📦" },
  { key: "produk", label: "Produk", icon: "🛍️" },
  { key: "retur", label: "Returns & Refund", icon: "↩️" },
  { key: "ads", label: "Ads (AMS)", icon: "🎯" },
  { key: "konten", label: "Konten Live & Video", icon: "🎬" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function defaultDateRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 13 * 24 * 60 * 60 * 1000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

function shiftRange(from: string, to: string) {
  const fromD = new Date(from);
  const toD = new Date(to);
  const days = Math.round((toD.getTime() - fromD.getTime()) / 86400000) + 1;
  const prevTo = new Date(fromD.getTime() - 86400000);
  const prevFrom = new Date(prevTo.getTime() - (days - 1) * 86400000);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(prevFrom), to: iso(prevTo) };
}

const ORDER_STATUSES: OrderStatus[] = [
  "UNPAID",
  "PENDING",
  "READY_TO_SHIP",
  "PROCESSED",
  "SHIPPED",
  "TO_CONFIRM_RECEIVE",
  "COMPLETED",
  "CANCELLED",
  "TO_RETURN",
];

export default async function ShopeePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const tabParam = params.tab ?? "ringkasan";
  const activeTab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "ringkasan";

  const { from: defaultFrom, to: defaultTo } = defaultDateRange();
  const from = params.from || defaultFrom;
  const to = params.to || defaultTo;
  const prevRange = shiftRange(from, to);
  const statusFilter = ORDER_STATUSES.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : "";

  const inRange = (iso: string, f: string, t: string) => {
    const day = iso.slice(0, 10);
    return day >= f && day <= t;
  };

  const ordersInRange = MOCK_ORDERS.filter((o) => inRange(o.createTime, from, to));
  const ordersInPrevRange = MOCK_ORDERS.filter((o) => inRange(o.createTime, prevRange.from, prevRange.to));
  const returnsInRange = MOCK_RETURNS.filter((r) => inRange(r.createTime, from, to));
  const returnsInPrevRange = MOCK_RETURNS.filter((r) => inRange(r.createTime, prevRange.from, prevRange.to));
  const adsInRange = MOCK_ADS_DAILY.filter((r) => inRange(r.day, from, to));

  // Executive tab
  const executiveKpis = computeExecutiveKpis(ordersInRange, returnsInRange);
  const prevExecutiveKpis = computeExecutiveKpis(ordersInPrevRange, returnsInPrevRange);
  const gmvTrend = gmvDailySeries(ordersInRange);
  const paretoAll = buildProductPareto(MOCK_PRODUCTS);
  const adsRoas = sumAds(adsInRange).roas;
  const latestHealth = MOCK_ACCOUNT_HEALTH[MOCK_ACCOUNT_HEALTH.length - 1];
  const alerts = buildAlerts(executiveKpis, MOCK_ORDERS, MOCK_PRODUCTS, MOCK_ACCOUNT_HEALTH);

  // Order tab (operational — reflects current state, not the date filter)
  const funnel = buildOrderStatusFunnel(MOCK_ORDERS);
  const actionable = buildActionableOrders(MOCK_ORDERS);
  const logistics = buildLogisticsSummary(MOCK_ORDERS);
  const filteredOrders = (statusFilter ? MOCK_ORDERS.filter((o) => o.orderStatus === statusFilter) : MOCK_ORDERS).sort(
    (a, b) => (a.createTime < b.createTime ? 1 : -1)
  );

  // Produk tab
  const lowStock = lowStockProducts(MOCK_PRODUCTS);

  // Retur tab
  const returnKpis = computeReturnKpis(ordersInRange, returnsInRange);
  const reasonBreakdown = buildReturnReasonBreakdown(returnsInRange);
  const returnTrend = returnDailySeries(ordersInRange, returnsInRange);
  const topReturned = topReturnedProducts(MOCK_RETURNS, MOCK_ORDERS);

  // Ads tab
  const adsTotals = sumAds(adsInRange);
  const adsTrend = adsDailySeries(adsInRange);
  const adsCampaigns = rollupAdsCampaigns(adsInRange);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <MockupBanner />
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#14213D]">
        Shopee <span className="gfx-text-gradient">Command Center</span>
      </h1>
      <p className="mt-1 text-sm text-[#7A8AA3]">
        Order, produk, ads (AMS), retur, dan konten live/video Glow FX Beauty Official Shop — dalam satu
        layar. POV: leadership (ringkasan) dan operasional harian (order, produk, retur).
      </p>

      <form className="gfx-filter-bar mt-6 flex flex-wrap items-end gap-4 p-4">
        <input type="hidden" name="tab" value={activeTab} />
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Toko
          <select className="gfx-select mt-1" defaultValue="all" disabled>
            <option value="all">Glow FX Beauty Official Shop</option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Dari
          <input type="date" name="from" defaultValue={from} className="gfx-input mt-1" />
        </label>
        <label className="flex flex-col text-sm text-[#4B5D78]">
          Sampai
          <input type="date" name="to" defaultValue={to} className="gfx-input mt-1" />
        </label>
        <button type="submit" className="gfx-btn">
          Terapkan
        </button>
      </form>

      {/* Tab bar */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-[#DDE6F0]">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/shopee?tab=${t.key}&from=${from}&to=${to}`}
              className={`-mb-px rounded-none px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "border border-b-0 border-[#DDE6F0] bg-white text-[#2563EB]"
                  : "text-[#7A8AA3] hover:bg-[#EFF6FF] hover:text-[#14213D]"
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === "ringkasan" && (
          <RingkasanSection
            kpis={executiveKpis}
            prevKpis={prevExecutiveKpis}
            alerts={alerts}
            trend={gmvTrend}
            paretoTop10={paretoAll}
            adsRoas={adsRoas}
            health={latestHealth}
          />
        )}
        {activeTab === "order" && (
          <OrderSection
            funnel={funnel}
            actionable={actionable}
            logistics={logistics}
            orders={filteredOrders}
            statusFilter={statusFilter}
          />
        )}
        {activeTab === "produk" && <ProdukSection products={MOCK_PRODUCTS} pareto={paretoAll} lowStock={lowStock} />}
        {activeTab === "retur" && (
          <ReturSection
            kpis={returnKpis}
            reasons={reasonBreakdown}
            trend={returnTrend}
            returns={returnsInRange}
            topReturned={topReturned}
          />
        )}
        {activeTab === "ads" && (
          <AdsSection totals={adsTotals} trend={adsTrend} campaigns={adsCampaigns} affiliates={MOCK_AFFILIATES} />
        )}
        {activeTab === "konten" && <KontenSection livestreams={MOCK_LIVESTREAMS} videos={MOCK_VIDEOS} />}
      </div>
    </main>
  );
}
