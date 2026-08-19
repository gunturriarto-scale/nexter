import { CampaignRollup } from "@/lib/gmv-max/aggregate";
import { formatCurrency, formatPercentDelta, formatRoi } from "@/lib/gmv-max/format";
import { OperationStatusChip, RoiProtectionChip } from "@/app/gmv-max/ui";

export function CampaignTable({ rollups }: { rollups: CampaignRollup[] }) {
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead>
          <tr>
            {["Campaign", "Tipe", "Mode", "Status", "Budget", "Target ROI", "ROI aktual", "vs target", "Cost", "Revenue", "Orders", "ROI protection"].map(
              (h) => (
                <th key={h} className="gfx-th px-3 py-2">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rollups.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#9d8a97]" colSpan={12}>
                Belum ada campaign untuk filter ini.
              </td>
            </tr>
          )}
          {rollups.map((r) => {
            const c = r.campaign;
            const isMaxDelivery = c.bidType === "NO_BID";
            const budget = isMaxDelivery ? c.maxDeliveryBudget : c.dailyBudget;
            const deltaColor =
              r.roiVsTargetPct === null
                ? "text-neutral-500"
                : r.roiVsTargetPct >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400";
            return (
              <tr key={c.campaignId} className="gfx-row-border">
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">{c.campaignName}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#9d8a97]">
                  {c.promotionType === "PRODUCT_GMV_MAX" ? "Product" : "LIVE"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#9d8a97]">
                  {isMaxDelivery ? "Max delivery" : "Target ROI"}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <OperationStatusChip status={c.operationStatus} />
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCurrency(budget)}/hari</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{isMaxDelivery ? "—" : formatRoi(c.roasBid)}</td>
                <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#342d32]">{formatRoi(r.roi)}</td>
                <td className={`whitespace-nowrap px-3 py-2 font-medium ${deltaColor}`}>
                  {r.roiVsTargetPct === null ? "—" : formatPercentDelta(r.roi, c.roasBid)}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCurrency(r.cost)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{formatCurrency(r.grossRevenue)}</td>
                <td className="whitespace-nowrap px-3 py-2 text-[#6b5a66]">{r.orders}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <RoiProtectionChip status={c.roiProtectionStatus} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
