import { Shop } from "@/lib/market-intel/types";
import { formatPct, formatNumber } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

function riskLabel(share: number): { label: string; color: string } {
  if (share >= 55) return { label: "Tinggi", color: "text-rose-600" };
  if (share >= 45) return { label: "Sedang", color: "text-amber-600" };
  return { label: "Rendah", color: "text-emerald-600" };
}

export function HeroSkuRisk({ shops }: { shops: Shop[] }) {
  // sort by top-3 concentration desc (riskiest first)
  const sorted = [...shops].sort((a, b) => b.top3RevenueShare - a.top3RevenueShare);

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr>
            <th className="gfx-th px-3 py-2">Brand</th>
            <th className="gfx-th px-3 py-2">Top-3 share</th>
            <th className="gfx-th px-3 py-2">Risiko konsentrasi</th>
            <th className="gfx-th px-3 py-2">Total SKU</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const risk = riskLabel(s.top3RevenueShare);
            return (
              <tr key={s.shopId} className={`gfx-row-border ${s.shopName === "Glow FX" ? "bg-[#EFF6FF]/40" : ""}`}>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#14213D]">{s.shopName}</span>
                    <GlowChip name={s.shopName} />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-32 overflow-hidden rounded-none bg-[#EDF3F8]">
                      <div
                        className={`h-full rounded-none ${
                          s.top3RevenueShare >= 55
                            ? "bg-gradient-to-r from-[#06B6D4] to-[#2563EB]"
                            : s.top3RevenueShare >= 45
                              ? "bg-gradient-to-r from-[#2563EB] to-[#0891B2]"
                              : "bg-gradient-to-r from-[#0891B2] to-[#BFDBFE]"
                        }`}
                        style={{ width: `${Math.min(100, s.top3RevenueShare)}%` }}
                      />
                    </div>
                    <span className="font-semibold text-[#14213D]">{formatPct(s.top3RevenueShare)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`font-semibold ${risk.color}`}>{risk.label}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(s.productNumber)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        Top-3 share = revenue 3 SKU terlaris ÷ total revenue (join shop/detail top3_product_ids
        dengan product/detail). Semakin tinggi = semakin bergantung ke hero SKU.
      </p>
    </div>
  );
}
