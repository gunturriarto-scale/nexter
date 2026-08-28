import {
  AffiliateCollaborationSummary,
  AffiliateCreatorPerformance,
  AffiliateOrderSummary,
  AffiliateSampleApplication,
  AffiliateVideoPerformance,
} from "@/lib/kol/types";
import { formatCompact, formatNumber, formatPercent } from "@/lib/kol/format";
import { Avatar, TierBadge } from "@/app/kol/ui";

function rupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function StatusBadge({ value }: { value: string }) {
  const positive = ["COMPLETED", "FULFILLED", "NORMAL", "ONGOING"].includes(value);
  const warning = ["PROCESSING", "PENDING", "AWAITING_SHIPMENT", "SHIPPED"].includes(value);
  const tone = positive
    ? "bg-emerald-100 text-emerald-800"
    : warning
      ? "bg-amber-100 text-amber-800"
      : "bg-rose-100 text-rose-800";
  return <span className={`gfx-chip whitespace-nowrap ${tone}`}>{value.replaceAll("_", " ")}</span>;
}

function CreatorTable({ creators }: { creators: AffiliateCreatorPerformance[] }) {
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[1180px] text-left text-sm">
        <thead>
          <tr>
            {["Creator", "Follower", "GMV 30d", "Video / LIVE", "Units", "GPM", "Engagement", "Post rate", "Komisi", "PPS"].map((label) => (
              <th key={label} className="gfx-th px-3 py-2">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...creators].sort((a, b) => b.gmv - a.gmv).map((creator) => (
            <tr key={creator.creatorOpenId} className="gfx-row-border">
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <Avatar seed={creator.avatarSeed} label={creator.nickname} size={30} />
                  <div>
                    <div className="font-semibold text-[#14213D]">{creator.nickname}</div>
                    <div className="text-xs text-[#7A8AA3]">{creator.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-3"><TierBadge followerCount={creator.followerCount} /><div className="mt-1 text-xs text-[#4B5D78]">{formatCompact(creator.followerCount)}</div></td>
              <td className="px-3 py-3 font-semibold text-[#14213D]">{rupiah(creator.gmv)}</td>
              <td className="px-3 py-3"><span className="font-medium">{rupiah(creator.videoGmv)}</span><div className="text-xs text-[#7A8AA3]">LIVE {rupiah(creator.liveGmv)}</div></td>
              <td className="px-3 py-3">{formatNumber(creator.unitsSold)}</td>
              <td className="px-3 py-3">{rupiah(creator.gpm)}</td>
              <td className="px-3 py-3"><span className="font-medium">{formatPercent(creator.videoEngagementRate)}</span><div className="text-xs text-[#7A8AA3]">LIVE {formatPercent(creator.liveEngagementRate)}</div></td>
              <td className="px-3 py-3">{formatPercent(creator.postRate)}</td>
              <td className="px-3 py-3">{formatPercent(creator.avgCommissionRate)}</td>
              <td className="px-3 py-3"><span className="font-semibold text-[#0891B2]">{creator.pps.toFixed(1)}</span><div className="text-xs text-[#7A8AA3]">★ {creator.rating.toFixed(1)}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VideoTable({ videos }: { videos: AffiliateVideoPerformance[] }) {
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[920px] text-left text-sm">
        <thead><tr>{["Video", "Creator", "Views", "GMV", "GPM", "Orders", "Items", "CTR", "Produk"].map((label) => <th key={label} className="gfx-th px-3 py-2">{label}</th>)}</tr></thead>
        <tbody>
          {videos.map((video) => (
            <tr key={video.videoId} className="gfx-row-border">
              <td className="max-w-[260px] px-3 py-3"><div className="font-semibold text-[#14213D]">{video.title}</div><div className="text-[11px] text-[#7A8AA3]">ID {video.videoId}</div></td>
              <td className="px-3 py-3 font-medium">{video.username}</td>
              <td className="px-3 py-3">{formatCompact(video.views)}</td>
              <td className="px-3 py-3 font-semibold text-[#14213D]">{rupiah(video.gmv)}</td>
              <td className="px-3 py-3">{rupiah(video.gpm)}</td>
              <td className="px-3 py-3">{formatNumber(video.skuOrders)}</td>
              <td className="px-3 py-3">{formatNumber(video.itemsSold)}</td>
              <td className="px-3 py-3">{formatPercent(video.clickThroughRate)}</td>
              <td className="max-w-[220px] px-3 py-3 text-xs text-[#4B5D78]">{video.products.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CollaborationCards({ collaborations }: { collaborations: AffiliateCollaborationSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {collaborations.map((collab) => {
        const conversion = collab.invitedCreatorCount ? (collab.contentCreatorCount / collab.invitedCreatorCount) * 100 : null;
        return (
          <article key={collab.collaborationId} className="gfx-card p-4">
            <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0891B2]">{collab.type}</span><StatusBadge value={collab.status} /></div>
            <h3 className="mt-3 font-serif text-base font-semibold text-[#14213D]">{collab.name}</h3>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div><div className="text-lg font-bold">{collab.invitedCreatorCount ?? "Open"}</div><div className="text-[10px] uppercase text-[#7A8AA3]">Invited</div></div>
              <div><div className="text-lg font-bold">{collab.showcaseCreatorCount}</div><div className="text-[10px] uppercase text-[#7A8AA3]">Showcase</div></div>
              <div><div className="text-lg font-bold">{collab.contentCreatorCount}</div><div className="text-[10px] uppercase text-[#7A8AA3]">Posted</div></div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[#DDE6F0] pt-3 text-xs text-[#4B5D78]"><span>{collab.productCount} produk</span><span>{collab.hasFreeSample ? "Free sample" : "Tanpa sample"}</span>{conversion !== null && <span>{conversion.toFixed(0)}% posted</span>}</div>
          </article>
        );
      })}
    </div>
  );
}

function OperationsTables({ orders, samples }: { orders: AffiliateOrderSummary[]; samples: AffiliateSampleApplication[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#4B5D78]">Affiliate order &amp; commission</h3>
        <div className="gfx-table-wrap overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead><tr>{["Creator / Produk", "Konten", "Status", "Qty", "Return", "Sales base", "Komisi"].map((label) => <th key={label} className="gfx-th px-3 py-2">{label}</th>)}</tr></thead>
            <tbody>{orders.map((order) => <tr key={order.orderId} className="gfx-row-border"><td className="px-3 py-3"><div className="font-semibold text-[#14213D]">{order.creatorUsername}</div><div className="max-w-[180px] truncate text-[#7A8AA3]">{order.productName}</div></td><td className="px-3 py-3">{order.contentType}</td><td className="px-3 py-3"><StatusBadge value={order.status} /></td><td className="px-3 py-3">{formatNumber(order.quantity)}</td><td className="px-3 py-3">{order.returnedQuantity + order.refundedQuantity}</td><td className="px-3 py-3">{rupiah(order.commissionBase)}</td><td className="px-3 py-3"><span className="font-semibold">{rupiah(order.paidCommission)}</span><div className="text-[#7A8AA3]">{formatPercent(order.commissionRate)}</div></td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-[#4B5D78]">Sample application queue</h3>
        <div className="gfx-table-wrap overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead><tr>{["Creator / Produk", "Status", "Follower", "GMV 30d", "Median views", "Fulfillment", "Ship by"].map((label) => <th key={label} className="gfx-th px-3 py-2">{label}</th>)}</tr></thead>
            <tbody>{samples.map((sample) => <tr key={sample.applicationId} className="gfx-row-border"><td className="px-3 py-3"><div className="font-semibold text-[#14213D]">{sample.creatorUsername}</div><div className="max-w-[180px] truncate text-[#7A8AA3]">{sample.productName}</div></td><td className="px-3 py-3"><StatusBadge value={sample.status} /></td><td className="px-3 py-3">{formatCompact(sample.followerCount)}</td><td className="px-3 py-3">{rupiah(sample.creatorGmv30d)}</td><td className="px-3 py-3">{formatCompact(sample.medianShoppableVideoViews)}</td><td className="px-3 py-3">{formatPercent(sample.fulfillmentPercentage)}</td><td className="px-3 py-3 whitespace-nowrap">{new Date(sample.shipmentDeadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AffiliateOverview({
  creators,
  videos,
  orders,
  samples,
  collaborations,
}: {
  creators: AffiliateCreatorPerformance[];
  videos: AffiliateVideoPerformance[];
  orders: AffiliateOrderSummary[];
  samples: AffiliateSampleApplication[];
  collaborations: AffiliateCollaborationSummary[];
}) {
  const totalGmv = creators.reduce((sum, creator) => sum + creator.gmv, 0);
  const totalUnits = creators.reduce((sum, creator) => sum + creator.unitsSold, 0);
  const totalCommission = orders.reduce((sum, order) => sum + order.paidCommission, 0);
  const totalContent = videos.length;
  const pendingSamples = samples.filter((sample) => sample.status === "PENDING" || sample.status === "AWAITING_SHIPMENT").length;
  const returnUnits = orders.reduce((sum, order) => sum + order.returnedQuantity + order.refundedQuantity, 0);

  return (
    <section className="mt-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563EB]">Official OpenAPI data model</div>
          <h2 className="gfx-section-title mt-1">TikTok Shop Affiliate Overview</h2>
          <p className="gfx-section-desc mt-1">Mock data, tetapi seluruh kolom dipetakan ke Affiliate Seller dan Analytics OpenAPI.</p>
        </div>
        <div className="text-xs text-[#7A8AA3]">Periode mock: 30 hari terakhir · IDR</div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Creator GMV", value: rupiah(totalGmv), note: `${creators.length} creator` },
          { label: "Units sold", value: formatCompact(totalUnits), note: "Attributed" },
          { label: "Paid commission", value: rupiah(totalCommission), note: "Actual + estimated" },
          { label: "Shoppable video", value: formatNumber(totalContent), note: `${formatCompact(videos.reduce((s, v) => s + v.views, 0))} views` },
          { label: "Sample action", value: formatNumber(pendingSamples), note: "Pending / ship" },
          { label: "Return + refund", value: formatNumber(returnUnits), note: "Affiliate units" },
        ].map((kpi) => <div key={kpi.label} className="gfx-kpi"><div className="kpi-label">{kpi.label}</div><div className="kpi-value">{kpi.value}</div><div className="mt-1 text-[11px] text-[#7A8AA3]">{kpi.note}</div></div>)}
      </div>

      <div className="mt-8"><h3 className="gfx-section-title">Creator marketplace performance</h3><p className="gfx-section-desc mt-1">GMV, content split, commerce engagement, post rate, commission, PPS, dan seller rating.</p><div className="mt-3"><CreatorTable creators={creators} /></div></div>
      <div className="mt-8"><h3 className="gfx-section-title">Collaboration funnel</h3><p className="gfx-section-desc mt-1">Open collaboration dan target collaboration: invited → showcase → posted content.</p><div className="mt-3"><CollaborationCards collaborations={collaborations} /></div></div>
      <div className="mt-8"><h3 className="gfx-section-title">Shoppable video attribution</h3><p className="gfx-section-desc mt-1">Shop video performance: views, GMV, GPM, SKU orders, items sold, CTR, dan produk.</p><div className="mt-3"><VideoTable videos={videos} /></div></div>
      <div className="mt-8"><h3 className="gfx-section-title">Affiliate operations</h3><p className="gfx-section-desc mt-1">Pantau order commission dan antrean sample dalam satu operational view.</p><div className="mt-3"><OperationsTables orders={orders} samples={samples} /></div></div>
    </section>
  );
}
