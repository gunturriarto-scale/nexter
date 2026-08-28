"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface SeriesSpec {
  key: string;
  name: string;
  color: string;
  type: "bar" | "line";
  axis?: "left" | "right";
}

/** Generic dual-axis trend chart reused across Executive (GMV/Orders), Ads
 * (Cost/GMV/ROAS) and Returns (Orders/Returns rate) trend sections. */
export function TrendChart({
  data,
  series,
  xKey = "day",
}: {
  data: Record<string, number | string>[];
  series: SeriesSpec[];
  xKey?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#7A8AA3]">
        Belum ada data untuk rentang ini.
      </div>
    );
  }

  const hasRight = series.some((s) => s.axis === "right");

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#D6E1EC" />
        <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#7A8AA3" }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#7A8AA3" }} />
        {hasRight && <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#7A8AA3" }} />}
        <Tooltip
          contentStyle={{
            borderRadius: 0,
            border: "1px solid #DDE6F0",
            boxShadow: "0 8px 24px -12px rgba(240,70,109,0.15)",
            fontSize: 12,
          }}
        />
        <Legend />
        {series.map((s) =>
          s.type === "bar" ? (
            <Bar
              key={s.key}
              yAxisId={s.axis === "right" ? "right" : "left"}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              radius={4}
            />
          ) : (
            <Line
              key={s.key}
              yAxisId={s.axis === "right" ? "right" : "left"}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 2, fill: s.color }}
            />
          )
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
