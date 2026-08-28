import { Product } from "@/lib/gmv-max/types";
import { formatCurrency, formatRoi } from "@/lib/gmv-max/format";
import { Avatar } from "@/app/gmv-max/ui";

export function ProductTable({ products }: { products: Product[] }) {
  const sorted = [...products].sort((a, b) => b.cost - a.cost);
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr>
            {["Produk", "Cost", "Orders", "Revenue", "ROI"].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={5}>
                Belum ada produk untuk filter ini.
              </td>
            </tr>
          )}
          {sorted.map((p) => (
            <tr key={p.itemGroupId + p.campaignId} className="gfx-row-border">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar seed={p.productImageSeed} label={p.productName} size={32} />
                  <span className="font-semibold text-[#14213D]">{p.productName}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCurrency(p.cost)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{p.orders}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCurrency(p.grossRevenue)}</td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatRoi(p.roi)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
