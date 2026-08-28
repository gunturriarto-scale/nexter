import { BreakoutRow } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatGrowthPct } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

export function BreakoutRadar({ rows }: { rows: BreakoutRow[] }) {
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead>
          <tr>
            {["Produk", "Brand", "Growth", "Revenue (30 hari)", "Status"].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.productName} className={`gfx-row-border ${r.isGlow ? "bg-[#EFF6FF]/40" : ""}`}>
              <td className="px-3 py-2 font-semibold text-[#14213D]">{r.productName}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5D78]">{r.shopName}</span>
                  <GlowChip name={r.shopName} />
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <span className={`font-semibold ${r.growth >= 25 ? "text-emerald-700" : "text-[#4B5D78]"}`}>
                  {formatGrowthPct(r.growth)}
                </span>
                {r.growth >= 25 && <span className="ml-1">🔥</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(r.revenue)}</td>
              <td className="whitespace-nowrap px-3 py-2">
                {r.isNew ? (
                  <span className="rounded-none bg-[#EEF4FF] px-2 py-0.5 text-[11px] font-semibold text-[#0891B2]">
                    Baru (&lt;90 hari)
                  </span>
                ) : (
                  <span className="text-[#91A0B5]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        🔥 = growth ≥25%. Diurutkan by growth. Produk &quot;Baru&quot; = launch &lt;90 hari. Sumber: product/rank
        (sort=revenue_growth_rate) + product/detail (launch_date).
      </p>
    </div>
  );
}
