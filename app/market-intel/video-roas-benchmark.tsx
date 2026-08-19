import { Video } from "@/lib/market-intel/benchmark-types";
import { formatIdrCompact, formatCompact, formatNumber, formatPct } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

function roasColor(roas: number): string {
  if (roas >= 4.5) return "text-emerald-600";
  if (roas >= 3.5) return "text-amber-600";
  return "text-rose-600";
}

export function VideoRoasBenchmark({ videos }: { videos: Video[] }) {
  // only ad videos have meaningful ROAS
  const ads = videos.filter((v) => v.isAd).sort((a, b) => b.adsRoas - a.adsRoas);
  const organic = videos.filter((v) => !v.isAd);

  return (
    <div className="space-y-4">
      <div className="gfx-table-wrap overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr>
              {["Video (iklan)", "Brand", "Revenue", "Views", "GPM", "Ads views", "Ads ROAS", "Likes"].map((h) => (
                <th key={h} className="gfx-th px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ads.map((v) => (
              <tr key={v.videoId} className={`gfx-row-border ${v.affiliatedBrand === "Glow FX" ? "bg-[#fdf0f3]/40" : ""}`}>
                <td className="px-3 py-2">
                  <div className="font-semibold text-[#342d32]">{v.videoTitle}</div>
                  <div className="text-xs text-[#9d8a97]">{v.belongedCreatorHandle} · {v.duration}s</div>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6b5a66]">{v.affiliatedBrand}</span>
                    <GlowChip name={v.affiliatedBrand} />
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">{formatIdrCompact(v.revenue)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(v.views)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(v.videoGpm)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(v.adsViews)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className={`font-bold ${roasColor(v.adsRoas)}`}>{v.adsRoas.toFixed(2)}x</span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(v.diggCount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {organic.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#9d8a97]">Video organik (tanpa ads)</div>
          <div className="gfx-table-wrap overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr>
                  {["Video (organik)", "Brand", "Revenue", "Views", "GPM", "Likes"].map((h) => (
                    <th key={h} className="gfx-th px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {organic.map((v) => (
                  <tr key={v.videoId} className={`gfx-row-border ${v.affiliatedBrand === "Glow FX" ? "bg-[#fdf0f3]/40" : ""}`}>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-[#342d32]">{v.videoTitle}</div>
                      <div className="text-xs text-[#9d8a97]">{v.belongedCreatorHandle}</div>
                    </td>
                    <td className="px-3 py-2 text-[#6b5a66]">{v.affiliatedBrand}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">{formatIdrCompact(v.revenue)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(v.views)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(v.videoGpm)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(v.diggCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="text-[11px] text-[#9d8a97]">
        Ads ROAS = revenue iklan ÷ cost. GPM = revenue per 1000 views. Sumber: video/rank (sort=ads_roas).
        Ini benchmark efisiensi konten iklan kompetitor.
      </p>
    </div>
  );
}
