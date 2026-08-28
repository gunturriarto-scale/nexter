import { Livestream } from "@/lib/gmv-max/types";
import { formatCurrency, formatDateTime, formatNumber, formatRoi } from "@/lib/gmv-max/format";

export function LiveSection({ livestreams }: { livestreams: Livestream[] }) {
  if (livestreams.length === 0) {
    return <p className="text-sm text-[#7A8AA3]">Tidak ada LIVE GMV Max untuk filter ini.</p>;
  }
  const sorted = [...livestreams].sort((a, b) => (a.liveStatus === "ONGOING" ? -1 : 1) - (b.liveStatus === "ONGOING" ? -1 : 1));
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {sorted.map((l) => (
        <div key={l.roomId} className="gfx-card gfx-card-hover p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-[#14213D]">{l.liveName}</p>
            {l.liveStatus === "ONGOING" ? (
              <span className="flex items-center gap-1.5 rounded-none bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-none bg-rose-500" />
                LIVE NOW
              </span>
            ) : (
              <span className="rounded-none bg-[#EDF3F8] px-2 py-0.5 text-[11px] font-medium text-[#7A8AA3]">
                Selesai
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[#7A8AA3]">
            {l.liveStatus === "ONGOING" ? "Mulai" : "Ditayangkan"} {formatDateTime(l.launchedTime)} · {l.durationMin} menit
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs text-[#7A8AA3]">Cost</div>
              <div className="font-semibold text-[#14213D]">{formatCurrency(l.cost)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">Revenue</div>
              <div className="font-semibold text-[#14213D]">{formatCurrency(l.grossRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">ROI</div>
              <div className="font-semibold text-[#2563EB]">{formatRoi(l.roi)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">LIVE views</div>
              <div className="font-semibold text-[#14213D]">{formatNumber(l.liveViews)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">10s views</div>
              <div className="font-semibold text-[#14213D]">{formatNumber(l.views10s)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">Follows baru</div>
              <div className="font-semibold text-[#14213D]">{formatNumber(l.liveFollows)}</div>
            </div>
          </div>
          {l.allShopsGrossRevenue !== l.grossRevenue && (
            <p className="mt-2 text-[11px] text-[#7A8AA3]">
              Termasuk produk shop lain di LIVE ini: {formatCurrency(l.allShopsGrossRevenue)} revenue, ROI {formatRoi(l.allShopsRoi)} (all shops).
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
