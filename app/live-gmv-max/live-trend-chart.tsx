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
import { LiveDayPoint } from "@/lib/live-gmv-max/aggregate";

export function LiveTrendChart({ data }: { data: LiveDayPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#7A8AA3]">
        Belum ada data untuk rentang ini.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#D6E1EC" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#7A8AA3" }} />
        <YAxis yAxisId="money" tick={{ fontSize: 12, fill: "#7A8AA3" }} />
        <YAxis yAxisId="roi" orientation="right" tick={{ fontSize: 12, fill: "#7A8AA3" }} />
        <Tooltip
          formatter={(value, name) => {
            const n = typeof value === "number" ? value : Number(value);
            if (name === "roi") return `${n.toFixed(2)}x`;
            if (name === "views") return n.toLocaleString("id-ID");
            return n.toLocaleString("en-US");
          }}
          contentStyle={{
            borderRadius: 0,
            border: "1px solid #DDE6F0",
            boxShadow: "0 8px 24px -12px rgba(240,70,109,0.15)",
            fontSize: 12,
          }}
        />
        <Legend />
        <Bar yAxisId="money" dataKey="cost" name="Cost" fill="var(--chart-cost, #93C5FD)" radius={4} />
        <Bar
          yAxisId="money"
          dataKey="grossRevenue"
          name="Gross Revenue"
          fill="var(--chart-revenue, #BFDBFE)"
          radius={4}
        />
        <Line
          yAxisId="roi"
          type="monotone"
          dataKey="roi"
          name="ROI"
          stroke="var(--chart-roi, #2563EB)"
          strokeWidth={2.5}
          dot={{ r: 2, fill: "#2563EB" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
