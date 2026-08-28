"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ReferenceLine,
} from "recharts";
import { Shop } from "@/lib/market-intel/types";
import { buildQuadrant } from "@/lib/market-intel/aggregate";
import { formatIdrCompact } from "@/lib/market-intel/format";

const BRAND_COLORS: Record<string, string> = {
  "Glow FX": "#2563EB",
  Hanasui: "#0891B2",
  Somethinc: "#60A5FA",
  Scarlett: "#06B6D4",
  Whitelab: "#7A8AA3",
  Azarine: "#93C5FD",
};

export function GrowthSizeQuadrant({ shops }: { shops: Shop[] }) {
  const points = buildQuadrant(shops).map((p) => ({
    ...p,
    revenueM: p.revenue / 1e6, // scale to millions for bubble radius
  }));
  const avgGrowth =
    points.reduce((a, p) => a + p.growth, 0) / Math.max(1, points.length);
  const avgRevenue =
    points.reduce((a, p) => a + p.revenueM, 0) / Math.max(1, points.length);

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 24, right: 24, bottom: 16, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#D6E1EC" />
          <XAxis
            type="number"
            dataKey="revenueM"
            name="Revenue"
            tick={{ fontSize: 11, fill: "#7A8AA3" }}
            tickFormatter={(v) => formatIdrCompact(Number(v) * 1e6)}
            label={{ value: "Revenue (30 hari) →", position: "insideBottom", offset: -8, fontSize: 11, fill: "#7A8AA3" }}
          />
          <YAxis
            type="number"
            dataKey="growth"
            name="Growth"
            tick={{ fontSize: 11, fill: "#7A8AA3" }}
            tickFormatter={(v) => `${v}%`}
            label={{ value: "Growth %", angle: -90, position: "insideLeft", fontSize: 11, fill: "#7A8AA3" }}
          />
          <ZAxis type="number" dataKey="revenueM" range={[120, 900]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "Revenue") return formatIdrCompact(Number(value) * 1e6);
              return `${value}%`;
            }}
            contentStyle={{
              borderRadius: 0,
              border: "1px solid #DDE6F0",
              boxShadow: "0 8px 24px -12px rgba(240,70,109,0.15)",
              fontSize: 12,
            }}
          />
          {/* quadrant divider lines at the benchmark averages */}
          <ReferenceLine y={avgGrowth} stroke="#BFDBFE" strokeDasharray="4 4" />
          <ReferenceLine x={avgRevenue} stroke="#BFDBFE" strokeDasharray="4 4" />
          <Scatter data={points} fillOpacity={0.9}>
            <LabelList
              dataKey="shopName"
              position="top"
              style={{ fontSize: 11, fontWeight: 600, fill: "#14213D" }}
            />
          </Scatter>
          {/* Glow FX as a highlighted bubble */}
          <Scatter
            data={points.filter((p) => p.isGlow)}
            fill="#2563EB"
            stroke="#2563EB"
            strokeWidth={2}
            fillOpacity={0.85}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

export { BRAND_COLORS };
