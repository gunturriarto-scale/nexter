"use client";

import { ParetoRow } from "@/lib/shopee/aggregate";
import { ShopeeProduct } from "@/lib/shopee/types";
import { formatIdrCompact, formatNumber } from "@/lib/shopee/format";
import { ProductStatusChip } from "@/app/shopee/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const PRODUCT_COLUMNS: DataTableColumn<ShopeeProduct>[] = [
  {
    key: "itemName",
    header: "Produk",
    sortAccessor: (p) => p.itemName,
    cell: (p) => (
      <>
        <div className="font-medium text-[#14213D]">{p.itemName}</div>
        <div className="text-xs text-[#7A8AA3]">{p.itemSku}</div>
        {p.models.length > 1 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {p.models.map((m) => (
              <span key={m.modelId} className="gfx-chip bg-[#EFF6FF] text-[#0891B2]">
                {m.modelName} · {m.stock}
              </span>
            ))}
          </div>
        )}
      </>
    ),
  },
  { key: "categoryName", header: "Kategori", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.categoryName, cell: (p) => p.categoryName },
  { key: "price", header: "Harga", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.price, cell: (p) => formatIdrCompact(p.price) },
  { key: "stock", header: "Stok", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.stock, cell: (p) => formatNumber(p.stock) },
  { key: "views", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.views, cell: (p) => formatNumber(p.views) },
  { key: "unitsSold", header: "Terjual", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.unitsSold, cell: (p) => formatNumber(p.unitsSold) },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (p) => p.revenue, cell: (p) => formatIdrCompact(p.revenue) },
  { key: "ratingStar", header: "Rating", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (p) => p.ratingStar, cell: (p) => `⭐ ${p.ratingStar.toFixed(1)}` },
  { key: "status", header: "Status", cellClassName: "whitespace-nowrap", sortAccessor: (p) => p.status, cell: (p) => <ProductStatusChip status={p.status} /> },
];

const PARETO_COLUMNS: DataTableColumn<ParetoRow>[] = [
  { key: "idx", header: "#", cellClassName: "whitespace-nowrap text-[#7A8AA3]", cell: (_row, index) => index + 1 },
  { key: "name", header: "Produk", cellClassName: "font-medium text-[#14213D]", sortAccessor: (row) => row.product.itemName, cell: (row) => row.product.itemName },
  { key: "revenue", header: "Revenue", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (row) => row.revenue, cell: (row) => formatIdrCompact(row.revenue) },
  {
    key: "cumulative",
    header: "% Cumulative",
    cellClassName: "whitespace-nowrap",
    sortAccessor: (row) => row.cumulativePct,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-none bg-[#EDF3F8]">
          <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#0891B2]" style={{ width: `${Math.min(row.cumulativePct, 100)}%` }} />
        </div>
        <span className="text-[#4B5D78]">{row.cumulativePct.toFixed(0)}%</span>
      </div>
    ),
  },
];

export function ProdukSection({
  products,
  pareto,
  lowStock,
}: {
  products: ShopeeProduct[];
  pareto: ParetoRow[];
  lowStock: ShopeeProduct[];
}) {
  const active = products.filter((p) => p.status === "NORMAL");
  const outOfStock = active.filter((p) => p.stock === 0);
  const needsUpdate = active.filter((p) => p.unitsSold === 0);
  const topPerformerThreshold = pareto.find((p) => p.cumulativePct >= 50)?.revenue ?? 0;
  const topPerformerCount = pareto.filter((p) => p.revenue >= topPerformerThreshold).length;

  const tiles = [
    { label: "Total SKU Aktif", value: formatNumber(active.length) },
    { label: "Stok Habis", value: formatNumber(outOfStock.length) },
    { label: "Perlu Update", value: formatNumber(needsUpdate.length) },
    { label: "Top Performer", value: formatNumber(topPerformerCount) },
  ];

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="gfx-kpi">
            <div className="kpi-label">{t.label}</div>
            <div className="kpi-value">{t.value}</div>
          </div>
        ))}
      </section>

      {lowStock.length > 0 && (
        <section className="mt-8">
          <h2 className="gfx-section-title">Stock alert ({lowStock.length})</h2>
          <p className="gfx-section-desc mt-1">SKU aktif dengan stok ≤15 unit — kandidat restock atau pause.</p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {lowStock.map((p) => (
              <div key={p.itemId} className="rounded-none border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
                <div className="font-medium">{p.itemName}</div>
                <p className="mt-1 opacity-90">
                  Stok tersisa {p.stock} unit · {p.itemSku}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="gfx-section-title">Performa produk</h2>
        <p className="gfx-section-desc mt-1">Diurutkan by revenue. Klik varian buat lihat stok per model.</p>
        <div className="mt-3">
          <DataTable
            columns={PRODUCT_COLUMNS}
            rows={products}
            rowKey={(p) => p.itemId}
            initialSort={{ key: "revenue", direction: "desc" }}
            minWidth={760}
            cellClassName="px-3 py-2 align-top"
            emptyMessage="Belum ada produk."
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Pareto revenue — full</h2>
        <p className="gfx-section-desc mt-1">
          Cumulative % revenue per produk, diurutkan dari terbesar — versi lengkap dari ringkasan di tab
          Eksekutif.
        </p>
        <div className="mt-3">
          <DataTable
            columns={PARETO_COLUMNS}
            rows={pareto}
            rowKey={(row) => row.product.itemId}
            minWidth={560}
            emptyMessage="Belum ada data."
          />
        </div>
      </section>
    </>
  );
}
