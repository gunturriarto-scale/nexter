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
} from "recharts";
import { Shop } from "@/lib/market-intel/types";
import { buildPositioning } from "@/lib/market-intel/aggregate";
import { formatIdrCompact } from "@/lib/market-intel/format";

export function PricePositioningMap({ shops }: { shops: Shop[] }) {
  const points = buildPositioning(shops).map((p) => ({
    ...p,
    priceRb: p.unitPrice / 1000, // in thousands (Rb)
    revenueM: p.revenue / 1e6,
  }));

  return (
    <div className="h-[340px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="#D6E1EC" />
          <XAxis
            type="number"
            dataKey="priceRb"
            name="Avg. harga"
            tick={{ fontSize: 11, fill: "#7A8AA3" }}
            tickFormatter={(v) => `Rp ${v} Rb`}
            label={{ value: "Avg. harga (posisi) →", position: "insideBottom", offset: -12, fontSize: 11, fill: "#7A8AA3" }}
          />
          <YAxis
            type="number"
            dataKey="revenueM"
            name="Revenue"
            tick={{ fontSize: 11, fill: "#7A8AA3" }}
            tickFormatter={(v) => formatIdrCompact(Number(v) * 1e6)}
            label={{ value: "Revenue", angle: -90, position: "insideLeft", fontSize: 11, fill: "#7A8AA3" }}
          />
          <ZAxis type="number" dataKey="revenueM" range={[150, 800]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            formatter={(value, name) => {
              if (name === "Avg. harga") return `Rp ${Number(value) * 1000}`;
              if (name === "Revenue") return formatIdrCompact(Number(value) * 1e6);
              return value;
            }}
            contentStyle={{
              borderRadius: 0,
              border: "1px solid #DDE6F0",
              boxShadow: "0 8px 24px -12px rgba(240,70,109,0.15)",
              fontSize: 12,
            }}
          />
          <Scatter data={points.filter((p) => !p.isGlow)} fill="#BFDBFE" fillOpacity={0.85}>
            <LabelList dataKey="shopName" position="top" style={{ fontSize: 11, fontWeight: 600, fill: "#14213D" }} />
          </Scatter>
          <Scatter data={points.filter((p) => p.isGlow)} fill="#2563EB" stroke="#2563EB" strokeWidth={2} fillOpacity={0.9}>
            <LabelList dataKey="shopName" position="top" style={{ fontSize: 11, fontWeight: 700, fill: "#2563EB" }} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
