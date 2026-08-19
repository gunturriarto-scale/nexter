"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { DayPoint } from "@/lib/gmv-max/aggregate";

export function RoiTrendChart({ data }: { data: DayPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#9d8a97]">
        Belum ada data untuk rentang ini.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#eadfe4" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9d8a97" }} />
        <YAxis yAxisId="cost" tick={{ fontSize: 12, fill: "#9d8a97" }} />
        <YAxis yAxisId="roi" orientation="right" tick={{ fontSize: 12, fill: "#9d8a97" }} />
        <Tooltip
          formatter={(value, name) => {
            const n = typeof value === "number" ? value : Number(value);
            return name === "roi" ? `${n.toFixed(2)}x` : n.toFixed(0);
          }}
          contentStyle={{
            borderRadius: 0,
            border: "1px solid #f0e4e9",
            boxShadow: "0 8px 24px -12px rgba(240,70,109,0.15)",
            fontSize: 12,
          }}
        />
        <Legend />
        <Bar yAxisId="cost" dataKey="cost" name="Cost" fill="var(--chart-cost, #f6a7bc)" radius={4} />
        <Bar
          yAxisId="cost"
          dataKey="grossRevenue"
          name="Gross Revenue"
          fill="var(--chart-revenue, #c4c2f2)"
          radius={4}
        />
        <Line
          yAxisId="roi"
          type="monotone"
          dataKey="roi"
          name="ROI"
          stroke="var(--chart-roi, #f0466d)"
          strokeWidth={2.5}
          dot={{ r: 2, fill: "#f0466d" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
