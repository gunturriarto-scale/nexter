import { MarketCategory } from "@/lib/market-intel/types";
import { formatIdrCompact, formatGrowthPct, formatNumber, formatPct } from "@/lib/market-intel/format";

export function CategoryOverview({ categories }: { categories: MarketCategory[] }) {
  const sorted = [...categories].sort((a, b) => b.revenue - a.revenue);
  const maxRev = Math.max(1, ...sorted.map((c) => c.revenue));

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr>
            {[
              "Kategori",
              "Market size",
              "Growth",
              "Share video",
              "Share live",
              "Top-3 shop conc.",
              "Jumlah shop",
              "Produk aktif",
            ].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const videoPct = (c.videoRevenue / Math.max(1, c.revenue)) * 100;
            const livePct = (c.liveRevenue / Math.max(1, c.revenue)) * 100;
            return (
              <tr key={c.categoryId} className="gfx-row-border">
                <td className="px-3 py-2 font-semibold text-[#342d32]">{c.categoryName}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-none bg-[#f7eef1]">
                      <div
                        className="h-full rounded-none bg-gradient-to-r from-[#f0466d] to-[#8154b6]"
                        style={{ width: `${(c.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-[#342d32]">
                      {formatIdrCompact(c.revenue)}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                  {formatGrowthPct(c.revenueGrowthRate)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatPct(videoPct)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatPct(livePct)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                  {formatPct(c.top3ShopRevenueRatio)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(c.shopNumber)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(c.activeProductNumber)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-[#f7eef1] px-3 py-2 text-[11px] text-[#9d8a97]">
        Share video/live = porsi revenue kategori dari video vs live commerce. Top-3 shop conc. =
        seberapa terkonsentrasi pasar (rendah = fragmented, lebih mudah masuk). Sumber: category/rank +
        category/detail.
      </p>
    </div>
  );
}
