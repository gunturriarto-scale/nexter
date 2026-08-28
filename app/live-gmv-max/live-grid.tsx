import { LiveSession } from "@/lib/live-gmv-max/types";
import {
  formatCompact,
  formatCurrency,
  formatDateTime,
  formatDurationMin,
  formatNumber,
  formatRoi,
} from "@/lib/live-gmv-max/format";
import { LiveStatusBadge } from "@/app/live-gmv-max/ui";

export function LiveGrid({ sessions }: { sessions: LiveSession[] }) {
  if (sessions.length === 0) {
    return <p className="text-sm text-[#7A8AA3]">Tidak ada LIVE GMV Max untuk filter ini.</p>;
  }
  // ONGOING first, then END
  const sorted = [...sessions].sort((a, b) => {
    if (a.liveStatus === b.liveStatus) return 0;
    return a.liveStatus === "ONGOING" ? -1 : 1;
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sorted.map((l) => (
        <div
          key={l.roomId}
          className={`gfx-card gfx-card-hover p-4 ${
            l.liveStatus === "ONGOING" ? "ring-2 ring-[#2563EB]/40" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#14213D]">{l.liveName}</p>
              <p className="mt-0.5 truncate text-xs text-[#7A8AA3]">{l.campaignName}</p>
            </div>
            <LiveStatusBadge status={l.liveStatus} />
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-[#7A8AA3]">
            <span className="font-medium text-[#0891B2]">{l.ttAccountName}</span>
            <span>·</span>
            <span>
              {l.liveStatus === "ONGOING" ? "Mulai" : "Ditayangkan"}{" "}
              {formatDateTime(l.launchedTime)}
            </span>
            <span>·</span>
            <span>{formatDurationMin(l.durationMin)}</span>
          </div>

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
              <div className="text-xs text-[#7A8AA3]">Views</div>
              <div className="font-semibold text-[#14213D]">{formatCompact(l.liveViews)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">10s views</div>
              <div className="font-semibold text-[#14213D]">{formatCompact(l.views10s)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">Follows</div>
              <div className="font-semibold text-[#14213D]">{formatNumber(l.liveFollows)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">Orders</div>
              <div className="font-semibold text-[#14213D]">{formatNumber(l.orders)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">Cost/order</div>
              <div className="font-semibold text-[#14213D]">{formatCurrency(l.costPerOrder)}</div>
            </div>
            <div>
              <div className="text-xs text-[#7A8AA3]">Net cost</div>
              <div className="font-semibold text-[#14213D]">{formatCurrency(l.netCost)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
