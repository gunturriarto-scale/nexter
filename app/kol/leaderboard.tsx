import { LeaderboardRow } from "@/lib/kol/aggregate";
import { formatCompact, formatPercent, formatRoi, formatCurrency } from "@/lib/kol/format";
import { Avatar, SourceBadge, TierBadge } from "@/app/kol/ui";

export function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr>
            {["Creator", "Tier", "Fokus produk", "Follower", "Post", "Total views", "Avg. engagement", "Paid (GMV Max)"].map(
              (h) => (
                <th key={h} className="gfx-th px-3 py-2">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={8}>
                Belum ada Creator untuk filter ini.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.creator.creatorId} className="gfx-row-border">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar seed={r.creator.avatarSeed} label={r.creator.displayName} size={32} />
                  <div>
                    <div className="font-semibold text-[#14213D]">{r.creator.displayName}</div>
                    <div className="flex items-center gap-1 text-xs text-[#7A8AA3]">
                      {r.creator.username}
                      <SourceBadge source={r.creator.source} />
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <TierBadge followerCount={r.creator.followerCount} />
              </td>
              <td className="px-3 py-2 text-[#7A8AA3]">{r.creator.productFocus}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(r.creator.followerCount)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{r.postCount}</td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold text-[#14213D]">{formatCompact(r.totalViews)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatPercent(r.avgEngagementRate)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">
                {r.paidCost !== null ? (
                  <span>
                    {formatCurrency(r.paidCost)} cost · {formatRoi(r.paidRoi ?? 0)} ROI
                  </span>
                ) : (
                  <span className="text-neutral-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        Paid (GMV Max) cuma keisi kalau video Creator ini juga jalan sebagai creative berbayar — join dari
        GMV Max report dimensions=[item_id].
      </p>
    </div>
  );
}
