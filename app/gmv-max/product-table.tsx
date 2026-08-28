"use client";

import { Product } from "@/lib/gmv-max/types";
import { formatCurrency, formatRoi } from "@/lib/gmv-max/format";
import { Avatar } from "@/app/gmv-max/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const COLUMNS: DataTableColumn<Product>[] = [
  {
    key: "productName",
    header: "Produk",
    sortAccessor: (p) => p.productName,
    cell: (p) => (
      <div className="flex items-center gap-2">
        <Avatar seed={p.productImageSeed} label={p.productName} size={32} />
        <span className="font-semibold text-[#14213D]">{p.productName}</span>
      </div>
    ),
  },
  { key: "cost", header: "Cost", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.cost, cell: (p) => formatCurrency(p.cost) },
  { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.orders, cell: (p) => p.orders },
  { key: "grossRevenue", header: "Revenue", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.grossRevenue, cell: (p) => formatCurrency(p.grossRevenue) },
  { key: "roi", header: "ROI", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (p) => p.roi, cell: (p) => formatRoi(p.roi) },
];

export function ProductTable({ products }: { products: Product[] }) {
  return (
    <DataTable
      columns={COLUMNS}
      rows={products}
      rowKey={(p) => p.itemGroupId + p.campaignId}
      initialSort={{ key: "cost", direction: "desc" }}
      minWidth={560}
      emptyMessage="Belum ada produk untuk filter ini."
    />
  );
}
