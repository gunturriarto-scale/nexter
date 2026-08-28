"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Shop } from "@/lib/market-intel/types";
import { buildTrendSeries } from "@/lib/market-intel/aggregate";
import { formatIdrCompact } from "@/lib/market-intel/format";

const LINE_COLORS = ["#2563EB", "#0891B2", "#60A5FA", "#06B6D4", "#7A8AA3", "#93C5FD"];

export function RevenueTrendChart({ shops }: { shops: Shop[] }) {
  const data = buildTrendSeries(shops);
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#7A8AA3]">
        Belum ada data tren.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#D6E1EC" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#7A8AA3" }} />
        <YAxis tick={{ fontSize: 11, fill: "#7A8AA3" }} tickFormatter={(v) => formatIdrCompact(Number(v))} />
        <Tooltip
          formatter={(value) => formatIdrCompact(typeof value === "number" ? value : Number(value))}
          contentStyle={{
            borderRadius: 0,
            border: "1px solid #DDE6F0",
            boxShadow: "0 8px 24px -12px rgba(240,70,109,0.15)",
            fontSize: 12,
          }}
        />
        <Legend />
        {shops.map((s, i) => (
          <Line
            key={s.shopId}
            type="monotone"
            dataKey={s.shopName}
            stroke={LINE_COLORS[i % LINE_COLORS.length]}
            strokeWidth={s.shopName === "Glow FX" ? 3 : 2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
