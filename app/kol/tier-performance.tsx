import { TierPerformanceRow } from "@/lib/kol/aggregate";
import { formatCompact, formatCurrency, formatPercent, formatRoi } from "@/lib/kol/format";
import { TIER_LABEL, TIER_RANGE_LABEL } from "@/lib/kol/tier";

export function TierPerformanceTable({ rows }: { rows: TierPerformanceRow[] }) {
  const maxViews = Math.max(1, ...rows.map((r) => r.totalViews));

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr>
            {["Tier", "Jumlah Creator", "Total views", "Share views", "Avg. engagement", "Paid (GMV Max)"].map(
              (h) => (
                <th key={h} className="gfx-th px-3 py-2">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={6}>
                Belum ada Creator untuk filter ini.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.tier} className="gfx-row-border">
              <td className="whitespace-nowrap px-3 py-2">
                <div className="font-semibold text-[#14213D]">{TIER_LABEL[r.tier]}</div>
                <div className="text-xs text-[#7A8AA3]">{TIER_RANGE_LABEL[r.tier]}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{r.creatorCount}</td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{formatCompact(r.totalViews)}</td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-none bg-[#EDF3F8]">
                    <div
                      className="h-full rounded-none bg-gradient-to-r from-[#2563EB] to-[#0891B2]"
                      style={{ width: `${(r.totalViews / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatPercent(r.avgEngagementRate)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                {r.paidCost !== null ? (
                  <span>
                    {formatCurrency(r.paidCost)} cost · {formatRoi(r.paidRoi ?? 0)} ROI
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
        Ambang tier (Nano &lt;10K, Micro 10K–50K, Mid 50K–500K, Macro 500K–1M, Mega 1M+) konvensi
        industri, bukan field resmi TikTok — sesuaikan kalau tim pakai batas lain.
      </p>
    </div>
  );
}
