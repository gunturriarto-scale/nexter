import { TrendingHashtag, TrendingSound } from "@/lib/kol/types";
import { formatCompact } from "@/lib/kol/format";

function GrowthBadge({ pct }: { pct: number }) {
  const hot = pct >= 40;
  return (
    <span
      className={`rounded-none px-2 py-0.5 text-[11px] font-semibold ${
        hot
          ? "bg-[#EFF6FF] text-[#2563EB] ring-1 ring-[#93C5FD]"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      }`}
    >
      ▲ {pct}% {hot && "🔥"}
    </span>
  );
}

export function TrendingHashtagsTable({ hashtags }: { hashtags: TrendingHashtag[] }) {
  const sorted = [...hashtags].sort((a, b) => b.growthPct - a.growthPct);
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr>
            {["Hashtag", "Jumlah video", "Growth WoW", "Relevansi"].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={4}>
                Belum ada data tren untuk filter ini.
              </td>
            </tr>
          )}
          {sorted.map((h) => (
            <tr key={h.hashtag} className="gfx-row-border">
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{h.hashtag}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(h.videoCount)}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <GrowthBadge pct={h.growthPct} />
              </td>
              <td className="px-3 py-2 text-[#7A8AA3]">{h.relevance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TrendingSoundsTable({ sounds }: { sounds: TrendingSound[] }) {
  const sorted = [...sounds].sort((a, b) => b.growthPct - a.growthPct);
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr>
            {["Sound", "Artist", "Jumlah dipakai", "Growth WoW"].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={4}>
                Belum ada data tren untuk filter ini.
              </td>
            </tr>
          )}
          {sorted.map((s) => (
            <tr key={s.soundName} className="gfx-row-border">
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{s.soundName}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#7A8AA3]">{s.artistName}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(s.usageCount)}</td>
              <td className="whitespace-nowrap px-3 py-2">
                <GrowthBadge pct={s.growthPct} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
