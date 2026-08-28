import { MarketSizeView } from "@/lib/market-intel/aggregate";
import { formatIdrCompact, formatPct, formatGrowthPct } from "@/lib/market-intel/format";

export function MarketSizeBanner({ view }: { view: MarketSizeView }) {
  // share of the tracked-brand pool (among the 6 benchmarked brands), so the
  // "ranking #4 of 6" reads consistently with the KPI "market share".
  const trackedPoolShare = view.glowShare;
  const winningShare = trackedPoolShare >= view.leaderShare;
  return (
    <div className="gfx-card gfx-gradient-soft p-6 ring-1 ring-[#93C5FD]/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#0891B2]">
            Posisi pasar Glow FX
          </div>
          <div className="mt-2 font-serif text-4xl font-semibold text-[#14213D]">
            {formatPct(view.glowShare)} <span className="text-2xl text-[#7A8AA3]">dari total market</span>
          </div>
          <p className="mt-2 text-sm text-[#4B5D78]">
            Market skincare ID yang dipantau senilai{" "}
            <span className="font-semibold text-[#14213D]">{formatIdrCompact(view.totalMarket)}</span>{" "}
            ({view.categoryCount} sub-kategori), tumbuh {formatGrowthPct(view.marketGrowth)}. Glow FX
            revenue {formatIdrCompact(view.glowRevenue)} — ranking{" "}
            <span className="font-semibold text-[#2563EB]">#{view.glowShareRank}</span> dari 6 brand
            yang dipantau.
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="text-xs text-[#7A8AA3]">Leader share</div>
          <div className="font-serif text-2xl font-semibold text-[#0891B2]">
            {formatPct(view.leaderShare)}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-none bg-white/70 p-3 text-sm">
        <span className="text-xl">{winningShare ? "🏆" : "🎯"}</span>
        <span className="text-[#4B5D78]">
          {winningShare
            ? "Glow FX memimpin share di benchmark ini — pertahankan momentum growth."
            : `Masih ada gap ke leader — tapi Glow FX sedang ambil share (growth di atas rata-rata pasar ${formatGrowthPct(view.marketGrowth)}).`}
        </span>
      </div>
    </div>
  );
}
