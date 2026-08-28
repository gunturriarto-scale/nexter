import { Livestream } from "@/lib/market-intel/benchmark-types";
import { formatIdrCompact, formatCompact, formatNumber, formatDuration } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

/** GPM is small (thousands), needs finer granularity than formatIdrCompact. */
function formatGpm(gpm: number): string {
  return `Rp ${Math.round(gpm).toLocaleString("id-ID")}`;
}

function formatMsDuration(ms: number): string {
  const min = Math.round(ms / 60000);
  return formatDuration(min);
}

export function LivestreamBenchmark({ lives }: { lives: Livestream[] }) {
  const sorted = [...lives].sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead>
          <tr>
            {["Livestream", "Brand", "Revenue", "Viewers", "GPM", "Durasi", "Produk", "Avg. harga"].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((l) => (
            <tr key={l.livestreamId} className={`gfx-row-border ${l.affiliatedBrand === "Glow FX" ? "bg-[#EFF6FF]/40" : ""}`}>
              <td className="px-3 py-2">
                <div className="font-semibold text-[#14213D]">{l.livestreamTitle}</div>
                <div className="text-xs text-[#7A8AA3]">{l.creatorHandle}</div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#4B5D78]">{l.affiliatedBrand}</span>
                  <GlowChip name={l.affiliatedBrand} />
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{formatIdrCompact(l.revenue)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(l.viewers)}</td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatGpm(l.gpm)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatMsDuration(l.livestreamDuration * 1000)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(l.productNumber)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(l.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        GPM = revenue per 1000 viewers. Sumber: livestream/rank + livestream/detail. Benchmark strategi
        live kompetitor — durasi, produk yang dijual, dan efisiensi per viewer.
      </p>
    </div>
  );
}
