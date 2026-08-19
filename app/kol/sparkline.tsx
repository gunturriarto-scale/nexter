"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

export function ViewsSparkline({ data }: { data: { day: string; views: number }[] }) {
  if (data.length === 0) {
    return <div className="h-10 text-[11px] text-[#a895a1]">Belum ada data tren.</div>;
  }
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Tooltip
            formatter={(value) => [Number(value).toLocaleString("id-ID"), "views"]}
            labelFormatter={(label) => label}
            contentStyle={{
              fontSize: 11,
              padding: "4px 8px",
              borderRadius: 0,
              border: "1px solid #f0e4e9",
            }}
          />
          <Line type="monotone" dataKey="views" stroke="#f0466d" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
