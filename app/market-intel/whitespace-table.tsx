import { WhitespaceCell } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatPct, formatGrowthPct } from "@/lib/market-intel/format";

/** Opportunity score: size (normalized) + growth, penalized if Glow FX already present. */
function score(cell: WhitespaceCell): number {
  const sizeScore = cell.marketSize / 1e9; // in billions
  const growthScore = cell.growth;
  const presencePenalty = cell.glowPresent ? -15 : 0;
  return sizeScore + growthScore * 0.5 + presencePenalty;
}

export function WhitespaceTable({ cells }: { cells: WhitespaceCell[] }) {
  const scored = [...cells].sort((a, b) => score(b) - score(a));
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr>
            {["Kategori", "Market size", "Growth", "Glow FX hadir?", "Revenue Glow FX", "Opportunity"].map(
              (h) => (
                <th key={h} className="gfx-th px-3 py-2">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {scored.map((c) => {
            const high = score(c) >= 40;
            const mid = score(c) >= 25 && score(c) < 40;
            return (
              <tr key={c.categoryName} className="gfx-row-border">
                <td className="px-3 py-2 font-semibold text-[#342d32]">{c.categoryName}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(c.marketSize)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatGrowthPct(c.growth)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {c.glowPresent ? (
                    <span className="rounded-none bg-[#fdf0f3] px-2 py-0.5 text-[11px] font-semibold text-[#f0466d]">
                      ✓ Ya
                    </span>
                  ) : (
                    <span className="rounded-none bg-[#f7eef1] px-2 py-0.5 text-[11px] font-medium text-[#9d8a97]">
                      ✗ Belum
                    </span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                  {c.glowRevenue > 0 ? formatIdrCompact(c.glowRevenue) : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span
                    className={`rounded-none px-2 py-0.5 text-[11px] font-semibold ${
                      high
                        ? "bg-emerald-100 text-emerald-800"
                        : mid
                          ? "bg-amber-100 text-amber-800"
                          : "bg-[#f7eef1] text-[#9d8a97]"
                    }`}
                  >
                    {high ? "Tinggi" : mid ? "Sedang" : "Rendah"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-[#f7eef1] px-3 py-2 text-[11px] text-[#9d8a97]">
        Opportunity = size + growth, dikurangi kalau Glow FX sudah hadir. Kategori dengan growth tinggi
        tapi "✗ Belum" = whitespace yang bisa dimasuki. Sumber: category/rank + product/rank.
      </p>
    </div>
  );
}
