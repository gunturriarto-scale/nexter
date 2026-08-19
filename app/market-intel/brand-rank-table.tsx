import { Shop } from "@/lib/market-intel/types";
import { rankShops, revenueMix, RankedShop } from "@/lib/market-intel/aggregate";
import {
  formatIdrCompact,
  formatNumber,
  formatPct,
  formatGrowthPct,
} from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

function MixBar({ shop }: { shop: Shop }) {
  const mix = revenueMix(shop);
  const seg = [
    { label: "Affiliate", pct: mix.affiliatePct, color: "#f0466d" },
    { label: "Self", pct: mix.selfPct, color: "#8154b6" },
    { label: "Mall", pct: mix.mallPct, color: "#c4c2f2" },
  ];
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-none bg-[#f7eef1]">
        {seg.map((s) => (
          <div key={s.label} style={{ width: `${s.pct}%`, background: s.color }} />
        ))}
      </div>
      <div className="mt-1 flex gap-3 text-[10px] text-[#9d8a97]">
        {seg.map((s) => (
          <span key={s.label}>
            {s.label} {formatPct(s.pct)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BrandRankTable({ shops }: { shops: Shop[] }) {
  const ranked = rankShops(shops);

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead>
          <tr>
            {[
              "#",
              "Brand",
              "Revenue (30 hari)",
              "Growth",
              "Sales volume",
              "Avg. harga",
              "Revenue mix",
              "Kreator",
              "Produk",
            ].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ranked.map((s: RankedShop) => (
            <tr
              key={s.shopId}
              className={`gfx-row-border ${s.shopName === "Glow FX" ? "bg-[#fdf0f3]/40" : ""}`}
            >
              <td className="px-3 py-2 font-serif text-lg font-semibold text-[#8154b6]">{s.rank}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#342d32]">{s.shopName}</span>
                  <GlowChip name={s.shopName} />
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">
                {formatIdrCompact(s.revenue)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                {formatGrowthPct(s.revenueGrowthRate)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                {formatNumber(s.salesVolumn)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                {formatIdrCompact(s.unitPrice)}
              </td>
              <td className="px-3 py-2">
                <MixBar shop={s} />
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(s.creatorNumber)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(s.productNumber)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
