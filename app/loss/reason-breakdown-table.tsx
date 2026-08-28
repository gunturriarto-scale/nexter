"use client";

import { ReasonGroup } from "@/lib/loss/aggregate";
import { formatCurrency2, formatNumber } from "@/lib/loss/format";
import { DataTable, type DataTableColumn } from "@/components/data-table";

export function ReasonBreakdownTable({ reasons, totalRefund }: { reasons: ReasonGroup[]; totalRefund: number }) {
  const columns: DataTableColumn<ReasonGroup>[] = [
    { key: "reasonText", header: "Alasan", cellClassName: "font-medium text-[#14213D]", sortAccessor: (r) => r.reasonText, cell: (r) => r.reasonText },
    { key: "count", header: "Jumlah", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (r) => r.count, cell: (r) => formatNumber(r.count) },
    { key: "refundTotal", header: "Total refund", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (r) => r.refundTotal, cell: (r) => formatCurrency2(r.refundTotal) },
    {
      key: "share",
      header: "Share",
      sortAccessor: (r) => r.refundTotal,
      cell: (r) => {
        const pct = totalRefund > 0 ? (r.refundTotal / totalRefund) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-none bg-[#EDF3F8]">
              <div className="h-full rounded-none bg-gradient-to-r from-[#2563EB] to-[#0891B2]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-[#7A8AA3]">{pct.toFixed(0)}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={reasons}
      rowKey={(r) => r.reasonKey}
      initialSort={{ key: "refundTotal", direction: "desc" }}
      minWidth={560}
      emptyMessage="Belum ada data."
    />
  );
}
