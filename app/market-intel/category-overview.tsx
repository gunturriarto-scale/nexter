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
                <td className="px-3 py-2 font-semibold text-[#14213D]">{c.categoryName}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-none bg-[#EDF3F8]">
                      <div
                        className="h-full rounded-none bg-gradient-to-r from-[#2563EB] to-[#0891B2]"
                        style={{ width: `${(c.revenue / maxRev) * 100}%` }}
                      />
                    </div>
                    <span className="whitespace-nowrap font-semibold text-[#14213D]">
                      {formatIdrCompact(c.revenue)}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                  {formatGrowthPct(c.revenueGrowthRate)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatPct(videoPct)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatPct(livePct)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                  {formatPct(c.top3ShopRevenueRatio)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(c.shopNumber)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(c.activeProductNumber)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        Share video/live = porsi revenue kategori dari video vs live commerce. Top-3 shop conc. =
        seberapa terkonsentrasi pasar (rendah = fragmented, lebih mudah masuk). Sumber: category/rank +
        category/detail.
      </p>
    </div>
  );
}
