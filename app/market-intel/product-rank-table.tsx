import { Product } from "@/lib/market-intel/types";
import {
  formatIdrCompact,
  formatNumber,
  formatPct,
  formatGrowthPct,
} from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";

export function ProductRankTable({ products }: { products: Product[] }) {
  const sorted = [...products].sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead>
          <tr>
            {[
              "Produk",
              "Brand",
              "Revenue (30 hari)",
              "Growth",
              "Harga",
              "Terjual",
              "Komisi",
              "Video rev.",
              "Live rev.",
              "Reviews",
            ].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr
              key={p.productId}
              className={`gfx-row-border ${p.shopName === "Glow FX" ? "bg-[#fdf0f3]/40" : ""}`}
            >
              <td className="px-3 py-2">
                <div className="font-semibold text-[#342d32]">{p.productName}</div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#6b5a66]">{p.shopName}</span>
                  <GlowChip name={p.shopName} />
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">
                {formatIdrCompact(p.revenue)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">
                {formatGrowthPct(p.revenueGrowthRate)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(p.unitPrice)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(p.salesVolumn)}</td>
              <td className="whitespace-nowrap px-3 py-2 font-medium text-[#8154b6]">
                {formatPct(p.commissionRate)}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(p.videoRevenue)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatIdrCompact(p.liveRevenue)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatNumber(p.productReviewCount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
