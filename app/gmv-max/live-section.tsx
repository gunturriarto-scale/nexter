import { Livestream } from "@/lib/gmv-max/types";
import { formatCurrency, formatDateTime, formatNumber, formatRoi } from "@/lib/gmv-max/format";

export function LiveSection({ livestreams }: { livestreams: Livestream[] }) {
  if (livestreams.length === 0) {
    return <p className="text-sm text-[#9d8a97]">Tidak ada LIVE GMV Max untuk filter ini.</p>;
  }
  const sorted = [...livestreams].sort((a, b) => (a.liveStatus === "ONGOING" ? -1 : 1) - (b.liveStatus === "ONGOING" ? -1 : 1));
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {sorted.map((l) => (
        <div key={l.roomId} className="gfx-card gfx-card-hover p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-[#342d32]">{l.liveName}</p>
            {l.liveStatus === "ONGOING" ? (
              <span className="flex items-center gap-1.5 rounded-none bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-none bg-rose-500" />
                LIVE NOW
              </span>
            ) : (
              <span className="rounded-none bg-[#f7eef1] px-2 py-0.5 text-[11px] font-medium text-[#9d8a97]">
                Selesai
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#9d8a97]">
            {l.liveStatus === "ONGOING" ? "Mulai" : "Ditayangkan"} {formatDateTime(l.launchedTime)} · {l.durationMin} menit
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-[#9d8a97]">Cost</div>
              <div className="font-semibold text-[#342d32]">{formatCurrency(l.cost)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">Revenue</div>
              <div className="font-semibold text-[#342d32]">{formatCurrency(l.grossRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">ROI</div>
              <div className="font-semibold text-[#f0466d]">{formatRoi(l.roi)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">LIVE views</div>
              <div className="font-semibold text-[#342d32]">{formatNumber(l.liveViews)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">10s views</div>
              <div className="font-semibold text-[#342d32]">{formatNumber(l.views10s)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">Follows baru</div>
              <div className="font-semibold text-[#342d32]">{formatNumber(l.liveFollows)}</div>
            </div>
          </div>
          {l.allShopsGrossRevenue !== l.grossRevenue && (
            <p className="mt-2 text-[11px] text-[#9d8a97]">
              Termasuk produk shop lain di LIVE ini: {formatCurrency(l.allShopsGrossRevenue)} revenue, ROI {formatRoi(l.allShopsRoi)} (all shops).
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
