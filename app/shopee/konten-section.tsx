import { ShopeeLivestreamSession, ShopeeVideo } from "@/lib/shopee/types";
import { formatDateTime, formatIdrCompact, formatNumber } from "@/lib/shopee/format";
import { Card } from "@/app/shopee/ui";
import { TrendChart } from "@/app/shopee/trend-chart";
import { sumField } from "@/lib/shopee/aggregate";

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
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr>
                {["Sesi", "Mulai", "Durasi", "Views", "GMV", "Orders"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {livestreams.map((l) => (
                <tr key={l.sessionId} className="gfx-row-border">
                  <td className="px-3 py-2 font-medium text-[#14213D]">{l.title}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatDateTime(l.startTime)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{l.durationMin} menit</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(l.views)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatIdrCompact(l.gmv)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(l.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 mb-4">
        <h2 className="gfx-section-title">Performa video</h2>
        <div className="gfx-table-wrap mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr>
                {["Video", "Dipublish", "Views", "Likes", "GMV", "Orders"].map((h) => (
                  <th key={h} className="gfx-th px-3 py-2">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v.videoId} className="gfx-row-border">
                  <td className="px-3 py-2 font-medium text-[#14213D]">{v.title}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatDateTime(v.publishTime)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(v.views)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(v.likes)}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#2563EB]">{formatIdrCompact(v.gmv)}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatNumber(v.orders)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
