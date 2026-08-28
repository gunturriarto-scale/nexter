import { KolDiscoveryCandidate } from "@/lib/kol/types";
import { formatCompact, formatPercent } from "@/lib/kol/format";
import { Avatar, TierBadge } from "@/app/kol/ui";

export function DiscoveryTable({ candidates }: { candidates: KolDiscoveryCandidate[] }) {
  return (
    <div className="gfx-table-wrap overflow-x-auto">
      <table className="w-full min-w-[1040px] text-left text-sm">
        <thead>
          <tr>
            {["Kandidat", "Tier", "Fokus produk yang dipitch", "Follower", "Engagement", "Sumber tren", "Kenapa muncul"].map((h) => (
              <th key={h} className="gfx-th px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.length === 0 && (
            <tr>
              <td className="px-3 py-4 text-[#7A8AA3]" colSpan={7}>
                Belum ada kandidat untuk filter ini.
              </td>
            </tr>
          )}
          {candidates.map((c) => (
            <tr key={c.username} className="gfx-row-border">
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <Avatar seed={c.avatarSeed} label={c.displayName} size={28} />
                  <div>
                    <div className="font-semibold text-[#14213D]">{c.displayName}</div>
                    <div className="text-xs text-[#7A8AA3]">{c.username}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <TierBadge followerCount={c.followerCount} />
              </td>
              <td className="px-3 py-2 text-[#7A8AA3]">{c.productFocus}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatCompact(c.followerCount)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-[#4B5D78]">{formatPercent(c.engagementRate)}</td>
              <td className="whitespace-nowrap px-3 py-2">
                {c.sourceTrend ? (
                  <span className="rounded-none bg-[#EEF4FF] px-1.5 py-0.5 text-[11px] font-medium text-[#0891B2]">
                    {c.sourceTrend}
                  </span>
                ) : (
                  <span className="text-[#91A0B5]">—</span>
                )}
              </td>
              <td className="px-3 py-2 text-[#7A8AA3]">{c.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-[#EDF3F8] px-3 py-2 text-[11px] text-[#7A8AA3]">
        Sumber: ScrapeCreators (hashtag/keyword search) + Seller Search Creator on Marketplace — kandidat
        yang belum jadi bagian roster Creator.
      </p>
    </div>
  );
}
