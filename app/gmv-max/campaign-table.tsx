"use client";

import { CampaignRollup } from "@/lib/gmv-max/aggregate";
import { formatCurrency, formatPercentDelta, formatRoi } from "@/lib/gmv-max/format";
import { OperationStatusChip, RoiProtectionChip } from "@/app/gmv-max/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

function budgetOf(r: CampaignRollup): number {
  return r.campaign.bidType === "NO_BID" ? r.campaign.maxDeliveryBudget : r.campaign.dailyBudget;
}

const COLUMNS: DataTableColumn<CampaignRollup>[] = [
  { key: "campaign", header: "Campaign", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (r) => r.campaign.campaignName, cell: (r) => r.campaign.campaignName },
  { key: "type", header: "Tipe", cellClassName: "whitespace-nowrap text-[#7A8AA3]", sortAccessor: (r) => r.campaign.promotionType, cell: (r) => (r.campaign.promotionType === "PRODUCT_GMV_MAX" ? "Product" : "LIVE") },
  { key: "mode", header: "Mode", cellClassName: "whitespace-nowrap text-[#7A8AA3]", sortAccessor: (r) => r.campaign.bidType, cell: (r) => (r.campaign.bidType === "NO_BID" ? "Max delivery" : "Target ROI") },
  { key: "status", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (r) => r.campaign.operationStatus, cell: (r) => <OperationStatusChip status={r.campaign.operationStatus} /> },
  { key: "budget", header: "Budget", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => budgetOf(r), cell: (r) => `${formatCurrency(budgetOf(r))}/hari` },
  { key: "targetRoi", header: "Target ROI", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => (r.campaign.bidType === "NO_BID" ? null : r.campaign.roasBid), cell: (r) => (r.campaign.bidType === "NO_BID" ? "—" : formatRoi(r.campaign.roasBid)) },
  { key: "roi", header: "ROI aktual", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (r) => r.roi, cell: (r) => formatRoi(r.roi) },
  {
    key: "vsTarget",
    header: "vs target",
    sortAccessor: (r) => r.roiVsTargetPct,
    cellClassName: "whitespace-nowrap font-medium",
    cell: (r) => {
      const color = r.roiVsTargetPct === null ? "text-neutral-500" : r.roiVsTargetPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
      return <span className={color}>{r.roiVsTargetPct === null ? "—" : formatPercentDelta(r.roi, r.campaign.roasBid)}</span>;
    },
  },
  { key: "cost", header: "Cost", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.cost, cell: (r) => formatCurrency(r.cost) },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.grossRevenue, cell: (r) => formatCurrency(r.grossRevenue) },
  { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.orders, cell: (r) => r.orders },
  { key: "roiProtection", header: "ROI protection", cellClassName: "whitespace-nowrap", sortAccessor: (r) => r.campaign.roiProtectionStatus, cell: (r) => <RoiProtectionChip status={r.campaign.roiProtectionStatus} /> },
];

export function CampaignTable({ rollups }: { rollups: CampaignRollup[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rollups}
      rowKey={(r) => r.campaign.campaignId}
      initialSort={{ key: "cost", direction: "desc" }}
      minWidth={860}
      emptyMessage="Belum ada campaign untuk filter ini."
    />
  );
}
