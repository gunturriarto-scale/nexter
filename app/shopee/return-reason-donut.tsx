"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#f0466d", "#8154b6", "#ec5932", "#f6a7bc", "#aaa0d3", "#f7b8aa", "#c4c2f2"];

const REASON_LABEL: Record<string, string> = {
  NONRECEIPT: "Barang Tidak Sampai",
  WRONG_ITEM: "Barang Salah",
  ITEM_DAMAGED: "Barang Rusak",
  DIFF_DESC: "Tidak Sesuai Deskripsi",
  CHANGE_MIND: "Berubah Pikiran",
  ITEM_FAKE: "Barang Tidak Original",
  EXPIRED_PRODUCT: "Produk Kedaluwarsa",
};

export function ReturnReasonDonut({ rows }: { rows: { reason: string; count: number }[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[#9d8a97]">Belum ada data retur.</div>
    );
  }
  const data = rows.map((r) => ({ ...r, label: REASON_LABEL[r.reason] ?? r.reason }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={60} outerRadius={95} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Tooltip contentStyle={{ borderRadius: 0, border: "1px solid #f0e4e9", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
