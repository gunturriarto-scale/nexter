import { Campaign } from "@/lib/gmv-max/types";
import { formatCurrency, formatRoi } from "@/lib/gmv-max/format";

export function BudgetAutomationPanel({ campaigns }: { campaigns: Campaign[] }) {
  const relevant = campaigns.filter((c) => c.autoBudget.enabled || c.promotionDays?.enabled);
  if (relevant.length === 0) {
    return (
      <p className="text-sm text-[#9d8a97]">
        Tidak ada campaign dengan auto-budget atau promotion days aktif di filter ini.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {relevant.map((c) => {
        const pct = c.autoBudget.enabled
          ? Math.min(100, (c.autoBudget.currentBudget / c.autoBudget.maximumBudget) * 100)
          : 0;
        return (
          <div key={c.campaignId} className="gfx-card p-4">
            <p className="font-semibold text-[#342d32]">{c.campaignName}</p>
            {c.autoBudget.enabled && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-[#9d8a97]">
                  <span>Budget saat ini: {formatCurrency(c.autoBudget.currentBudget)}</span>
                  <span>Maksimum: {formatCurrency(c.autoBudget.maximumBudget)}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-none bg-[#f7eef1]">
                  <div
                    className="h-full rounded-none bg-gradient-to-r from-[#f0466d] to-[#8154b6]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[#9d8a97]">
                  Naik otomatis +{c.autoBudget.budgetIncreasePercentage}% tiap kali target ROI tercapai ≥90% & budget
                  terpakai ≥80% — sisa {c.autoBudget.remainedTimes}x kenaikan hari ini.
                </p>
              </div>
            )}
            {c.promotionDays?.enabled && (
              <p className="mt-2 rounded-none bg-[#f5effb] px-2 py-1.5 text-xs font-medium text-[#8154b6]">
                Promotion days aktif: target ROI turun ke {formatRoi(c.promotionDays.adjustedRoasBid)} (dari{" "}
                {formatRoi(c.roasBid)}), estimasi kenaikan gross revenue {c.promotionDays.estimatedGrossRevenueIncrease}.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
