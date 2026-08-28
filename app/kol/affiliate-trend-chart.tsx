"use client";

import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AffiliateTrendPoint } from "@/lib/kol/affiliate-types";

function compactIdr(value: number) {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function AffiliateTrendChart({ data }: { data: AffiliateTrendPoint[] }) {
  if (data.length === 0) return <div className="flex h-full items-center justify-center text-xs text-[#7A8AA3]">Belum ada data untuk filter ini.</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs><linearGradient id="affiliateGmvFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity={0.2} /><stop offset="100%" stopColor="#2563EB" stopOpacity={0.01} /></linearGradient></defs>
        <CartesianGrid stroke="#D9E3EE" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#71839B" }} tickLine={false} axisLine={{ stroke: "#D9E3EE" }} />
        <YAxis tickFormatter={compactIdr} tick={{ fontSize: 10, fill: "#71839B" }} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={(value, name) => [`Rp ${compactIdr(Number(value))}`, name === "gmv" ? "GMV" : "NMV"]} contentStyle={{ border: "1px solid #D9E3EE", borderRadius: 2, boxShadow: "0 8px 20px rgba(15,35,60,.08)", fontSize: 11 }} />
        <Area type="monotone" dataKey="gmv" stroke="none" fill="url(#affiliateGmvFill)" />
        <Line type="monotone" dataKey="gmv" stroke="#2563EB" strokeWidth={2.2} dot={false} />
        <Line type="monotone" dataKey="nmv" stroke="#22D3EE" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

