import { Shop } from "@/lib/market-intel/types";
import { revenueMix } from "@/lib/market-intel/aggregate";
import { formatPct, formatIdrCompact } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

export function ChannelMix({ shops }: { shops: Shop[] }) {
  // sort by affiliate % desc (most affiliate-dependent first)
  const sorted = [...shops].sort((a, b) => revenueMix(b).affiliatePct - revenueMix(a).affiliatePct);

  return (
    <div className="space-y-4">
      {sorted.map((s) => {
        const mix = revenueMix(s);
        const seg = [
          { label: "Affiliate", pct: mix.affiliatePct, color: "#f0466d", value: s.affiliateRevenue },
          { label: "Self-operated", pct: mix.selfPct, color: "#8154b6", value: s.selfAccountRevenue },
          { label: "Mall", pct: mix.mallPct, color: "#c4c2f2", value: s.shoppingMallRevenue },
        ];
        return (
          <div key={s.shopId} className={`rounded-none p-3 ${s.shopName === "Glow FX" ? "bg-[#fdf0f3]/40 ring-1 ring-[#f6a7bc]/40" : "bg-white ring-1 ring-[#f0e4e9]"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#342d32]">{s.shopName}</span>
                <GlowChip name={s.shopName} />
              </div>
              <span className="text-xs text-[#9d8a97]">{formatIdrCompact(s.revenue)}</span>
            </div>
            <div className="mt-2 flex h-3 w-full overflow-hidden rounded-none bg-[#f7eef1]">
              {seg.map((g) => (
                <div key={g.label} style={{ width: `${g.pct}%`, background: g.color }} title={`${g.label} ${formatPct(g.pct)}`} />
              ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-[#6b5a66]">
              {seg.map((g) => (
                <span key={g.label} className="inline-flex items-center gap-1">
                  <span className="inline-block h-2 w-2 rounded-none" style={{ background: g.color }} />
                  {g.label} {formatPct(g.pct)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-[#9d8a97]">
        Sumber: shop/detail — affiliate_revenue, self_account_revenue, shopping_mall_revenue.
        Diurutkan by porsi affiliate tertinggi.
      </p>
    </div>
  );
}
