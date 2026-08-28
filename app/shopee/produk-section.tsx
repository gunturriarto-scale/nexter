import { ParetoRow } from "@/lib/shopee/aggregate";
import { ShopeeProduct } from "@/lib/shopee/types";
import { formatIdrCompact, formatNumber } from "@/lib/shopee/format";
import { ProductStatusChip } from "@/app/shopee/ui";

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
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr>
                {["Produk", "Kategori", "Harga", "Stok", "Views", "Terjual", "Revenue", "Rating", "Status"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.itemId} className="gfx-row-border align-top">
                  <td className="px-3 py-2">
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
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{p.categoryName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(p.price)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(p.stock)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(p.views)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(p.unitsSold)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatIdrCompact(p.revenue)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">⭐ {p.ratingStar.toFixed(1)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <ProductStatusChip status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Pareto revenue — full</h2>
        <p className="gfx-section-desc mt-1">
          Cumulative % revenue per produk, diurutkan dari terbesar — versi lengkap dari ringkasan di tab
          Eksekutif.
        </p>
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr>
                {["#", "Produk", "Revenue", "% Cumulative"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pareto.map((row, i) => (
                <tr key={row.product.itemId} className="gfx-row-border">
                  <td className="whitespace-nowrap px-3 py-2 text-[#7A8AA3]">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-[#14213D]">{row.product.itemName}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatIdrCompact(row.revenue)}</td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-none bg-[#EDF3F8]">
                        <div
                          className="h-full bg-gradient-to-r from-[#2563EB] to-[#0891B2]"
                          style={{ width: `${Math.min(row.cumulativePct, 100)}%` }}
                        />
                      </div>
                      <span className="text-[#4B5D78]">{row.cumulativePct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
