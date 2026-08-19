import { LiveCampaign, LiveSession } from "@/lib/live-gmv-max/types";
import {
  formatCompact,
  formatCurrency,
  formatDateTime,
  formatDurationMin,
  formatNumber,
  formatRoi,
} from "@/lib/live-gmv-max/format";
import {
  BidTypeChip,
  LiveStatusBadge,
  OperationStatusChip,
  RoiProtectionChip,
} from "@/app/live-gmv-max/ui";

export function LiveTable({
  sessions,
  campaigns,
}: {
  sessions: LiveSession[];
  campaigns: LiveCampaign[];
}) {
  const campaignById = new Map(campaigns.map((c) => [c.campaignId, c]));
  // sort by cost desc
  const sorted = [...sessions].sort((a, b) => b.cost - a.cost);

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead>
          <tr>
            {[
              "LIVE",
              "Campaign",
              "Status",
              "Mode",
              "Mulai",
              "Durasi",
              "Cost",
              "Revenue",
              "ROI",
              "Orders",
              "Views",
              "10s views",
              "Follows",
              "ROI protection",
            ].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#9d8a97]" colSpan={14}>
                Belum ada LIVE GMV Max untuk filter ini.
              </td>
            </tr>
          )}
          {sorted.map((s) => {
            const camp = campaignById.get(s.campaignId);
            return (
              <tr key={s.roomId} className="gfx-row-border">
                <td className="px-3 py-2">
                  <div className="font-semibold text-[#342d32]">{s.liveName}</div>
                  <div className="text-xs text-[#9d8a97]">{s.ttAccountName}</div>
                </td>
                <td className="px-3 py-2 text-[#9d8a97]">
                  <div className="font-semibold text-[#6b5a66]">{s.campaignName}</div>
                  {camp && <OperationStatusChip status={camp.operationStatus} />}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <LiveStatusBadge status={s.liveStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {camp && <BidTypeChip bidType={camp.bidType} />}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                  {formatDateTime(s.launchedTime)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                  {formatDurationMin(s.durationMin)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">
                  {formatCurrency(s.cost)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                  {formatCurrency(s.grossRevenue)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#f0466d]">
                  {formatRoi(s.roi)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(s.orders)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(s.liveViews)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCompact(s.views10s)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(s.liveFollows)}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {camp && <RoiProtectionChip status={camp.roiProtectionStatus} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
