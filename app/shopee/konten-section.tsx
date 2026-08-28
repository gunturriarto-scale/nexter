"use client";

import { ShopeeLivestreamSession, ShopeeVideo } from "@/lib/shopee/types";
import { formatDateTime, formatIdrCompact, formatNumber } from "@/lib/shopee/format";
import { Card } from "@/app/shopee/ui";
import { TrendChart } from "@/app/shopee/trend-chart";
import { sumField } from "@/lib/shopee/aggregate";
import { DataTable, type DataTableColumn } from "@/components/data-table";

const LIVE_COLUMNS: DataTableColumn<ShopeeLivestreamSession>[] = [
  { key: "title", header: "Sesi", cellClassName: "font-medium text-[#14213D]", sortAccessor: (l) => l.title, cell: (l) => l.title },
  { key: "startTime", header: "Mulai", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.startTime, cell: (l) => formatDateTime(l.startTime) },
  { key: "durationMin", header: "Durasi", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.durationMin, cell: (l) => `${l.durationMin} menit` },
  { key: "views", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.views, cell: (l) => formatNumber(l.views) },
  { key: "gmv", header: "GMV", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (l) => l.gmv, cell: (l) => formatIdrCompact(l.gmv) },
  { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (l) => l.orders, cell: (l) => formatNumber(l.orders) },
];

const VIDEO_COLUMNS: DataTableColumn<ShopeeVideo>[] = [
  { key: "title", header: "Video", cellClassName: "font-medium text-[#14213D]", sortAccessor: (v) => v.title, cell: (v) => v.title },
  { key: "publishTime", header: "Dipublish", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.publishTime, cell: (v) => formatDateTime(v.publishTime) },
  { key: "views", header: "Views", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.views, cell: (v) => formatNumber(v.views) },
  { key: "likes", header: "Likes", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.likes, cell: (v) => formatNumber(v.likes) },
  { key: "gmv", header: "GMV", cellClassName: "whitespace-nowrap font-semibold text-[#2563EB]", sortAccessor: (v) => v.gmv, cell: (v) => formatIdrCompact(v.gmv) },
  { key: "orders", header: "Orders", cellClassName: "whitespace-nowrap text-[#4B5D78]", sortAccessor: (v) => v.orders, cell: (v) => formatNumber(v.orders) },
];

export function KontenSection({
  livestreams,
  videos,
}: {
  livestreams: ShopeeLivestreamSession[];
  videos: ShopeeVideo[];
}) {
  const tiles = [
    { label: "Total Sesi Live", value: formatNumber(livestreams.length) },
    { label: "Live Views", value: formatNumber(sumField(livestreams, (l) => l.views)) },
    { label: "Live GMV", value: formatIdrCompact(sumField(livestreams, (l) => l.gmv)) },
    { label: "Total Video", value: formatNumber(videos.length) },
    { label: "Video Views", value: formatNumber(sumField(videos, (v) => v.views)) },
    { label: "Video GMV", value: formatIdrCompact(sumField(videos, (v) => v.gmv)) },
  ];

  const trend = [...livestreams]
    .sort((a, b) => (a.startTime < b.startTime ? -1 : 1))
    .map((l) => ({ day: l.startTime.slice(0, 10), liveGmv: l.gmv, videoGmv: 0 }));

  return (
    <>
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="gfx-kpi">
            <div className="kpi-label">{t.label}</div>
            <div className="kpi-value">{t.value}</div>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Tren GMV live</h2>
        <div className="mt-3">
          <Card>
            <TrendChart
              data={trend}
              series={[{ key: "liveGmv", name: "Live GMV", color: "#2563EB", type: "bar", axis: "left" }]}
            />
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="gfx-section-title">Sesi livestream</h2>
        <div className="mt-3">
          <DataTable
            columns={LIVE_COLUMNS}
            rows={livestreams}
            rowKey={(l) => l.sessionId}
            initialSort={{ key: "gmv", direction: "desc" }}
            minWidth={680}
            emptyMessage="Belum ada sesi livestream."
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Performa video</h2>
        <div className="mt-3">
          <DataTable
            columns={VIDEO_COLUMNS}
            rows={videos}
            rowKey={(v) => v.videoId}
            initialSort={{ key: "gmv", direction: "desc" }}
            minWidth={680}
            emptyMessage="Belum ada video."
          />
        </div>
      </section>
    </>
  );
}
