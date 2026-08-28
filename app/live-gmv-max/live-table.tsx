"use client";

import { useMemo } from "react";
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
import { DataTable, type DataTableColumn } from "@/components/data-table";

export function LiveTable({
  sessions,
  campaigns,
}: {
  sessions: LiveSession[];
  campaigns: LiveCampaign[];
}) {
  const columns = useMemo<DataTableColumn<LiveSession>[]>(() => {
    const campaignById = new Map(campaigns.map((c) => [c.campaignId, c]));
    return [
      {
        key: "live",
        header: "LIVE",
        sortAccessor: (s) => s.liveName,
        cell: (s) => (
          <>
            <div className="font-semibold text-[#14213D]">{s.liveName}</div>
            <div className="text-xs text-[#7A8AA3]">{s.ttAccountName}</div>
          </>
        ),
      },
      {
        key: "campaign",
        header: "Campaign",
        cellClassName: "text-[#7A8AA3]",
        sortAccessor: (s) => s.campaignName,
        cell: (s) => {
          const camp = campaignById.get(s.campaignId);
          return (
            <>
              <div className="font-semibold text-[#4B5D78]">{s.campaignName}</div>
              {camp && <OperationStatusChip status={camp.operationStatus} />}
            </>
          );
        },
      },
      { key: "status", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (s) => s.liveStatus, cell: (s) => <LiveStatusBadge status={s.liveStatus} /> },
      {
        key: "mode",
        header: "Mode",
        cellClassName: "whitespace-nowrap",
        sortAccessor: (s) => campaignById.get(s.campaignId)?.bidType ?? "",
        cell: (s) => {
          const camp = campaignById.get(s.campaignId);
          return camp ? <BidTypeChip bidType={camp.bidType} /> : null;
        },
      },
      { key: "launchedTime", header: "Mulai", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.launchedTime, cell: (s) => formatDateTime(s.launchedTime) },
      { key: "durationMin", header: "Durasi", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.durationMin, cell: (s) => formatDurationMin(s.durationMin) },
      { key: "cost", header: "Cost", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (s) => s.cost, cell: (s) => formatCurrency(s.cost) },
      { key: "grossRevenue", header: "Revenue", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.grossRevenue, cell: (s) => formatCurrency(s.grossRevenue) },
      { key: "roi", header: "ROI", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (s) => s.roi, cell: (s) => formatRoi(s.roi) },
      { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.orders, cell: (s) => formatNumber(s.orders) },
      { key: "liveViews", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.liveViews, cell: (s) => formatCompact(s.liveViews) },
      { key: "views10s", header: "10s views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.views10s, cell: (s) => formatCompact(s.views10s) },
      { key: "liveFollows", header: "Follows", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (s) => s.liveFollows, cell: (s) => formatNumber(s.liveFollows) },
      {
        key: "roiProtection",
        header: "ROI protection",
        cellClassName: "whitespace-nowrap",
        sortAccessor: (s) => campaignById.get(s.campaignId)?.roiProtectionStatus ?? "",
        cell: (s) => {
          const camp = campaignById.get(s.campaignId);
          return camp ? <RoiProtectionChip status={camp.roiProtectionStatus} /> : null;
        },
      },
    ];
  }, [campaigns]);

  return (
    <DataTable
      columns={columns}
      rows={sessions}
      rowKey={(s) => s.roomId}
      initialSort={{ key: "cost", direction: "desc" }}
      minWidth={1080}
      emptyMessage="Belum ada LIVE GMV Max untuk filter ini."
    />
  );
}
