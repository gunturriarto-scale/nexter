import { Shop } from "@/lib/market-intel/types";
import { buildEfficiency, EfficiencyRow } from "@/lib/market-intel/aggregate";
import { formatIdrCompact } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

/** Highlight the best value in each column (excluding Glow FX row). */
function isBest(rows: EfficiencyRow[], row: EfficiencyRow, key: keyof EfficiencyRow): boolean {
  if (typeof row[key] !== "number") return false;
  const best = Math.max(...rows.map((r) => (r[key] as number) || 0));
  return (row[key] as number) === best && (row[key] as number) > 0;
}

export function EfficiencyMatrix({ shops }: { shops: Shop[] }) {
  const rows = buildEfficiency(shops);
  const cols: { key: keyof EfficiencyRow; label: string; hint: string }[] = [
    { key: "revenuePerCreator", label: "Rev / kreator", hint: "revenue ÷ creator_number" },
    { key: "revenuePerProduct", label: "Rev / produk", hint: "revenue ÷ product_number" },
    { key: "revenuePerVideo", label: "Rev / video", hint: "revenue ÷ video_number" },
    { key: "revenuePerLive", label: "Rev / live", hint: "revenue ÷ live_number" },
  ];

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr>
            <th className="gfx-th px-3 py-2">Brand</th>
            {cols.map((c) => (
              <th key={c.key} className="gfx-th px-3 py-2" title={c.hint}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r: EfficiencyRow) => (
            <tr key={r.shopName} className={`gfx-row-border ${r.isGlow ? "bg-[#EFF6FF]/40" : ""}`}>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#14213D]">{r.shopName}</span>
                  <GlowChip name={r.shopName} />
                </div>
              </td>
              {cols.map((c) => {
                const best = isBest(rows, r, c.key);
                return (
                  <td key={c.key} className="whitespace-nowrap px-3 py-2">
                    <span className={`font-medium ${best ? "text-emerald-700" : "text-[#4B5D78]"}`}>
                      {formatIdrCompact(r[c.key] as number)}
                    </span>
                    {best && <span className="ml-1 text-[10px] text-emerald-600">★</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        ★ = tertinggi di benchmark. Rasio tinggi = efisien per unit channel; Glow FX di-highlight.
        Kolom ini derived dari field shop/detail (revenue ÷ jumlah channel), bukan field API mentah.
      </p>
    </div>
  );
}
