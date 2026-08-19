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
    return <p className="text-sm text-[#9d8a97]">Tidak ada LIVE GMV Max untuk filter ini.</p>;
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
            l.liveStatus === "ONGOING" ? "ring-2 ring-[#f0466d]/40" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-[#342d32]">{l.liveName}</p>
              <p className="mt-0.5 truncate text-xs text-[#9d8a97]">{l.campaignName}</p>
            </div>
            <LiveStatusBadge status={l.liveStatus} />
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-[#9d8a97]">
            <span className="font-medium text-[#8154b6]">{l.ttAccountName}</span>
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
              <div className="text-xs text-[#9d8a97]">Views</div>
              <div className="font-semibold text-[#342d32]">{formatCompact(l.liveViews)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">10s views</div>
              <div className="font-semibold text-[#342d32]">{formatCompact(l.views10s)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">Follows</div>
              <div className="font-semibold text-[#342d32]">{formatNumber(l.liveFollows)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">Orders</div>
              <div className="font-semibold text-[#342d32]">{formatNumber(l.orders)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">Cost/order</div>
              <div className="font-semibold text-[#342d32]">{formatCurrency(l.costPerOrder)}</div>
            </div>
            <div>
              <div className="text-xs text-[#9d8a97]">Net cost</div>
              <div className="font-semibold text-[#342d32]">{formatCurrency(l.netCost)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
