import { Creator } from "@/lib/market-intel/benchmark-types";
import { formatIdrCompact, formatCompact, formatGrowthPct, formatPct } from "@/lib/market-intel/format";

function brandColor(brand: string): string {
  const map: Record<string, string> = {
    "Glow FX": "#2563EB",
    Somethinc: "#0891B2",
    Hanasui: "#06B6D4",
    Scarlett: "#60A5FA",
    Whitelab: "#7A8AA3",
    Azarine: "#93C5FD",
  };
  return map[brand] ?? "#7A8AA3";
}

function engLevel(er: number): { label: string; color: string } {
  if (er >= 12) return { label: "Tinggi", color: "text-emerald-600" };
  if (er >= 8) return { label: "Sedang", color: "text-amber-600" };
  return { label: "Rendah", color: "text-[#7A8AA3]" };
}

export function CreatorBenchmark({ creators }: { creators: Creator[] }) {
  const sorted = [...creators].sort((a, b) => b.revenue - a.revenue);
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr>
            {["Kreator", "Brand", "Tipe", "GMV", "Growth", "Followers", "Views", "Engagement", "Video rev.", "Live rev."].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const eng = engLevel(c.engagementRate);
            return (
              <tr key={c.creatorId} className={`gfx-row-border ${c.affiliatedBrand === "Glow FX" ? "bg-[#EFF6FF]/40" : ""}`}>
                <td className="px-3 py-2">
                  <div className="font-semibold text-[#14213D]">{c.creatorNickname}</div>
                  <div className="text-xs text-[#7A8AA3]">{c.creatorHandle}</div>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-none" style={{ background: brandColor(c.affiliatedBrand) }} />
                    <span className="text-[#4B5D78]">{c.affiliatedBrand}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`rounded-none px-2 py-0.5 text-[10px] font-medium ${c.creatorStatus === "INDEPENDENT" ? "bg-blue-100 text-blue-800" : "bg-violet-100 text-violet-800"}`}>
                    {c.creatorStatus === "INDEPENDENT" ? "Independent" : "Brand-owned"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{formatIdrCompact(c.revenue)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatGrowthPct(c.revenueGrowthRate)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(c.creatorFollowers)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(c.contentViews)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`font-semibold ${eng.color}`}>{formatPct(c.engagementRate)}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(c.videoRevenue)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(c.liveRevenue)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        Sumber: creator/rank + creator/detail. Independent = kreator luar, brand-owned = akun resmi brand.
        Engagement: tinggi ≥12%, sedang 8–12%.
      </p>
    </div>
  );
}
