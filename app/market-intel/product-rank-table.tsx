"use client";

import { Product } from "@/lib/market-intel/types";
import { formatIdrCompact, formatNumber, formatPct, formatGrowthPct } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const COLUMNS: DataTableColumn<Product>[] = [
  { key: "productName", header: "Produk", sortAccessor: (p) => p.productName, cell: (p) => <div className="font-semibold text-[#14213D]">{p.productName}</div> },
  {
    key: "shopName",
    header: "Brand",
    sortAccessor: (p) => p.shopName,
    cell: (p) => (
      <div className="flex items-center gap-2">
        <span className="text-[#4B5D78]">{p.shopName}</span>
        <GlowChip name={p.shopName} />
      </div>
    ),
  },
  { key: "revenue", header: "Revenue (30 hari)", cellClassName: "whitespace-nowrap font-semibold text-[#14213D]", sortAccessor: (p) => p.revenue, cell: (p) => formatIdrCompact(p.revenue) },
  { key: "growth", header: "Growth", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.revenueGrowthRate, cell: (p) => formatGrowthPct(p.revenueGrowthRate) },
  { key: "unitPrice", header: "Harga", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.unitPrice, cell: (p) => formatIdrCompact(p.unitPrice) },
  { key: "salesVolumn", header: "Terjual", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.salesVolumn, cell: (p) => formatNumber(p.salesVolumn) },
  { key: "commissionRate", header: "Komisi", cellClassName: "whitespace-nowrap font-medium text-[#0891B2]", sortAccessor: (p) => p.commissionRate, cell: (p) => formatPct(p.commissionRate) },
  { key: "videoRevenue", header: "Video rev.", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.videoRevenue, cell: (p) => formatIdrCompact(p.videoRevenue) },
  { key: "liveRevenue", header: "Live rev.", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.liveRevenue, cell: (p) => formatIdrCompact(p.liveRevenue) },
  { key: "productReviewCount", header: "Reviews", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.productReviewCount, cell: (p) => formatNumber(p.productReviewCount) },
];

export function ProductRankTable({ products }: { products: Product[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={products}
      rowKey={(p) => p.productId}
      initialSort={{ key: "revenue", direction: "desc" }}
      minWidth={960}
      rowClassName={(p) => (p.shopName === "Glow FX" ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada produk untuk filter ini."
    />
  );
}
