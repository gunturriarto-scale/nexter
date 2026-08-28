import { ProductPerformanceRow } from "@/lib/kol/aggregate";
import { formatCompact, formatCurrency, formatPercent, formatRoi } from "@/lib/kol/format";

export function ProductPerformanceTable({ rows }: { rows: ProductPerformanceRow[] }) {
  const maxViews = Math.max(1, ...rows.map((r) => r.totalViews));

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr>
            {["Produk / SKU", "Jumlah Creator", "Total views", "Share views", "Avg. engagement", "Paid (GMV Max)"].map(
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
                Belum ada Creator dengan fokus produk spesifik untuk filter ini.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.productFocus} className="gfx-row-border">
              <td className="px-3 py-2 font-semibold text-[#14213D]">{r.productFocus}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{r.creatorCount}</td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{formatCompact(r.totalViews)}</td>
              <td className="px-3 py-2">
                <div className="h-2 w-24 overflow-hidden rounded-none bg-[#EDF3F8]">
                  <div
                    className="h-full rounded-none bg-gradient-to-r from-[#2563EB] to-[#0891B2]"
                    style={{ width: `${(r.totalViews / maxViews) * 100}%` }}
                  />
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
        Akun brand resmi (fokus &quot;Multi-produk&quot;) dikecualikan biar perbandingan antar SKU tidak
        timpang oleh akun brand sendiri.
      </p>
    </div>
  );
}
