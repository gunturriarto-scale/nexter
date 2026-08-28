"use client";

import { BrandRollup } from "@/lib/gmv-max/aggregate";
import { formatCurrency, formatNumber, formatRoi } from "@/lib/gmv-max/format";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const COLUMNS: DataTableColumn<BrandRollup>[] = [
  { key: "brand", header: "Brand", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (b) => b.brand, cell: (b) => b.brand },
  { key: "activeCampaign", header: "Campaign aktif", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (b) => b.activeCampaignCount, cell: (b) => `${b.activeCampaignCount}/${b.campaignCount}` },
  { key: "cost", header: "Cost", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (b) => b.cost, cell: (b) => formatCurrency(b.cost) },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (b) => b.grossRevenue, cell: (b) => formatCurrency(b.grossRevenue) },
  { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (b) => b.orders, cell: (b) => formatNumber(b.orders) },
  { key: "roi", header: "ROI", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (b) => b.roi, cell: (b) => formatRoi(b.roi) },
];

export function BrandRollupTable({ rollups }: { rollups: BrandRollup[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={rollups}
      rowKey={(b) => b.brand}
      initialSort={{ key: "cost", direction: "desc" }}
      minWidth={640}
      emptyMessage="Belum ada data brand untuk filter ini."
    />
  );
}
