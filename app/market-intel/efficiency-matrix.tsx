"use client";

import { useMemo } from "react";
import { Shop } from "@/lib/market-intel/types";
import { buildEfficiency, EfficiencyRow } from "@/lib/market-intel/aggregate";
import { formatIdrCompact } from "@/lib/market-intel/format";
import { GlowChip } from "@/app/market-intel/ui";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const METRICS: { key: keyof EfficiencyRow; label: string; hint: string }[] = [
  { key: "revenuePerCreator", label: "Rev / kreator", hint: "revenue ÷ creator_number" },
  { key: "revenuePerProduct", label: "Rev / produk", hint: "revenue ÷ product_number" },
  { key: "revenuePerVideo", label: "Rev / video", hint: "revenue ÷ video_number" },
  { key: "revenuePerLive", label: "Rev / live", hint: "revenue ÷ live_number" },
];

export function EfficiencyMatrix({ shops }: { shops: Shop[] }) {
  const rows = useMemo(() => buildEfficiency(shops), [shops]);

  const columns = useMemo<DataTableColumn<EfficiencyRow>[]>(() => {
    const bestByMetric = new Map<string, number>();
    for (const metric of METRICS) {
      bestByMetric.set(metric.key, Math.max(0, ...rows.map((r) => (r[metric.key] as number) || 0)));
    }
    return [
      {
        key: "shopName",
        header: "Brand",
        sortAccessor: (r) => r.shopName,
        cell: (r) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#14213D]">{r.shopName}</span>
            <GlowChip name={r.shopName} />
          </div>
        ),
      },
      ...METRICS.map<DataTableColumn<EfficiencyRow>>((metric) => ({
        key: metric.key,
        header: <span title={metric.hint}>{metric.label}</span>,
        cellClassName: "whitespace-nowrap",
        sortAccessor: (r) => r[metric.key] as number,
        cell: (r) => {
          const value = r[metric.key] as number;
          const best = value > 0 && value === bestByMetric.get(metric.key);
          return (
            <>
              <span className={`font-medium ${best ? "text-emerald-700" : "text-[#4B5D78]"}`}>{formatIdrCompact(value)}</span>
              {best && <span className="ml-1 text-[10px] text-emerald-600">★</span>}
            </>
          );
        },
      })),
    ];
  }, [rows]);

  return (
    <DataTable
      columns={columns}
      rows={rows}
      rowKey={(r) => r.shopName}
      initialSort={{ key: "revenuePerCreator", direction: "desc" }}
      minWidth={760}
      rowClassName={(r) => (r.isGlow ? "bg-[#EFF6FF]/40" : undefined)}
      emptyMessage="Belum ada data efisiensi."
      note="★ = tertinggi di benchmark. Rasio tinggi = efisien per unit channel; Glow FX di-highlight. Kolom ini derived dari field shop/detail (revenue ÷ jumlah channel), bukan field API mentah."
    />
  );
}
